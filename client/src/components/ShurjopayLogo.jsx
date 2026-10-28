import React from 'react';

export default function ShurjopayLogo({ className = "h-12" }) {
  return (
    <div className={`shurjopay-logo-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <svg
        viewBox="0 0 320 80"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ height: '54px', width: 'auto' }}
      >
        {/* "shurjo" in dark navy */}
        <text
          x="10"
          y="56"
          fill="#1c355e"
          fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
          fontWeight="700"
          fontSize="46"
          letterSpacing="-1px"
        >
          shurjo
        </text>

        {/* "Pay" in vibrant green */}
        <text
          x="162"
          y="56"
          fill="#3ba749"
          fontFamily="'Plus Jakarta Sans', Arial, sans-serif"
          fontWeight="700"
          fontSize="46"
          letterSpacing="-1px"
        >
          Pay
        </text>

        {/* Hand holding credit card illustration in green */}
        <g stroke="#3ba749" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
          {/* Card outline */}
          <rect x="250" y="8" width="46" height="28" rx="4" transform="rotate(-8 250 8)" stroke="#3ba749" />
          <line x1="248" y1="18" x2="294" y2="12" stroke="#3ba749" strokeWidth="2" />
          {/* Hand contour grasping card */}
          <path d="M 240 32 C 242 22, 248 16, 256 16 C 262 16, 266 22, 270 28" />
          <path d="M 235 44 C 242 38, 252 36, 264 40 C 274 44, 278 52, 268 60 C 258 66, 246 62, 238 52 Z" />
          <path d="M 238 52 C 230 50, 224 46, 218 48" />
        </g>
      </svg>
    </div>
  );
}
