import React, { useState, useRef } from 'react';
import { Translations } from '../../i18n/strings';

interface AvatarCropperProps {
  t: Translations;
  currentAvatarUrl?: string;
  onAvatarSelected: (url: string) => void;
}

export const AvatarCropper: React.FC<AvatarCropperProps> = ({
  t,
  currentAvatarUrl,
  onAvatarSelected,
}) => {
  const [preview, setPreview] = useState<string | undefined>(currentAvatarUrl);
  const [zoom, setZoom] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
      onAvatarSelected(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '8px 0' }}>
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          overflow: 'hidden',
          background: 'var(--surface)',
          border: '2px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {preview ? (
          <img
            src={preview}
            alt="Avatar preview"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: `scale(${zoom})`,
            }}
          />
        ) : (
          <span style={{ fontSize: '24px', color: 'var(--muted)' }}>👤</span>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          className="ghost"
          style={{ height: '36px', fontSize: '13px', padding: '0 14px' }}
          onClick={() => fileInputRef.current?.click()}
        >
          {t.uploadAvatar}
        </button>

        {preview && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--muted)' }}>
            <span>Zoom</span>
            <input
              type="range"
              min="1"
              max="2"
              step="0.1"
              value={zoom}
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              style={{ width: '80px', accentColor: 'var(--accent)' }}
              aria-label="Avatar zoom"
            />
          </div>
        )}
      </div>
    </div>
  );
};
