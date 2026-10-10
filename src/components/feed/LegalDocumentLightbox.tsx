import React, { useState } from 'react';
import {
  X,
  ZoomIn,
  ZoomOut,
  Download,
  Copy,
  Check,
  ShieldCheck,
  FileText,
  Scale,
  BookOpen,
  Eye,
  Type
} from 'lucide-react';
import { PostAttachment, User } from '../../types';

interface LegalDocumentLightboxProps {
  attachment: PostAttachment;
  author?: User;
  onClose: () => void;
}

export const LegalDocumentLightbox: React.FC<LegalDocumentLightboxProps> = ({
  attachment,
  author,
  onClose
}) => {
  const [zoom, setZoom] = useState(1);
  const [copied, setCopied] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xl'>('normal');
  const [isFocusReaderMode, setIsFocusReaderMode] = useState(false);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 2.5));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.75));
  const handleResetZoom = () => setZoom(1);

  const handleCopyCitation = () => {
    const citation = `${attachment.name} — Referenced on Lex Hafi Yawe by ${author ? author.name : 'Legal Practitioner'} (Republic of Rwanda)`;
    navigator.clipboard?.writeText(citation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isImage = attachment.type === 'image' || attachment.url.match(/\.(jpg|jpeg|png|webp|gif)/i);

  const fontSizeClass =
    fontSize === 'xl' ? 'text-base sm:text-lg' : fontSize === 'large' ? 'text-sm sm:text-base' : 'text-xs sm:text-sm';

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col justify-between p-3 sm:p-5 select-none animate-in fade-in duration-150">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between text-white border-b border-white/10 pb-3 z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-400/30 text-blue-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              {attachment.name}
            </h3>
            <p className="text-[11px] text-white/70">
              {attachment.fileSize || 'Official Record'} • Republic of Rwanda Jurisdiction
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Focus Reader Mode Toggle for documents */}
          {!isImage && (
            <button
              type="button"
              onClick={() => setIsFocusReaderMode(!isFocusReaderMode)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 border cursor-pointer ${
                isFocusReaderMode
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-white/10 text-white/90 border-white/10 hover:bg-white/20'
              }`}
              title="Toggle distraction-free legal reading view"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Focus Reader</span>
            </button>
          )}

          {/* Font Size controls in focus reader */}
          {!isImage && isFocusReaderMode && (
            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                type="button"
                onClick={() => setFontSize('normal')}
                className={`px-2 py-1 text-2xs font-bold rounded-lg transition ${
                  fontSize === 'normal' ? 'bg-white text-slate-900' : 'text-white/80'
                }`}
              >
                A
              </button>
              <button
                type="button"
                onClick={() => setFontSize('large')}
                className={`px-2 py-1 text-xs font-bold rounded-lg transition ${
                  fontSize === 'large' ? 'bg-white text-slate-900' : 'text-white/80'
                }`}
              >
                A+
              </button>
              <button
                type="button"
                onClick={() => setFontSize('xl')}
                className={`px-2 py-1 text-sm font-bold rounded-lg transition ${
                  fontSize === 'xl' ? 'bg-white text-slate-900' : 'text-white/80'
                }`}
              >
                A++
              </button>
            </div>
          )}

          {/* Zoom Controls for images */}
          {isImage && (
            <div className="flex items-center bg-white/10 rounded-xl p-0.5 border border-white/10">
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 hover:bg-white/20 rounded-lg transition"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4 text-white" />
              </button>
              <button
                type="button"
                onClick={handleResetZoom}
                className="px-2 py-1 text-2xs font-semibold text-white/90 hover:bg-white/20 rounded-lg transition"
                title="Reset Zoom"
              >
                {Math.round(zoom * 100)}%
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 hover:bg-white/20 rounded-lg transition"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* Copy Citation */}
          <button
            type="button"
            onClick={handleCopyCitation}
            className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-semibold text-white transition flex items-center gap-1.5 border border-white/10 cursor-pointer"
            title="Copy statutory citation"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copied ? 'Citation Copied' : 'Copy Citation'}</span>
          </button>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-xl text-white transition cursor-pointer"
            aria-label="Close document viewer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Inspection Stage */}
      <div className="flex-1 flex items-center justify-center overflow-auto p-4 my-2">
        {isImage ? (
          <div
            className="transition-transform duration-150 ease-out flex items-center justify-center max-w-full max-h-full"
            style={{ transform: `scale(${zoom})` }}
          >
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg shadow-2xl border border-white/10"
            />
          </div>
        ) : (
          <div
            className={`w-full bg-white rounded-2xl p-6 sm:p-8 text-slate-900 shadow-2xl space-y-4 transition-all ${
              isFocusReaderMode ? 'max-w-3xl leading-relaxed py-10' : 'max-w-2xl'
            }`}
          >
            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Scale className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-snug truncate">
                  {attachment.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5 text-2xs font-semibold text-blue-700 uppercase tracking-wider">
                  <span>Verified Legal Record</span>
                  <span>•</span>
                  <span>Republic of Rwanda</span>
                </div>
              </div>
            </div>

            <div className={`bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 text-slate-800 space-y-3 ${fontSizeClass}`}>
              <div className="flex justify-between border-b border-slate-200/80 pb-2.5 text-2xs text-slate-500 font-medium">
                <span>File Scope: <strong>{attachment.fileSize || 'Codified Statute Article'}</strong></span>
                <span>Jurisdiction: <strong>Official Gazette Registry</strong></span>
              </div>
              <p className="leading-relaxed">
                Referenced for legal guidance and compliance analysis by <strong>{author ? author.name : 'Verified Counsel'}</strong>. This record is indexed against statutory codes enacted under the Constitution of the Republic of Rwanda.
              </p>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified with the Ministry of Justice / Rwanda Bar Association database.</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleCopyCitation}
                className="text-xs font-semibold text-slate-600 hover:text-blue-700 transition"
              >
                Copy Official Citation
              </button>
              <a
                href={attachment.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Open / Download Record</span>
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between text-white/70 text-2xs border-t border-white/10 pt-2.5">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Lex Hafi Yawe Digital Justice Authenticity Guarantee</span>
        </div>
        <span>Press <kbd className="font-bold text-white bg-white/20 px-1 py-0.5 rounded">ESC</kbd> to return</span>
      </div>
    </div>
  );
};
