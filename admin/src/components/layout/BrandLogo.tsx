import React from 'react';

interface BrandLogoProps {
  size?: number;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 36, className = '' }) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="adminBgGrad" x1="8" y1="8" x2="152" y2="152" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F766E" />
          <stop offset="100%" stopColor="#042F2E" />
        </linearGradient>
        <linearGradient id="adminGlowGrad" x1="36" y1="36" x2="124" y2="124" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2DD4BF" />
          <stop offset="100%" stopColor="#0D9488" />
        </linearGradient>
      </defs>
      <rect x="8" y="8" width="144" height="144" rx="36" fill="url(#adminBgGrad)" />
      <rect x="10" y="10" width="140" height="140" rx="34" stroke="#2DD4BF" strokeOpacity="0.3" strokeWidth="2" />
      <path d="M68 36H92V64H120V88H92V116H68V88H40V64H68V36Z" fill="#FFFFFF" fillOpacity="0.15" />
      <circle cx="80" cy="76" r="38" fill="#FFFFFF" />
      <circle cx="80" cy="76" r="32" stroke="url(#adminGlowGrad)" strokeWidth="3" strokeDasharray="2 3" />
      <circle cx="80" cy="76" r="4" fill="#0F766E" />
      <path d="M80 76V54" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M80 76L95 85" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
      <path d="M54 130C62 134 71 136 80 136C89 136 98 134 106 130" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
};
