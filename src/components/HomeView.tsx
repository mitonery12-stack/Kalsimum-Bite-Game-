import React, { useState } from 'react';
import { Play, Settings, Cookie } from 'lucide-react';
import { motion } from 'motion/react';
import { BrandLogo, ButterBiscuitSvg, ChocolateChipSvg, CookieSvg, CrumbsAccent } from './BiscuitDecorations';
import heroCookiesImg from '../assets/images/biscuit_hero_cookies_1794558050566.jpg';

const HERO_COOKIES_PATH = heroCookiesImg;

interface HomeViewProps {
  siteName: string;
  slogan: string;
  customLogo: string | null;
  questionCount: number;
  onStartPlay: () => void;
  onOpenSettings: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  siteName,
  slogan,
  customLogo,
  questionCount,
  onStartPlay,
  onOpenSettings,
}) => {
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
        {/* Left Column: Brand Identity, Slogan, CTA & Rules */}
        <div className="lg:col-span-7 flex flex-col justify-between bg-[#FFFDF9] border border-[#E5D3BE] rounded-3xl p-6 sm:p-10 shadow-sm relative overflow-hidden">
          {/* Subtle decorative crumbs in corners */}
          <ChocolateChipSvg className="w-6 h-6 absolute top-6 right-8 opacity-25 rotate-12 pointer-events-none" />
          <CrumbsAccent className="w-24 h-12 absolute bottom-4 right-6 opacity-50 pointer-events-none" />

          <div>
            {/* Logo + Quick Customize Row */}
            <div className="flex items-center gap-4 mb-6">
              <BrandLogo customLogo={customLogo} siteName={siteName} sizeClass="w-16 h-16 sm:w-20 sm:h-20" />
              <div>
                <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7A563E]">
                  <span>Roda Pertanyaan Interaktif</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">{questionCount} Pertanyaan Aktif</span>
                </div>
                <h1 className="font-display font-extrabold text-3xl sm:text-5xl text-[#3B2314] tracking-tight leading-tight mt-1 text-balance">
                  {siteName}
                </h1>
              </div>
            </div>

            {/* Slogan */}
            <p className="font-display font-semibold text-xl sm:text-2xl text-[#A85D1F] mb-4 text-balance">
              &ldquo;{slogan}&rdquo;
            </p>

            <p className="text-[#5C3D28] text-base sm:text-lg leading-relaxed max-w-xl mb-8">
              Putar roda biskuit manis dan dapatkan satu pertanyaan acak untuk dibacakan didepan mic yang di sediakan.
            </p>

            {/* Primary & Secondary Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-10">
              <button
                type="button"
                onClick={onStartPlay}
                className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#4A2816] text-[#FFFDF9] font-display font-bold text-base sm:text-lg tracking-wide shadow-md hover:bg-[#61361E] active:scale-[0.98] transition-all cursor-pointer min-h-[48px] whitespace-nowrap shrink-0"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>MULAI BERMAIN</span>
              </button>

              <button
                type="button"
                onClick={onOpenSettings}
                className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#F4E9DC] text-[#4A2816] border border-[#DEC7AC] font-semibold text-sm sm:text-base hover:bg-[#EAD9C4] active:scale-[0.98] transition-all cursor-pointer min-h-[48px] whitespace-nowrap shrink-0"
              >
                <Settings className="w-4 h-4" />
                <span>Atur Pertanyaan &amp; Logo</span>
              </button>
            </div>
          </div>

          {/* Clean 3-Step Rule Breakdown (no nested cards-within-cards) */}
          <div className="pt-6 border-t border-[#EBDCCB]">
            <h2 className="text-sm font-bold text-[#7A563E] mb-3">Cara Bermain</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm text-[#4A2816]">
              <div>
                <span className="font-display font-bold text-[#B06A2B]">01. Putar Roda</span>
                <p className="text-[#6B4B35] mt-1 leading-snug">
                  Setiap sesi memberi 1 kali kesempatan spin untuk memilih nomor acak.
                </p>
              </div>
              <div>
                <span className="font-display font-bold text-[#B06A2B]">02. Baca Pertanyaan</span>
                <p className="text-[#6B4B35] mt-1 leading-snug">
                  Satu kartu pertanyaan besar muncul sesuai nomor tempat roda berhenti.
                </p>
              </div>
              <div>
                <span className="font-display font-bold text-[#B06A2B]">03. Reset Sesi</span>
                <p className="text-[#6B4B35] mt-1 leading-snug">
                  Klik Reset Game jika ingin memulai giliran putar berikutnya.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Biscuit & Cookie Showcase */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="flex-1 bg-[#F4E9DC] border border-[#DEC7AC] rounded-3xl p-5 sm:p-6 flex flex-col justify-between shadow-sm">
            <div className="relative flex-1 min-h-[260px] rounded-2xl overflow-hidden bg-[#FDF8F2] border border-[#E5D3BE]">
              {!heroImgFailed ? (
                <img
                  src={HERO_COOKIES_PATH}
                  alt="Ilustrasi aneka biskuit dan cookies cokelat hangat"
                  referrerPolicy="no-referrer"
                  onError={() => setHeroImgFailed(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 gap-4 bg-[#FDF8F2]">
                  <div className="flex items-center gap-4">
                    <CookieSvg className="w-20 h-20" />
                    <ButterBiscuitSvg className="w-20 h-20" />
                  </div>
                  <p className="font-display font-semibold text-[#6B3E26] text-center">
                    Biscuit &amp; Cookie Question Wheel
                  </p>
                </div>
              )}
            </div>

            <div className="pt-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#FFFDF9] border border-[#DEC7AC] flex items-center justify-center shrink-0">
                  <Cookie className="w-5 h-5 text-[#B06A2B]" />
                </div>
                <div>
                  <p className="font-display font-bold text-sm text-[#3B2314]">
                    Kustomisasi Bebas
                  </p>
                  <p className="text-xs text-[#6B4B35]">
                    Ubah nama, unggah logo, dan kelola pertanyaan kapan saja.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  );
};
