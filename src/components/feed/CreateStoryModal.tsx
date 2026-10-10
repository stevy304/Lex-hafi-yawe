import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  AlertCircle,
  Clock,
  Award,
  ShieldCheck,
  Sparkles,
  FileVideo,
  Image as ImageIcon
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import {
  extractVideoPoster,
  formatBytes,
  MAX_VIDEO_SIZE_BYTES,
  MAX_IMAGE_SIZE_BYTES,
  MAX_STORY_DURATION_SECONDS
} from '../../utils/mediaUtils';
import { Story } from '../../types';

interface CreateStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStoryCreated: (story: Story) => void;
}

export const CreateStoryModal: React.FC<CreateStoryModalProps> = ({
  isOpen,
  onClose,
  onStoryCreated
}) => {
  const { currentUser } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [caption, setCaption] = useState('');
  const [isOfficialBulletin, setIsOfficialBulletin] = useState(false);
  const [duration, setDuration] = useState<number>(6);
  const [posterUrl, setPosterUrl] = useState<string>('');

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedBytes, setUploadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const canPostOfficial =
    currentUser?.role === 'institution' ||
    currentUser?.role === 'admin' ||
    currentUser?.verificationType === 'official_institution';

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMessage(null);

    const isVid = file.type.startsWith('video/');
    const isImg = file.type.startsWith('image/');

    if (!isVid && !isImg) {
      setErrorMessage('Please select a valid image (JPEG, PNG, WebP) or video (MP4, WebM).');
      return;
    }

    if (isVid && file.size > MAX_VIDEO_SIZE_BYTES) {
      setErrorMessage(`Video exceeds the 50 MB limit (${formatBytes(file.size)}). Please select a shorter clip.`);
      return;
    }

    if (isImg && file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrorMessage(`Image exceeds the 15 MB limit (${formatBytes(file.size)}).`);
      return;
    }

    setSelectedFile(file);
    setTotalBytes(file.size);
    setMediaType(isVid ? 'video' : 'image');

    const previewUrl = URL.createObjectURL(file);
    setFilePreview(previewUrl);

    if (isVid) {
      try {
        const meta = await extractVideoPoster(file);
        if (meta.duration > MAX_STORY_DURATION_SECONDS) {
          setErrorMessage(`Stories support up to 15 seconds. This clip is ${Math.round(meta.duration)}s; it will be trimmed to 15s.`);
        }
        setDuration(Math.min(meta.duration || 15, MAX_STORY_DURATION_SECONDS));
        setPosterUrl(meta.posterDataUrl);
      } catch {
        setDuration(15);
      }
    } else {
      setDuration(6);
      setPosterUrl('');
    }
  };

  const handlePublish = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select an image or video to publish.');
      return;
    }

    try {
      setIsUploading(true);
      setErrorMessage(null);

      // Upload media to persistent media store
      const uploadRes = await api.uploadMedia(selectedFile, {
        duration,
        posterUrl,
        onProgress: (percent, loaded, total) => {
          setUploadProgress(percent);
          setUploadedBytes(loaded);
          setTotalBytes(total);
        }
      });

      // Create story record
      const story = await api.createStory({
        mediaType,
        mediaUrl: uploadRes.url,
        previewUrl: posterUrl || uploadRes.url,
        caption: caption.trim() || undefined,
        duration,
        storyType: isOfficialBulletin && canPostOfficial ? 'official_bulletin' : undefined,
        isOfficialGazetteAlert: isOfficialBulletin && canPostOfficial
      });

      onStoryCreated(story);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to publish story.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="w-full max-w-md bg-white rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 leading-tight">
                Add to Story
              </h3>
              <p className="text-[11px] text-slate-500">
                Visible to legal community for 24 hours
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-5 space-y-4">
          {/* File Picker / Preview Stage */}
          {!filePreview ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-8 text-center cursor-pointer transition bg-slate-50/50 hover:bg-blue-50/20 group"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/mp4,video/webm,video/quicktime"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-blue-100/70 text-blue-700 mx-auto flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Select Photo or Short Video
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                Up to 50 MB • MP4, WebM, JPEG, PNG • Max 15s duration
              </p>
            </div>
          ) : (
            <div className="relative aspect-[9/16] max-h-[320px] mx-auto bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
              {mediaType === 'video' ? (
                <video
                  src={filePreview}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <img
                  src={filePreview}
                  alt="Story preview"
                  className="w-full h-full object-cover"
                />
              )}

              <button
                type="button"
                onClick={() => {
                  setSelectedFile(null);
                  setFilePreview(null);
                }}
                className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                title="Change media"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-[10px] text-white flex items-center gap-1 font-semibold">
                {mediaType === 'video' ? (
                  <>
                    <FileVideo className="w-3 h-3 text-blue-400" />
                    <span>Video ({Math.round(duration)}s)</span>
                  </>
                ) : (
                  <>
                    <ImageIcon className="w-3 h-3 text-emerald-400" />
                    <span>Photo</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Caption Input */}
          <div>
            <label className="block text-2xs font-bold uppercase tracking-wider text-slate-500 mb-1">
              Story Caption (Optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              placeholder="Add legal context, announcement title, or article citation..."
              maxLength={120}
              className="w-full text-xs text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white transition"
            />
          </div>

          {/* Official Institution Bulletin Option */}
          {canPostOfficial && (
            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50/80 border border-amber-200/70 cursor-pointer">
              <input
                type="checkbox"
                checked={isOfficialBulletin}
                onChange={e => setIsOfficialBulletin(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <div className="text-2xs text-amber-900">
                <span className="font-bold flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-600" />
                  Publish as Official Gazette Bulletin
                </span>
                <p className="text-amber-800 leading-snug mt-0.5">
                  Highlighted with gold badge for government ministries, judiciary circulars, and RBA communiqués.
                </p>
              </div>
            </label>
          )}

          {/* Upload Progress Indicator */}
          {isUploading && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5">
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
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span className="leading-tight">{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handlePublish}
            disabled={isUploading || !selectedFile}
            className={`px-5 py-2 rounded-xl text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs cursor-pointer ${
              !selectedFile || isUploading
                ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                : 'bg-blue-700 hover:bg-blue-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Publishing...' : 'Share to Story'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
