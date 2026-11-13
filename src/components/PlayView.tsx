import React, { useEffect, useRef, useState } from 'react';
import { RotateCcw, Sparkles, SlidersHorizontal } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { SpinWheel, getWinningIndexFromRotation } from './SpinWheel';
import { ButterBiscuitSvg, ChocolateChipSvg, CookieSvg, CrumbsAccent } from './BiscuitDecorations';
import { soundEngine } from '../utils/sound';

interface PlayViewProps {
  questions: string[];
  soundEnabled: boolean;
  onOpenSettings: () => void;
}

export const PlayView: React.FC<PlayViewProps> = ({
  questions,
  soundEnabled,
  onOpenSettings,
}) => {
  const segmentCount = Math.max(2, questions.length);
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [winningIndex, setWinningIndex] = useState<number | null>(null);
  const [clapperTick, setClapperTick] = useState(0);

  const animFrameRef = useRef<number | null>(null);
  const rotationRef = useRef(0);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  // Reset session safely if question count changes while viewing
  useEffect(() => {
    if (winningIndex !== null && winningIndex >= questions.length) {
      setWinningIndex(null);
      setHasSpun(false);
      setRotation(0);
      rotationRef.current = 0;
    }
  }, [questions.length, winningIndex]);

  const handleSpin = () => {
    // Enforce strictly ONE spin per session
    if (isSpinning || isResetting || hasSpun) return;

    soundEngine.unlock();
    soundEngine.playClick(soundEnabled);

    setIsSpinning(true);
    setWinningIndex(null);

    const sliceAngle = 360 / segmentCount;
    const targetIdx = Math.floor(Math.random() * segmentCount);
    const centerDeg = targetIdx * sliceAngle + sliceAngle / 2;
    // Keep random landing well inside the wedge (never ambiguous near borders)
    const safeJitter = (Math.random() - 0.5) * (sliceAngle * 0.56);
    const desiredAngleOnWheel = centerDeg + safeJitter;
    const desiredFinalMod = ((360 - desiredAngleOnWheel) % 360 + 360) % 360;

    const startRotation = rotationRef.current;
    const currentMod = ((startRotation % 360) + 360) % 360;
    const deltaToTargetMod = ((desiredFinalMod - currentMod) + 360) % 360;
    const extraFullSpins = (6 + Math.floor(Math.random() * 3)) * 360;
    const totalDelta = deltaToTargetMod + extraFullSpins;
    const targetRotation = startRotation + totalDelta;

    const duration = 4600;
    const startTime = performance.now();
    let lastPegStep = Math.floor(startRotation / sliceAngle);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      // Smooth realistic deceleration (easeOutQuart)
      const eased = 1 - Math.pow(1 - t, 4);
      const currentAngle = startRotation + totalDelta * eased;

      rotationRef.current = currentAngle;
      setRotation(currentAngle);

      const currentPegStep = Math.floor(currentAngle / sliceAngle);
      if (currentPegStep > lastPegStep) {
        lastPegStep = currentPegStep;
        setClapperTick((prev) => prev + 1);
        soundEngine.playTick(soundEnabled, (1 - t) * 90);
      }

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Compute winning index directly from the actual final pointer position
        const actualIdx = getWinningIndexFromRotation(currentAngle, segmentCount);
        setIsSpinning(false);
        setHasSpun(true);
        setWinningIndex(actualIdx);
        soundEngine.playWinChime(soundEnabled);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
  };

  const handleResetGame = () => {
    if (isSpinning || isResetting) return;

    soundEngine.playReset(soundEnabled);
    setHasSpun(false);
    setWinningIndex(null);

    const startRot = rotationRef.current;
    if (Math.abs(startRot % 360) < 0.1 && startRot === 0) {
      return;
    }

    // Smoothly rewind wheel back to initial 0 degree position
    setIsResetting(true);
    const currentMod = ((startRot % 360) + 360) % 360;
    // Rotate shortest or clean backward reset to nearest 0 mod 360, then normalize to 0
    const deltaBack = currentMod <= 180 ? -currentMod : 360 - currentMod;
    const targetRot = startRot + deltaBack;
    const duration = 420;
    const startTime = performance.now();

    const animateReset = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = startRot + (targetRot - startRot) * eased;

      rotationRef.current = current;
      setRotation(current);

      if (t < 1) {
        animFrameRef.current = requestAnimationFrame(animateReset);
      } else {
        rotationRef.current = 0;
        setRotation(0);
        setIsResetting(false);
      }
    };

    animFrameRef.current = requestAnimationFrame(animateReset);
  };

  const selectedQuestion =
    winningIndex !== null && questions[winningIndex] ? questions[winningIndex] : null;
  const spinDisabled = isSpinning || isResetting || hasSpun;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10"
    >
      {/* Top Arena Context Line */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7A563E]">
            <span>{segmentCount} Bagian Roda</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {hasSpun
                ? `Terpilih Nomor ${(winningIndex ?? 0) + 1}`
                : isSpinning
                  ? 'Roda Sedang Berputar...'
                  : '1 Kesempatan Spin Tersedia'}
            </span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#3B2314] mt-0.5">
            Arena Putar Pertanyaan
          </h1>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          disabled={isSpinning}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-[#5C3D28] bg-[#F4E9DC] border border-[#DEC7AC] hover:bg-[#EAD9C4] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[40px]"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Edit Pertanyaan</span>
        </button>
      </div>

      {/* Main Arena Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        {/* Wheel Column */}
        <div className="lg:col-span-6 flex flex-col items-center">
          <div className="w-full bg-[#FFFDF9] border border-[#E5D3BE] rounded-3xl p-5 sm:p-8 shadow-sm relative">
            <ChocolateChipSvg className="w-5 h-5 absolute top-5 left-5 opacity-30 -rotate-12 pointer-events-none" />
            <ChocolateChipSvg className="w-4 h-4 absolute bottom-5 right-6 opacity-30 rotate-45 pointer-events-none" />

            <SpinWheel
              segmentCount={segmentCount}
              rotation={rotation}
              isSpinning={isSpinning}
              clapperTick={clapperTick}
              winningIndex={winningIndex}
            />

            {/* Spin Button Area */}
            <div className="mt-7 flex flex-col items-center gap-2.5">
              <button
                type="button"
                onClick={handleSpin}
                disabled={spinDisabled}
                className={`w-full max-w-[280px] px-8 py-4 rounded-2xl font-display font-extrabold text-xl tracking-wide transition-all min-h-[56px] whitespace-nowrap ${
                  spinDisabled
                    ? 'bg-[#E5D3BE] text-[#8C6D55] cursor-not-allowed border border-[#D4BFA6]'
                    : 'bg-[#4A2816] text-[#FFFDF9] hover:bg-[#61361E] active:scale-[0.98] shadow-md cursor-pointer border border-[#3B2314]'
                }`}
              >
                {isSpinning
                  ? 'MEMUTAR RODA...'
                  : hasSpun
                    ? 'SPIN SELESAI'
                    : 'SPIN'}
              </button>

              <p className="text-xs sm:text-sm text-[#7A563E] text-center">
                {hasSpun
                  ? 'Kesempatan spin sesi ini sudah digunakan. Tekan RESET GAME untuk sesi baru.'
                  : isSpinning
                    ? 'Tunggu hingga roda berhenti pada satu nomor...'
                    : 'Tekan tombol SPIN satu kali untuk memilih nomor pertanyaan acak.'}
              </p>
            </div>
          </div>
        </div>

        {/* Question Reveal Column */}
        <div className="lg:col-span-6">
          <AnimatePresence mode="wait">
            {hasSpun && winningIndex !== null && selectedQuestion !== null ? (
              <motion.div
                key={`question-card-${winningIndex}`}
                initial={{ opacity: 0, scale: 0.94, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -10 }}
                transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }}
                className="bg-[#FFFDF9] border-2 border-[#C68642] rounded-3xl p-6 sm:p-10 shadow-md relative overflow-hidden"
              >
                {/* Playful Biscuit & Cookie Decorations */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <CookieSvg className="w-11 h-11 shrink-0" />
                    <div>
                      <p className="font-display font-extrabold text-sm sm:text-base tracking-wide text-[#B06A2B]">
                        HERE IS YOUR QUESTION!
                      </p>
                      <p className="text-xs sm:text-sm font-semibold text-[#6B4B35] tabular-nums">
                        Pertanyaan Nomor {winningIndex + 1}
                      </p>
                    </div>
                  </div>
                  <ButterBiscuitSvg className="w-10 h-10 shrink-0 opacity-85" />
                </div>

                {/* Large Readable Question Display */}
                <div className="py-6 sm:py-8 border-y border-[#EBDCCB] relative">
                  <div className="inline-flex items-baseline gap-2 mb-3">
                    <span className="font-display font-extrabold text-4xl sm:text-5xl text-[#C68642] tabular-nums">
                      #{winningIndex + 1}
                    </span>
                  </div>

                  <p className="font-display font-bold text-2xl sm:text-3xl leading-snug text-[#3B2314] text-balance">
                    {selectedQuestion}
                  </p>

                  {/* Tiny floating crumbs celebration */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15, duration: 0.3 }}
                    className="mt-5 flex items-center gap-2 text-xs sm:text-sm text-[#7A563E]"
                  >
                    <ChocolateChipSvg className="w-4 h-4 shrink-0" />
                    <span>Bacakan atau diskusikan pertanyaan ini bersama pemain lain.</span>
                  </motion.div>
                </div>

                {/* Reset Game CTA (ONLY action to unlock next session) */}
                <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleResetGame}
                    className="inline-flex items-center justify-center gap-2.5 px-7 py-3.5 rounded-xl bg-[#C68642] text-[#FFFFFF] font-display font-bold text-base sm:text-lg hover:bg-[#B07232] active:scale-[0.98] transition-all shadow-sm cursor-pointer min-h-[48px] whitespace-nowrap"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>RESET GAME</span>
                  </button>

                  <CrumbsAccent className="w-20 h-10 opacity-70" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="waiting-card"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="bg-[#F4E9DC] border border-[#DEC7AC] rounded-3xl p-7 sm:p-10 text-center flex flex-col items-center justify-center min-h-[320px]"
              >
                <div className="flex items-center gap-3 mb-5">
                  <CookieSvg className="w-12 h-12" />
                  <ButterBiscuitSvg className="w-12 h-12" />
                </div>

                <h2 className="font-display font-bold text-xl sm:text-2xl text-[#3B2314] mb-2">
                  {isSpinning ? 'Roda Sedang Berputar...' : 'Siap Memilih Pertanyaan!'}
                </h2>

                <p className="text-sm sm:text-base text-[#6B4B35] max-w-md leading-relaxed">
                  {isSpinning
                    ? 'Tunggu sejenak sampai penunjuk di bagian atas berhenti tepat di salah satu nomor.'
                    : `Klik tombol SPIN di sebelah kiri. Setiap sesi hanya memiliki 1 kali putaran untuk memunculkan satu pertanyaan acak dari nomor 1 sampai ${segmentCount}.`}
                </p>

                {!isSpinning && (
                  <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-[#8C5832]">
                    <Sparkles className="w-4 h-4" />
                    <span>Tidak ada skor atau pilihan ganda — murni obrolan seru!</span>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.section>
  );
};
