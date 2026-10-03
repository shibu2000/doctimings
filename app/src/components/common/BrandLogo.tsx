import React from 'react';
import Svg, { Defs, LinearGradient, Stop, Rect, Path, Circle } from 'react-native-svg';

interface BrandLogoProps {
  size?: number;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 48 }) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 160 160" fill="none">
      <Defs>
        <LinearGradient id="appBgGrad" x1="8" y1="8" x2="152" y2="152" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#0F766E" />
          <Stop offset="100%" stopColor="#042F2E" />
        </LinearGradient>
        <LinearGradient id="appGlowGrad" x1="36" y1="36" x2="124" y2="124" gradientUnits="userSpaceOnUse">
          <Stop offset="0%" stopColor="#2DD4BF" />
          <Stop offset="100%" stopColor="#0D9488" />
        </LinearGradient>
      </Defs>
      <Rect x="8" y="8" width="144" height="144" rx="36" fill="url(#appBgGrad)" />
      <Rect x="10" y="10" width="140" height="140" rx="34" stroke="#2DD4BF" strokeOpacity="0.3" strokeWidth="2" />
      <Path d="M68 36H92V64H120V88H92V116H68V88H40V64H68V36Z" fill="#FFFFFF" fillOpacity="0.15" />
      <Circle cx="80" cy="76" r="38" fill="#FFFFFF" />
      <Circle cx="80" cy="76" r="32" stroke="url(#appGlowGrad)" strokeWidth="3" strokeDasharray="2 3" />
      <Circle cx="80" cy="76" r="4" fill="#0F766E" />
      <Path d="M80 76V54" stroke="#0F766E" strokeWidth="3.5" strokeLinecap="round" />
      <Path d="M80 76L95 85" stroke="#0D9488" strokeWidth="3" strokeLinecap="round" />
      <Path d="M54 130C62 134 71 136 80 136C89 136 98 134 106 130" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
};
