import React from 'react';

export const LogoHeroOutline: React.FC = () => {
  return (
    <div className="mark">
      <svg viewBox="26 18 74 84" fill="none" aria-hidden="true">
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#EBCF85" />
            <stop offset=".55" stopColor="#C9A24B" />
            <stop offset="1" stopColor="#A47B2A" />
          </linearGradient>
        </defs>
        <g transform="translate(63 60) scale(.88) translate(-63 -60)">
          <path className="os draw" pathLength="1" d="M34 26H46V82H92V94H34Z" />
          <path className="os draw" pathLength="1" d="M56 26H68L92 72H80Z" />
          <path className="os draw" pathLength="1" d="M80 26H92L68 72H56Z" />
        </g>
        <path className="o draw" pathLength="1" d="M34 26H46V82H92V94H34Z" />
        <path className="gd draw" pathLength="1" d="M56 26H68L92 72H80Z" />
        <path className="gd draw" pathLength="1" d="M80 26H92L68 72H56Z" />
      </svg>
    </div>
  );
};
