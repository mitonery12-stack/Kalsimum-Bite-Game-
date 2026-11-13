import React, { useState } from 'react';
import defaultLogoImg from '../assets/images/biscuit_spin_logo_1794558049880.jpg';

const DEFAULT_LOGO_PATH = defaultLogoImg;

interface BrandLogoProps {
  customLogo: string | null;
  siteName: string;
  sizeClass?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  customLogo,
  siteName,
  sizeClass = 'w-10 h-10',
}) => {
  const [imgFailed, setImgFailed] = useState(false);
  const src = customLogo || DEFAULT_LOGO_PATH;

  if (imgFailed) {
    return (
      <div
        className={`${sizeClass} rounded-full bg-[#EFE3D3] border border-[#D4924A] flex items-center justify-center shrink-0 overflow-hidden`}
        aria-label={siteName}
      >
        <CookieSvg className="w-4/5 h-4/5" />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClass} rounded-full bg-[#FDF8F2] border border-[#DEC7AC] shrink-0 overflow-hidden shadow-xs`}
    >
      <img
        src={src}
        alt={`Logo ${siteName}`}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="w-full h-full object-cover"
      />
    </div>
  );
};

export const CookieSvg: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <circle cx="32" cy="32" r="27" fill="#D4924A" stroke="#6B3E26" strokeWidth="3" />
    <circle cx="32" cy="32" r="22" fill="#E3AA66" />
    <circle cx="22" cy="22" r="3.5" fill="#4A2816" />
    <circle cx="40" cy="20" r="3" fill="#4A2816" />
    <circle cx="44" cy="35" r="3.8" fill="#4A2816" />
    <circle cx="28" cy="36" r="3.2" fill="#4A2816" />
    <circle cx="20" cy="42" r="2.8" fill="#4A2816" />
    <circle cx="36" cy="46" r="3" fill="#4A2816" />
    <circle cx="32" cy="25" r="2.2" fill="#6B3E26" />
  </svg>
);

export const ButterBiscuitSvg: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
    <rect
      x="10"
      y="10"
      width="44"
      height="44"
      rx="10"
      fill="#EAD2B3"
      stroke="#8C5832"
      strokeWidth="3"
    />
    <rect
      x="15"
      y="15"
      width="34"
      height="34"
      rx="6"
      fill="#F5E4CC"
      stroke="#C68642"
      strokeWidth="1.5"
      strokeDasharray="3 3"
    />
    <circle cx="24" cy="24" r="2" fill="#8C5832" />
    <circle cx="40" cy="24" r="2" fill="#8C5832" />
    <circle cx="32" cy="32" r="2" fill="#8C5832" />
    <circle cx="24" cy="40" r="2" fill="#8C5832" />
    <circle cx="40" cy="40" r="2" fill="#8C5832" />
  </svg>
);

export const ChocolateChipSvg: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
    <path
      d="M12 3C13.8 7.2 19 10.5 19 15.2C19 18.8 15.9 21 12 21C8.1 21 5 18.8 5 15.2C5 10.5 10.2 7.2 12 3Z"
      fill="#4A2816"
    />
    <path
      d="M9.5 14C9.5 12.2 10.8 10.4 11.6 9C10.5 11 10.3 13 10.6 15.2"
      stroke="#7A492D"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
  </svg>
);

export const CrumbsAccent: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 80 40" fill="none" className={className} aria-hidden="true">
    <circle cx="14" cy="20" r="4" fill="#C68642" opacity="0.65" />
    <path d="M28 11L35 14L31 21L25 17Z" fill="#8C5832" opacity="0.55" />
    <circle cx="49" cy="28" r="2.8" fill="#4A2816" opacity="0.55" />
    <path d="M61 12L67 16L62 20Z" fill="#D4924A" opacity="0.7" />
    <circle cx="72" cy="29" r="2" fill="#6B3E26" opacity="0.45" />
  </svg>
);
