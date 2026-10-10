import React, { useState, useRef } from 'react';
import {
  FileText,
  ShieldAlert,
  Send,
  X,
  BookmarkCheck,
  LogIn,
  Paperclip,
  BookOpen,
  Image as ImageIcon,
  FileVideo,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/i18n';
import { UserAvatar } from '../common/UserAvatar';
import { PostAttachment } from '../../types';
import { api } from '../../api/client';
import {
  extractVideoPoster,
  probeImageDimensions,
  formatBytes,
  MAX_VIDEO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_VIDEO_DURATION_SECONDS
} from '../../utils/mediaUtils';

interface PostComposerProps {
  onPostCreated?: () => void;
  communityId?: string;
  defaultTopic?: string;
  isModal?: boolean;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  onPostCreated,
  communityId,
  defaultTopic,
  isModal = false
}) => {
  const { currentUser, createPost, language, openLoginModal } = useApp();
  const t = useTranslation(language);

  const [content, setContent] = useState('');
  const [legalTopic, setLegalTopic] = useState(defaultTopic || 'General Legal');
  const [audience, setAudience] = useState<'public' | 'followers'>('public');
  const [attachments, setAttachments] = useState<PostAttachment[]>([]);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

  // Upload Progress & Validation States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const filePickerRef = useRef<HTMLInputElement>(null);
  const docPickerRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 500;
  const remainingChars = MAX_CHARS - content.length;

  const topics = [
    'General Legal',
    'Land & Property',
    'Labor & Employment',
    'Commercial & Companies',
    'Criminal & Constitutional',
    'Family & Succession',
    'Data Protection & Tech',
    'Taxation & Regulatory',
    'Alternative Dispute Resolution (Abunzi)'
  ];

  if (!currentUser) {
    return (
      <div className="bg-white border-b border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-left">
          <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            LX
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900">
              Join the Legal Conversation
            </h3>
            <p className="text-2xs text-slate-500">
              Sign in or create an account to share legal knowledge, ask questions, or consult advocates.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={openLoginModal}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Post</span>
        </button>
      </div>
    );
  }

  // Handle Photo or Video Media Upload (Carousels up to 10 items)
  const handleMediaPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setErrorMessage(null);

    // Limit to max 10 media items total
    const existingMediaCount = attachments.filter(a => a.type === 'image' || a.type === 'video').length;
    if (existingMediaCount + files.length > 10) {
      setErrorMessage('You can attach up to 10 media items in one post.');
      return;
    }

    setIsUploading(true);

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const isVid = file.type.startsWith('video/');
        const isImg = file.type.startsWith('image/');

        if (!isVid && !isImg) {
          setErrorMessage(`Skipped ${file.name}: unsupported format.`);
          continue;
        }

        if (isVid && file.size > MAX_VIDEO_SIZE_BYTES) {
          setErrorMessage(`Video ${file.name} exceeds the 50 MB limit (${formatBytes(file.size)}).`);
          continue;
        }

        if (isImg && file.size > MAX_IMAGE_SIZE_BYTES) {
          setErrorMessage(`Image ${file.name} exceeds the 15 MB limit (${formatBytes(file.size)}).`);
          continue;
        }

        let posterUrl = '';
        let duration: number | undefined;
        let width: number | undefined;
        let height: number | undefined;
        let aspectRatio: '1:1' | '4:5' | '16:9' | '9:16' = '4:5';

        if (isVid) {
          try {
            const meta = await extractVideoPoster(file);
            if (meta.duration > MAX_VIDEO_DURATION_SECONDS) {
              setErrorMessage(`Video ${file.name} is ${Math.round(meta.duration)}s. Maximum allowed duration is 120 seconds.`);
              continue;
            }
            duration = meta.duration;
            width = meta.width;
            height = meta.height;
            aspectRatio = meta.aspectRatio;
            posterUrl = meta.posterDataUrl;
          } catch {
            duration = 30;
          }
        } else {
          try {
            const dims = await probeImageDimensions(file);
            width = dims.width;
            height = dims.height;
            aspectRatio = dims.aspectRatio;
          } catch {}
        }

        // Upload to server endpoint
        const uploadRes = await api.uploadMedia(file, {
          duration,
          width,
          height,
          aspectRatio,
          posterUrl,
          onProgress: (percent, loaded, total) => {
            setUploadProgress(percent);
            setUploadedBytes(loaded);
            setTotalBytes(total);
          }
        });

        const newAttachment: PostAttachment = {
          type: isVid ? 'video' : 'image',
          url: uploadRes.url,
          name: file.name,
          fileSize: formatBytes(file.size),
          mimeType: file.type,
          previewUrl: posterUrl || uploadRes.url,
          aspectRatio,
          width,
          height,
          duration,
          storageKey: uploadRes.mediaAsset?.storagePath
        };

        setAttachments(prev => [...prev, newAttachment]);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Media upload failed.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (filePickerRef.current) filePickerRef.current.value = '';
    }
  };

  // Handle Document Upload (PDF, DOC, DOCX)
  const handleDocPicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);
    setIsUploading(true);

    try {
      const uploadRes = await api.uploadMedia(file, {
        onProgress: (percent, loaded, total) => {
          setUploadProgress(percent);
          setUploadedBytes(loaded);
          setTotalBytes(total);
        }
      });

      const docAttachment: PostAttachment = {
        type: 'document',
        url: uploadRes.url,
        name: file.name,
        fileSize: formatBytes(file.size),
        mimeType: file.type,
        storageKey: uploadRes.mediaAsset?.storagePath
      };

      setAttachments(prev => [...prev, docAttachment]);
    } catch (err: any) {
      setErrorMessage(err.message || 'Document upload failed.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (docPickerRef.current) docPickerRef.current.value = '';
    }
  };

  const handleAddStatuteCitation = () => {
    const statuteDoc: PostAttachment = {
      type: 'law_reference',
      url: '#official-gazette-citation',
      name: `Official Gazette Statutory Citation (${legalTopic})`,
      fileSize: 'Statutory Extract'
    };
    setAttachments(prev => [...prev, statuteDoc]);
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const moveAttachment = (index: number, direction: 'left' | 'right') => {
    const newAttachments = [...attachments];
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAttachments.length) return;

    const temp = newAttachments[index];
    newAttachments[index] = newAttachments[targetIndex];
    newAttachments[targetIndex] = temp;
    setAttachments(newAttachments);
  };

  const handleSaveDraft = () => {
    if (!content.trim()) return;
    localStorage.setItem('lex_composer_draft', JSON.stringify({ content, legalTopic, audience }));
    setHasSavedDraft(true);
    setTimeout(() => setHasSavedDraft(false), 2500);
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() && attachments.length === 0) return;
    if (isUploading) return;

    const tagsFound = content.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.replace('#', '')) || [];
    const finalTags = tagsFound.length ? tagsFound : [legalTopic.replace(/\s+/g, '')];

    await createPost(content.trim(), legalTopic, finalTags, attachments, audience, communityId);

    setContent('');
    setAttachments([]);
    setErrorMessage(null);
    localStorage.removeItem('lex_composer_draft');
    if (onPostCreated) onPostCreated();
  };

  return (
    <div
      className={`bg-white border-b border-slate-200 p-4 ${
        isModal ? 'border-none p-0' : ''
      }`}
    >
      {/* Confidentiality Warning */}
      <div className="flex items-start gap-2 bg-amber-50/80 border border-amber-200/70 rounded-xl p-2.5 mb-3 text-amber-900 text-xs">
        <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <p className="leading-snug text-2xs text-amber-800">
          <strong className="font-semibold text-amber-900">Confidentiality Safeguard:</strong>{' '}
          {t.composerConfidentialityWarning}
        </p>
      </div>

      <div className="flex gap-3">
        <UserAvatar user={currentUser} size="md" />

        <div className="flex-1 min-w-0">
          {/* Post Audience & Topic Selectors */}
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <select
              value={audience}
              onChange={e => setAudience(e.target.value as 'public' | 'followers')}
              className="text-xs bg-slate-100 hover:bg-slate-200/70 border border-slate-200 text-slate-700 py-1 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-medium"
            >
              <option value="public">🌐 {t.postAudiencePublic}</option>
              <option value="followers">👥 {t.postAudienceFollowers}</option>
            </select>

            <select
              value={legalTopic}
              onChange={e => setLegalTopic(e.target.value)}
              className="text-xs bg-blue-50 hover:bg-blue-100/70 border border-blue-200 text-blue-800 py-1 px-2.5 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-600 font-semibold"
            >
              {topics.map(topic => (
                <option key={topic} value={topic}>
                  ⚖️ {topic}
                </option>
              ))}
            </select>
          </div>

          {/* Text Area */}
          <textarea
            data-composer-input="true"
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t.composerPlaceholder}
            rows={3}
            maxLength={MAX_CHARS}
            className="w-full resize-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed bg-transparent"
          />

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="my-2 p-2.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
              <div className="flex items-center justify-between text-2xs font-bold text-blue-900">
                <span>Uploading {uploadProgress}%</span>
                <span>
                  {formatBytes(uploadedBytes)} of {formatBytes(totalBytes)}
                </span>
              </div>
              <div className="w-full h-1.5 bg-blue-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-700 transition-all duration-150 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="my-2 p-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Attached Files & Carousel Previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700"
                >
                  {att.type === 'video' ? (
                    <FileVideo className="w-4 h-4 text-purple-600 shrink-0" />
                  ) : att.type === 'image' ? (
                    <ImageIcon className="w-4 h-4 text-blue-600 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}

                  <span className="font-medium truncate max-w-[140px]">{att.name}</span>

                  {/* Reorder Buttons */}
                  {attachments.length > 1 && (
                    <div className="flex items-center gap-0.5">
                      {idx > 0 && (
                        <button
                          type="button"
                          onClick={() => moveAttachment(idx, 'left')}
                          className="p-0.5 text-slate-400 hover:text-slate-700 rounded"
                          title="Move left"
                        >
                          <ChevronLeft className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {idx < attachments.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveAttachment(idx, 'right')}
                          className="p-0.5 text-slate-400 hover:text-slate-700 rounded"
                          title="Move right"
                        >
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => removeAttachment(idx)}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Bottom Toolbar & Publish */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-1 text-slate-500">
              {/* Media input (Photos & Videos) */}
              <input
                type="file"
                ref={filePickerRef}
                onChange={handleMediaPicked}
                multiple
                className="hidden"
                accept="image/*,video/mp4,video/webm,video/quicktime"
              />
              <button
                type="button"
                onClick={() => filePickerRef.current?.click()}
                disabled={isUploading}
                title="Add Photos or Video"
                className="p-1.5 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition flex items-center gap-1 text-2xs font-semibold cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Photo/Video</span>
              </button>

              {/* Document input */}
              <input
                type="file"
                ref={docPickerRef}
                onChange={handleDocPicked}
                className="hidden"
                accept=".pdf,.doc,.docx,.txt"
              />
              <button
                type="button"
                onClick={() => docPickerRef.current?.click()}
                disabled={isUploading}
                title="Attach Document / PDF"
                className="p-1.5 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition flex items-center gap-1 text-2xs font-semibold cursor-pointer"
              >
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Attach Doc</span>
              </button>

              {/* Cite Law */}
              <button
                type="button"
                onClick={handleAddStatuteCitation}
                title="Add Statutory Citation"
                className="p-1.5 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition flex items-center gap-1 text-2xs font-semibold cursor-pointer"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Cite Law</span>
              </button>

              {/* Save Draft */}
              <button
                type="button"
                onClick={handleSaveDraft}
                title={t.btnSaveDraft}
                className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition text-2xs font-medium flex items-center gap-1 cursor-pointer"
              >
                <BookmarkCheck className="w-3.5 h-3.5" />
                {hasSavedDraft && <span className="text-2xs text-emerald-600 font-bold">Saved!</span>}
              </button>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-2xs font-semibold ${
                  remainingChars < 50 ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                {remainingChars}
              </span>

              <button
                type="button"
                onClick={() => handleSubmit()}
                disabled={(!content.trim() && attachments.length === 0) || isUploading}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  (content.trim() || attachments.length > 0) && !isUploading
                    ? 'bg-[#D36B2E] hover:bg-[#B8551E] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isUploading ? 'Uploading...' : t.btnPublish}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
