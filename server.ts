import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './server/db.js';
import { User } from './src/types/index.js';

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

  api.get('/posts', (req, res) => {
    const { topic, tag, authorId, communityId, q } = req.query;
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
      res.json(updated);
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  api.delete('/posts/:id', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const success = db.deletePost(req.params.id, req.user!.id);
      if (!success) return res.status(404).json({ error: 'Post not found' });
      res.json({ success: true });
    } catch (err: any) {
      res.status(403).json({ error: err.message });
    }
  });

  api.post('/posts/:id/like', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const result = db.toggleLike(req.params.id, req.user!.id);
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  api.post('/posts/:id/repost', requireAuth, (req: AuthenticatedRequest, res) => {
    try {
      const result = db.toggleRepost(req.params.id, req.user!.id);
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
