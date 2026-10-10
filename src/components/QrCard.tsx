import React, { useMemo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { APP_DOWNLOAD_URL } from '../config';
import { Translations } from '../i18n/strings';

interface QrCardProps {
  t: Translations;
}

export const QrCard: React.FC<QrCardProps> = ({ t }) => {
  // If APP_DOWNLOAD_URL is empty, render the decorative QR matching reference HTML
  // TODO: set real app link in src/config.ts to render dynamic QR code
  const decorativeQrElements = useMemo(() => {
    const n = 29;
    let seed = 20261010;

    function rnd() {
      seed = (seed | 0) + 0x6d2b79f5 | 0;
      let temp = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      temp = (temp + Math.imul(temp ^ (temp >>> 7), 61 | temp)) ^ temp;
      return ((temp ^ (temp >>> 14)) >>> 0) / 4294967296;
    }

    const rects: Array<{ x: number; y: number; w?: number; h?: number; rx?: number; fill: string }> = [];

    function fin(x: number, y: number) {
      rects.push({ x, y, w: 7, h: 7, rx: 1.2, fill: 'currentColor' });
      rects.push({ x: x + 1, y: y + 1, w: 5, h: 5, rx: 0.8, fill: 'var(--surface)' });
      rects.push({ x: x + 2, y: y + 2, w: 3, h: 3, rx: 0.5, fill: 'currentColor' });
    }

    fin(0, 0);
    fin(n - 7, 0);
    fin(0, n - 7);

    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        if ((x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)) continue;
        if (x >= 10 && x <= 18 && y >= 10 && y <= 18) continue;
        if (rnd() > 0.52) {
          rects.push({ x, y, w: 1, h: 1, fill: 'currentColor' });
        }
      }
    }

    return rects;
  }, []);

  return (
    <div className="qr">
      <p>{t.qr}</p>
      {APP_DOWNLOAD_URL ? (
        <QRCodeSVG
          value={APP_DOWNLOAD_URL}
          size={160}
          level="H"
          bgColor="transparent"
          fgColor="currentColor"
          imageSettings={{
            src: '/favicon.svg',
            x: undefined,
            y: undefined,
            height: 38,
            width: 38,
            opacity: 1,
            excavate: true,
          }}
          style={{ display: 'block', width: '100%', height: 'auto', color: 'var(--text)' }}
        />
      ) : (
        <svg id="qrsvg" viewBox="0 0 29 29" shapeRendering="crispEdges">
          {decorativeQrElements.map((r, i) => (
            <rect
              key={i}
              x={r.x}
              y={r.y}
              width={r.w ?? 1}
              height={r.h ?? 1}
              rx={r.rx}
              fill={r.fill}
            />
          ))}
          <g transform="translate(11 11) scale(.0583)">
            <rect width="120" height="120" rx="28" fill="#12305A" />
            <path d="M34 26H46V82H92V94H34Z" fill="#F4EFE3" />
            <path d="M56 26H68L92 72H80Z" fill="#C9A24B" />
            <path d="M80 26H92L68 72H56Z" fill="#C9A24B" />
          </g>
        </svg>
      )}
    </div>
  );
};
