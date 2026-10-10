import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import { fileURLToPath } from 'url';
import multer from 'multer';
import { db } from './server/db.js';
import { User, MediaAsset, Story } from './src/types/index.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export interface AuthenticatedRequest extends Request {
  user?: User;
  token?: string;
}

// Authentication middleware
function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split('Bearer ')[1].trim();
  const session = db.getSession(token);
  if (!session) {
    return next();
  }

  const user = db.getUserById(session.userId);
  if (user) {
    req.user = user;
    req.token = token;
  }
  next();
}

function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
}

function requireRole(roles: User['role'][]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Permission denied for this operation' });
    }
    next();
  };
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  const isProd = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(authMiddleware);

  const api = express.Router();

  // --- Real-Time SSE Setup ---
  interface SSEClient {
    id: string;
    userId?: string;
    res: Response;
  }
  const sseClients: Map<string, SSEClient> = new Map();

  function broadcastFeedEvent(event: string, payload: any) {
    const message = `event: ${event}\ndata: ${JSON.stringify({ event, data: payload, timestamp: new Date().toISOString() })}\n\n`;
    for (const [id, client] of sseClients.entries()) {
      try {
        client.res.write(message);
      } catch {
        sseClients.delete(id);
      }
    }
  }

  api.get('/feed/stream', (req: AuthenticatedRequest, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const client: SSEClient = { id: clientId, userId: req.user?.id, res };
    sseClients.set(clientId, client);

    res.write(`event: connected\ndata: ${JSON.stringify({ clientId, timestamp: new Date().toISOString() })}\n\n`);

    const heartbeat = setInterval(() => {
      try {
        res.write(': ping\n\n');
      } catch {
        clearInterval(heartbeat);
        sseClients.delete(clientId);
      }
    }, 25000);

    req.on('close', () => {
      clearInterval(heartbeat);
      sseClients.delete(clientId);
    });
  });

  // --- Media Upload Infrastructure & HTTP Range Streaming ---
  const UPLOADS_DIR = path.resolve(process.cwd(), 'data', 'uploads');
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOADS_DIR);
    },
    filename: (_req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const safeName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
      cb(null, safeName);
    }
  });

  const upload = multer({
    storage,
    limits: {
      fileSize: 50 * 1024 * 1024 // 50MB maximum video limit
    },
    fileFilter: (_req, file, cb) => {
      const allowedMimes = [
        'image/jpeg', 'image/png', 'image/webp', 'image/gif',
        'video/mp4', 'video/webm', 'video/quicktime',
        'application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
      ];
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file type: ${file.mimetype}`));
      }
    }
  });

  function serveMediaWithRanges(req: Request, res: Response) {
    const filename = path.basename(req.params.filename);
    const filePath = path.join(UPLOADS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Media asset not found' });
    }

    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const ext = path.extname(filename).toLowerCase();
    const mimeMap: Record<string, string> = {
      '.mp4': 'video/mp4',
      '.webm': 'video/webm',
      '.mov': 'video/quicktime',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    const contentType = mimeMap[ext] || 'application/octet-stream';

    const range = req.headers.range;
    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      if (start >= fileSize || end >= fileSize) {
        res.setHeader('Content-Range', `bytes */${fileSize}`);
        return res.status(416).send('Requested range not satisfiable');
      }

      const chunksize = end - start + 1;
      const fileStream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, immutable'
      });
      fileStream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=86400, immutable'
      });
      fs.createReadStream(filePath).pipe(res);
    }
  }

  app.get('/uploads/:filename', serveMediaWithRanges);
  api.get('/media/:filename', serveMediaWithRanges);

  api.post('/media/upload', requireAuth, upload.single('file'), (req: AuthenticatedRequest, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No media file provided' });
    }

    const file = req.file;
    const isVideo = file.mimetype.startsWith('video/');
    const isImage = file.mimetype.startsWith('image/');
    const mediaType = isVideo ? 'video' : isImage ? 'image' : 'document';

    const duration = req.body.duration ? parseFloat(req.body.duration) : undefined;
    const width = req.body.width ? parseInt(req.body.width, 10) : undefined;
    const height = req.body.height ? parseInt(req.body.height, 10) : undefined;
    const aspectRatio = req.body.aspectRatio || (width && height ? (height > width ? '4:5' : width === height ? '1:1' : '16:9') : undefined);
    const posterUrl = req.body.posterUrl || undefined;

    const mediaAsset: MediaAsset = {
      id: `media_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`,
      ownerId: req.user!.id,
      mediaType,
      mimeType: file.mimetype,
      fileSize: file.size,
      duration,
      width,
      height,
      aspectRatio,
      storagePath: file.filename,
      publicUrl: `/uploads/${file.filename}`,
      posterUrl,
      uploadStatus: 'ready',
      createdAt: new Date().toISOString()
    };

    db.saveMediaAsset(mediaAsset);

    res.status(201).json({
      mediaAsset,
      url: `/uploads/${file.filename}`,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    });
  });

  // --- Stories Endpoints ---

  api.get('/stories', (req: AuthenticatedRequest, res) => {
    const stories = db.getStories(req.user?.id);
    res.json(stories);
  });

  api.post('/stories', requireAuth, (req: AuthenticatedRequest, res) => {
    const { mediaType, mediaUrl, previewUrl, caption, duration, storyType, isOfficialGazetteAlert } = req.body;
    if (!mediaType || !mediaUrl) {
      return res.status(400).json({ error: 'mediaType and mediaUrl are required' });
    }

    try {
      const story = db.createStory(req.user!.id, {
        mediaType,
        mediaUrl,
        previewUrl,
        caption,
        duration: duration ? Math.min(Number(duration), 15) : undefined,
        storyType,
        isOfficialGazetteAlert: !!isOfficialGazetteAlert
      });
      broadcastFeedEvent('story:created', story);
      res.status(201).json(story);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.post('/stories/:id/view', requireAuth, (req: AuthenticatedRequest, res) => {
    const result = db.recordStoryView(req.params.id, req.user!.id);
    res.json(result);
  });

  api.delete('/stories/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const success = db.deleteStory(req.params.id, req.user!.id);
      res.json({ success });
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  // --- Auth Endpoints ---

  api.post('/auth/login', (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) {
      return res.status(400).json({ error: 'Email/Username and password are required' });
    }

    const user = db.authenticate(identifier, password);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your username/email and password.' });
    }

    const token = db.createSession(user.id);
    res.json({ user, token });
  });

  api.post('/auth/switch-user', (req, res) => {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    const user = db.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    const token = db.createSession(user.id);
    res.json({ user, token });
  });

  api.post('/auth/register', (req, res) => {
    const { name, username, email, password, role, practiceAreas, barRollNumber, firmName, location } = req.body;
    if (!name || !username || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, username, email, password, and role are required' });
    }

    const existingUser = db.findUserByIdentifier(username);
    if (existingUser) {
      return res.status(409).json({ error: `Username @${username} is already registered.` });
    }

    const existingEmail = db.findUserByIdentifier(email);
    if (existingEmail) {
      return res.status(409).json({ error: `An account with email ${email} already exists.` });
    }

    try {
      const result = db.registerUser({
        name,
        username,
        email,
        password,
        role,
        practiceAreas,
        barRollNumber,
        firmName,
        location
      });
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Registration failed' });
    }
  });

  api.get('/auth/me', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json({ user: req.user });
  });

  api.post('/auth/logout', requireAuth, (req: AuthenticatedRequest, res) => {
    if (req.token) {
      db.revokeSession(req.token);
    }
    res.json({ success: true });
  });

  api.post('/auth/forgot-password', (req, res) => {
    const { identifier } = req.body;
    if (!identifier) {
      return res.status(400).json({ error: 'Email or username is required' });
    }

    const result = db.requestPasswordReset(identifier);
    if (!result.success) {
      return res.status(404).json({ error: 'No account found with this identifier' });
    }

    res.json({
      success: true,
      message: 'Password reset token generated. In a live system, this is sent via verified email.',
      resetToken: result.token,
      email: result.email
    });
  });

  api.post('/auth/reset-password', (req, res) => {
    const { resetToken, newPassword } = req.body;
    if (!resetToken || !newPassword) {
      return res.status(400).json({ error: 'Reset token and new password are required' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    const success = db.resetPassword(resetToken, newPassword);
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    res.json({ success: true, message: 'Password has been reset successfully. You may now sign in.' });
  });

  // --- Users Endpoints ---

  api.get('/users', (req, res) => {
    const query = req.query.q as string | undefined;
    let users = db.getUsers();
    if (query) {
      const q = query.toLowerCase();
      users = users.filter(u =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        (u.practiceAreas && u.practiceAreas.some(p => p.toLowerCase().includes(q))) ||
        (u.professionalTitle && u.professionalTitle.toLowerCase().includes(q))
      );
    }
    res.json(users);
  });

  api.get('/users/:id', (req, res) => {
    const user = db.getUserById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  });

  api.patch('/users/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const updated = db.updateUserProfile(req.user!.id, req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.post('/users/:id/follow', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const result = db.toggleFollow(req.user!.id, req.params.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Posts Endpoints ---

  api.get('/posts', (req: AuthenticatedRequest, res) => {
    const { topic, tag, authorId, communityId, q, tab, cursor, limit, format } = req.query;

    if (cursor !== undefined || limit !== undefined || tab !== undefined || format === 'paginated') {
      const result = db.getPostsPaginated({
        topic: topic as string,
        tag: tag as string,
        authorId: authorId as string,
        communityId: communityId as string,
        query: q as string,
        tab: tab as string,
        currentUserId: req.user?.id,
        cursor: cursor as string,
        limit: limit ? parseInt(limit as string, 10) : 15
      });
      return res.json(result);
    }

    const posts = db.getPosts({
      topic: topic as string,
      tag: tag as string,
      authorId: authorId as string,
      communityId: communityId as string,
      query: q as string
    });
    res.json(posts);
  });

  api.get('/posts/:id', (req, res) => {
    const post = db.getPostById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post not found' });
    res.json(post);
  });

  api.post('/posts', requireAuth, (req: AuthenticatedRequest, res) => {
    const { content, legalTopic, tags, attachments, audience, communityId, quotedPostId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Post content cannot be empty' });
    }

    try {
      const post = db.createPost({
        authorId: req.user!.id,
        content: content.trim(),
        legalTopic,
        tags,
        attachments,
        audience,
        communityId,
        quotedPostId
      });
      broadcastFeedEvent('post:created', post);
      res.status(201).json(post);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.patch('/posts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content cannot be empty' });
    }
    try {
      const updated = db.updatePost(req.params.id, req.user!.id, content.trim());
      if (!updated) return res.status(404).json({ error: 'Post not found' });
      broadcastFeedEvent('post:updated', updated);
      res.json(updated);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  api.delete('/posts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const success = db.deletePost(req.params.id, req.user!.id);
      if (!success) return res.status(404).json({ error: 'Post not found' });
      broadcastFeedEvent('post:deleted', { postId: req.params.id });
      res.json({ success: true });
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  api.post('/posts/:id/like', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const result = db.toggleLike(req.params.id, req.user!.id);
      broadcastFeedEvent('post:liked', result);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.post('/posts/:id/repost', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const result = db.toggleRepost(req.params.id, req.user!.id);
      broadcastFeedEvent('post:reposted', result);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.post('/posts/:id/bookmark', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const result = db.toggleBookmark(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Replies ---

  api.get('/posts/:id/replies', (req, res) => {
    const replies = db.getReplies(req.params.id);
    res.json(replies);
  });

  api.post('/posts/:id/replies', requireAuth, (req: AuthenticatedRequest, res) => {
    const { content, parentReplyId } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Reply content cannot be empty' });
    }

    try {
      const reply = db.createReply(req.params.id, req.user!.id, content.trim(), parentReplyId);
      broadcastFeedEvent('post:reply', { postId: req.params.id, reply });
      res.status(201).json(reply);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.post('/replies/:id/like', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const result = db.toggleReplyLike(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Communities ---

  api.get('/communities', (req, res) => {
    res.json(db.getCommunities());
  });

  api.post('/communities', requireAuth, (req: AuthenticatedRequest, res) => {
    const { name, kigaliName, topic, description, rules, officialSource } = req.body;
    if (!name || !topic || !description) {
      return res.status(400).json({ error: 'Name, topic, and description are required' });
    }

    try {
      const comm = db.createCommunity(req.user!.id, {
        name,
        kigaliName,
        topic,
        description,
        rules: rules || ['Civic respectful discussion required'],
        officialSource
      });
      res.status(201).json(comm);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  api.post('/communities/:id/join', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const result = db.toggleJoinCommunity(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Services ---

  api.get('/services', (req, res) => {
    res.json(db.getLegalServices());
  });

  api.post('/services', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const svc = db.createLegalService(req.user!.id, req.body);
      res.status(201).json(svc);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Appointments ---

  api.get('/appointments', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(db.getAppointments(req.user!.id));
  });

  api.post('/appointments', requireAuth, (req: AuthenticatedRequest, res) => {
    const { serviceId, advocateId, serviceTitle, date, timeSlot, format, feeRWF, clientNotes } = req.body;
    if (!advocateId || !serviceTitle || !date || !timeSlot || !format) {
      return res.status(400).json({ error: 'Missing required appointment parameters' });
    }

    try {
      const apt = db.createAppointment(req.user!.id, {
        serviceId,
        advocateId,
        serviceTitle,
        date,
        timeSlot,
        format,
        feeRWF: Number(feeRWF) || 0,
        clientNotes: clientNotes || ''
      });
      res.status(201).json(apt);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.patch('/appointments/:id/status', requireAuth, (req: AuthenticatedRequest, res) => {
    const { status, notes } = req.body;
    if (!status) return res.status(400).json({ error: 'Status is required' });

    try {
      const updated = db.updateAppointmentStatus(req.params.id, req.user!.id, status, notes);
      res.json(updated);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  // --- Legal Aid & Laws & News ---

  api.get('/legalaid', (req, res) => {
    res.json(db.getLegalAidProviders());
  });

  api.get('/laws', (req, res) => {
    const { category, q } = req.query;
    res.json(db.getLaws(category as string, q as string));
  });

  api.get('/news', (req, res) => {
    res.json(db.getLegalNews());
  });

  api.post('/news', requireAuth, requireRole(['institution', 'admin']), (req: AuthenticatedRequest, res) => {
    const { title, titleRw, category, summary, fullBody, isOfficialGazetteAlert, readTimeMinutes, officialSourceUrl } = req.body;
    if (!title || !category || !summary || !fullBody) {
      return res.status(400).json({ error: 'Title, category, summary, and full body are required' });
    }

    try {
      const item = db.createLegalNews(req.user!.id, {
        title,
        titleRw,
        category,
        summary,
        fullBody,
        isOfficialGazetteAlert: !!isOfficialGazetteAlert,
        readTimeMinutes,
        officialSourceUrl
      });
      res.status(201).json(item);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // --- Conversations & Messages ---

  api.get('/conversations', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(db.getConversations(req.user!.id));
  });

  api.post('/conversations', requireAuth, (req: AuthenticatedRequest, res) => {
    const { recipientId } = req.body;
    if (!recipientId) return res.status(400).json({ error: 'recipientId is required' });

    const conv = db.getOrCreateConversation(req.user!.id, recipientId);
    res.json(conv);
  });

  api.get('/conversations/:id/messages', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const msgs = db.getMessages(req.params.id, req.user!.id);
      res.json(msgs);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  api.post('/conversations/:id/messages', requireAuth, (req: AuthenticatedRequest, res) => {
    const { content, attachments } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Message content cannot be empty' });
    }

    try {
      const msg = db.sendMessage(req.params.id, req.user!.id, content.trim(), attachments);
      res.status(201).json(msg);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  // --- Notifications ---

  api.get('/notifications', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(db.getNotifications(req.user!.id));
  });

  api.patch('/notifications/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
    const success = db.markNotificationAsRead(req.params.id, req.user!.id);
    res.json({ success });
  });

  api.patch('/notifications/read-all', requireAuth, (req: AuthenticatedRequest, res) => {
    db.markAllNotificationsAsRead(req.user!.id);
    res.json({ success: true });
  });

  api.delete('/notifications/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    const success = db.deleteNotification(req.params.id, req.user!.id);
    res.json({ success });
  });

  // --- Verifications & Moderation ---

  api.get('/verifications', requireAuth, (req: AuthenticatedRequest, res) => {
    res.json(db.getVerifications(req.user!.id));
  });

  api.post('/verifications', requireAuth, (req: AuthenticatedRequest, res) => {
    const { barRollNumber, lawFirmName, yearsOfExperience, practiceAreas, diplomaDocumentUrl, barCertificateUrl } = req.body;
    if (!barRollNumber || !lawFirmName) {
      return res.status(400).json({ error: 'Bar roll number and firm name are required' });
    }

    try {
      const appRecord = db.submitVerification(req.user!.id, {
        barRollNumber,
        lawFirmName,
        yearsOfExperience: Number(yearsOfExperience) || 1,
        practiceAreas: practiceAreas || ['General Practice'],
        diplomaDocumentUrl,
        barCertificateUrl
      });
      res.status(201).json(appRecord);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.patch('/verifications/:id/review', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const { decision, notes } = req.body;
    if (decision !== 'approved' && decision !== 'rejected') {
      return res.status(400).json({ error: 'Decision must be approved or rejected' });
    }

    try {
      const reviewed = db.reviewVerification(req.params.id, req.user!.id, decision, notes);
      res.json(reviewed);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.get('/reports', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    res.json(db.getReports(req.user!.id));
  });

  api.post('/reports', requireAuth, (req: AuthenticatedRequest, res) => {
    const { targetType, targetId, targetPreview, category, details } = req.body;
    if (!targetType || !targetId || !category || !details) {
      return res.status(400).json({ error: 'Missing required report fields' });
    }

    try {
      const report = db.submitReport(req.user!.id, {
        targetType,
        targetId,
        targetPreview: targetPreview || 'Item preview',
        category,
        details
      });
      res.status(201).json(report);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.patch('/reports/:id/resolve', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const { actionTaken, notes } = req.body;
    try {
      const resolved = db.resolveReport(req.params.id, req.user!.id, !!actionTaken, notes || '');
      res.json(resolved);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.get('/admin/audit-logs', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    res.json(db.getAuditLogs(req.user!.id));
  });

  api.get('/admin/stats', requireAuth, requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    res.json(db.getAdminStats(req.user!.id));
  });

  api.post('/dev/reset', requireAuth, requireRole(['admin']), (req, res) => {
    db.resetToInitial();
    res.json({ success: true, message: 'Database reset to verified initial state.' });
  });

  // Mount API router
  app.use('/api', api);

  // Development vs Production serving
  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Lex Hafi Yawe production-ready server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
