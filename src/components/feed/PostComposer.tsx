import React, { useState } from 'react';
import {
  FileText,
  ShieldAlert,
  Globe,
  Users,
  Send,
  X,
  Sparkles,
  BookmarkCheck,
  LogIn,
  Paperclip,
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/i18n';
import { UserAvatar } from '../common/UserAvatar';
import { PostAttachment } from '../../types';

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
  const [isAttachingDoc, setIsAttachingDoc] = useState(false);
  const [docName, setDocName] = useState('');
  const [hasSavedDraft, setHasSavedDraft] = useState(false);

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
          onClick={openLoginModal}
          className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs shrink-0 cursor-pointer"
        >
          <LogIn className="w-4 h-4" />
          <span>Sign In to Post</span>
        </button>
      </div>
    );
  }

  const handleAddDoc = () => {
    if (!docName.trim()) return;
    const newDoc: PostAttachment = {
      type: 'document',
      url: `#doc-${encodeURIComponent(docName.trim())}`,
      name: docName.trim().endsWith('.pdf') ? docName.trim() : `${docName.trim()}.pdf`,
      fileSize: '1.2 MB',
      mimeType: 'application/pdf'
    };
    setAttachments(prev => [...prev, newDoc]);
    setDocName('');
    setIsAttachingDoc(false);
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

  const handleSaveDraft = () => {
    if (!content.trim()) return;
    localStorage.setItem('lex_composer_draft', JSON.stringify({ content, legalTopic, audience }));
    setHasSavedDraft(true);
    setTimeout(() => setHasSavedDraft(false), 2500);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim()) return;

    const tagsFound = content.match(/#[a-zA-Z0-9_]+/g)?.map(tag => tag.replace('#', '')) || [];
    const finalTags = tagsFound.length ? tagsFound : [legalTopic.replace(/\s+/g, '')];

    createPost(content.trim(), legalTopic, finalTags, attachments, audience, communityId);

    setContent('');
    setAttachments([]);
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
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t.composerPlaceholder}
            rows={3}
            maxLength={MAX_CHARS}
            className="w-full resize-none text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none leading-relaxed bg-transparent"
          />

          {/* Attached Files Preview */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 my-2">
              {attachments.map((att, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs text-slate-700"
                >
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span className="font-medium truncate max-w-[160px]">{att.name}</span>
                  <button
                    onClick={() => removeAttachment(idx)}
                    className="text-slate-400 hover:text-slate-700 p-0.5 rounded-full"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Doc Upload Inline Form */}
          {isAttachingDoc && (
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 p-2 rounded-xl my-2">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <input
                type="text"
                placeholder="Document / Circular name (e.g. Ministerial_Order_004_2026.pdf)"
                value={docName}
                onChange={e => setDocName(e.target.value)}
                className="flex-1 text-xs bg-white border border-slate-200 rounded-md px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <button
                type="button"
                onClick={handleAddDoc}
                className="px-2.5 py-1 bg-blue-700 text-white rounded-md text-xs font-semibold hover:bg-blue-800"
              >
                Attach
              </button>
              <button
                type="button"
                onClick={() => setIsAttachingDoc(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Bottom Toolbar & Publish */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-slate-100 gap-2">
            <div className="flex items-center gap-1.5 text-slate-500">
              <button
                type="button"
                onClick={() => setIsAttachingDoc(true)}
                title="Attach Document / PDF"
                className="p-1.5 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition flex items-center gap-1 text-2xs font-semibold"
              >
                <Paperclip className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Attach Doc</span>
              </button>
              <button
                type="button"
                onClick={handleAddStatuteCitation}
                title="Add Statutory Citation"
                className="p-1.5 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition flex items-center gap-1 text-2xs font-semibold"
              >
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                <span className="hidden sm:inline">Cite Law</span>
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                title={t.btnSaveDraft}
                className="p-1.5 hover:bg-slate-100 hover:text-slate-800 rounded-lg transition text-2xs font-medium flex items-center gap-1"
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
                disabled={!content.trim()}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  content.trim()
                    ? 'bg-[#1D4ED8] hover:bg-[#1e40af] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-3.5 h-3.5" />
                <span>{t.btnPublish}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
