import React from 'react';

// Reusable SVG Corporate Emblem Component representing the actual LEEP logo
export function LeepLogo({ width = 36, height = 36 }) {
  return (
    <svg viewBox="0 0 100 100" width={width} height={height} fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left Chevron Wing - LEEP Blue (Cyan) */}
      <path 
        d="M47 8 L47 64 L23 41 L37 52 L34 32 Z" 
        fill="#009ada" 
      />
      {/* Right Chevron Wing - LEEP Magenta */}
      <path 
        d="M53 8 L53 64 L77 41 L63 52 L66 32 Z" 
        fill="#bf2a8b" 
      />
    </svg>
  );
}
