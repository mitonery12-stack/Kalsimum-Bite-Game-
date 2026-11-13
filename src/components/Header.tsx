import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { ScreenView } from '../types/game';
import { BrandLogo } from './BiscuitDecorations';

interface HeaderProps {
  siteName: string;
  customLogo: string | null;
  activeScreen: ScreenView;
  soundEnabled: boolean;
  onNavigate: (screen: ScreenView) => void;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  siteName,
  customLogo,
  activeScreen,
  soundEnabled,
  onNavigate,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FDF8F2]/92 backdrop-blur-md border-b border-[#E5D3BE]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
        {/* Zone 1: Brand Mark & Website Name */}
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 text-left group cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#B06A2B] rounded-lg shrink-0"
        >
          <BrandLogo customLogo={customLogo} siteName={siteName} sizeClass="w-9 h-9" />
          <span className="font-display font-bold text-lg sm:text-xl tracking-tight text-[#3B2314] whitespace-nowrap truncate max-w-[165px] sm:max-w-[240px]">
            {siteName}
          </span>
        </button>

        {/* Zone 2: Clean Single-Line Navigation Links */}
        <nav
          aria-label="Navigasi utama"
          className="flex items-center gap-4 sm:gap-7 text-sm font-semibold"
        >
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className={`py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activeScreen === 'home'
                ? 'text-[#3B2314] border-[#C68642]'
                : 'text-[#7A563E] border-transparent hover:text-[#3B2314]'
            }`}
          >
            Beranda
          </button>
          <button
            type="button"
            onClick={() => onNavigate('play')}
            className={`py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activeScreen === 'play'
                ? 'text-[#3B2314] border-[#C68642]'
                : 'text-[#7A563E] border-transparent hover:text-[#3B2314]'
            }`}
          >
            Main
          </button>
          <button
            type="button"
            onClick={() => onNavigate('settings')}
            className={`py-1.5 whitespace-nowrap shrink-0 transition-colors cursor-pointer border-b-2 ${
              activeScreen === 'settings'
                ? 'text-[#3B2314] border-[#C68642]'
                : 'text-[#7A563E] border-transparent hover:text-[#3B2314]'
            }`}
          >
            Pengaturan
          </button>
        </nav>

        {/* Zone 3: Sound ON/OFF Toggle */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onToggleSound}
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? 'Matikan suara efek' : 'Nyalakan suara efek'}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[40px] border ${
              soundEnabled
                ? 'bg-[#3B2314] text-[#FFFDF9] border-[#3B2314] hover:bg-[#52321E]'
                : 'bg-[#F4E9DC] text-[#6B4B35] border-[#DEC7AC] hover:bg-[#EAD9C4]'
            }`}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 shrink-0" />
            ) : (
              <VolumeX className="w-4 h-4 shrink-0" />
            )}
            <span className="hidden sm:inline">{soundEnabled ? 'Suara ON' : 'Suara OFF'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
