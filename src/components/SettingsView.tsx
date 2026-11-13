import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  Check,
  ImageUp,
  Minus,
  Plus,
  RotateCcw,
  Trash2,
  FileText,
} from 'lucide-react';
import { motion } from 'motion/react';
import {
  DEFAULT_QUESTIONS,
  DEFAULT_SITE_NAME,
  DEFAULT_SLOGAN,
  GameConfig,
} from '../types/game';
import { BrandLogo } from './BiscuitDecorations';

interface SettingsViewProps {
  config: GameConfig;
  onUpdateConfig: (updater: (prev: GameConfig) => GameConfig) => void;
  onBackToPlay: () => void;
}

const MIN_QUESTIONS = 2;
const MAX_QUESTIONS = 20;

export const SettingsView: React.FC<SettingsViewProps> = ({
  config,
  onUpdateConfig,
  onBackToPlay,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [newQuestion, setNewQuestion] = useState('');
  const [showBulkEditor, setShowBulkEditor] = useState(false);
  const [bulkText, setBulkText] = useState(() => config.questions.join('\n'));
  const [feedback, setFeedback] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setFeedback(msg);
    window.setTimeout(() => {
      setFeedback((prev) => (prev === msg ? null : prev));
    }, 3000);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') return;

      // Resize image onto a compact canvas so it safely persists in localStorage
      const img = new Image();
      img.onload = () => {
        const maxSize = 320;
        let { width, height } = img;
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/png', 0.9);
          onUpdateConfig((prev) => ({ ...prev, customLogo: dataUrl }));
          showToast('Logo baru berhasil disimpan ke browser!');
        }
      };
      img.onerror = () => {
        showToast('Gagal memproses file gambar. Gunakan format PNG, JPG, atau WEBP.');
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRestoreDefaultLogo = () => {
    onUpdateConfig((prev) => ({ ...prev, customLogo: null }));
    showToast('Logo dikembalikan ke logo biskuit bawaan.');
  };

  const handleQuestionCountChange = (targetCount: number) => {
    const clamped = Math.max(MIN_QUESTIONS, Math.min(MAX_QUESTIONS, targetCount));
    onUpdateConfig((prev) => {
      const current = [...prev.questions];
      if (clamped > current.length) {
        while (current.length < clamped) {
          const nextNum = current.length + 1;
          const fallbackDefault =
            DEFAULT_QUESTIONS[(nextNum - 1) % DEFAULT_QUESTIONS.length];
          current.push(
            nextNum <= DEFAULT_QUESTIONS.length
              ? fallbackDefault
              : `Pertanyaan tambahan #${nextNum}: Ceritakan hal seru yang ingin kamu bagikan hari ini!`
          );
        }
      } else if (clamped < current.length) {
        current.length = clamped;
      }
      return { ...prev, questions: current };
    });
    showToast(`Jumlah pertanyaan diatur menjadi ${clamped} bagian roda.`);
  };

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newQuestion.trim();
    if (!trimmed) return;
    if (config.questions.length >= MAX_QUESTIONS) {
      showToast(`Maksimal ${MAX_QUESTIONS} pertanyaan agar roda tetap nyaman dibaca.`);
      return;
    }
    onUpdateConfig((prev) => ({
      ...prev,
      questions: [...prev.questions, trimmed],
    }));
    setNewQuestion('');
    showToast('Pertanyaan baru ditambahkan.');
  };

  const handleUpdateQuestion = (index: number, value: string) => {
    onUpdateConfig((prev) => {
      const updated = [...prev.questions];
      updated[index] = value;
      return { ...prev, questions: updated };
    });
  };

  const handleDeleteQuestion = (index: number) => {
    if (config.questions.length <= MIN_QUESTIONS) {
      showToast(`Minimal harus ada ${MIN_QUESTIONS} pertanyaan pada roda.`);
      return;
    }
    onUpdateConfig((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
    showToast(`Pertanyaan #${index + 1} dihapus.`);
  };

  const handleOpenBulkEditor = () => {
    setBulkText(config.questions.join('\n'));
    setShowBulkEditor((prev) => !prev);
  };

  const handleApplyBulk = () => {
    const lines = bulkText
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    if (lines.length < MIN_QUESTIONS) {
      showToast(`Masukkan minimal ${MIN_QUESTIONS} baris pertanyaan.`);
      return;
    }

    const capped = lines.slice(0, MAX_QUESTIONS);
    onUpdateConfig((prev) => ({
      ...prev,
      questions: capped,
    }));
    setShowBulkEditor(false);
    showToast(`Seluruh isi pertanyaan diganti (${capped.length} pertanyaan).`);
  };

  const handleResetDefaultQuestions = () => {
    onUpdateConfig((prev) => ({
      ...prev,
      questions: [...DEFAULT_QUESTIONS],
    }));
    setBulkText(DEFAULT_QUESTIONS.join('\n'));
    showToast('Pertanyaan dikembalikan ke 10 pertanyaan bawaan.');
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-10"
    >
      {/* Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-medium text-[#7A563E]">
            <span>Tersimpan Otomatis di Browser</span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">{config.questions.length} Pertanyaan</span>
          </div>
          <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#3B2314] mt-0.5">
            Pengaturan Game &amp; Pertanyaan
          </h1>
        </div>

        <button
          type="button"
          onClick={onBackToPlay}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#4A2816] text-[#FFFDF9] font-semibold text-sm hover:bg-[#61361E] transition-colors cursor-pointer min-h-[42px] whitespace-nowrap shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Arena Spin</span>
        </button>
      </div>

      {/* Save Confirmation Banner */}
      {feedback && (
        <div
          role="status"
          className="mb-6 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-[#EFE3D3] border border-[#C68642] text-[#3B2314] text-sm font-semibold"
        >
          <Check className="w-4 h-4 text-[#8C5832] shrink-0" />
          <span>{feedback}</span>
        </div>
      )}

      <div className="space-y-8">
        {/* Section 1: Website Name, Slogan & Logo */}
        <div className="bg-[#FFFDF9] border border-[#E5D3BE] rounded-3xl p-6 sm:p-8 shadow-sm">
          <h2 className="font-display font-bold text-xl text-[#3B2314] mb-1">
            01. Identitas &amp; Logo Website
          </h2>
          <p className="text-sm text-[#6B4B35] mb-6">
            Sesuaikan nama website, slogan, serta unggah logo sendiri atau gunakan logo biskuit bawaan.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            {/* Logo Preview & Upload */}
            <div className="md:col-span-5 flex flex-col items-start gap-4 bg-[#F7EFE5] border border-[#E5D3BE] rounded-2xl p-5">
              <div className="flex items-center gap-4">
                <BrandLogo
                  customLogo={config.customLogo}
                  siteName={config.siteName}
                  sizeClass="w-18 h-18"
                />
                <div>
                  <p className="font-display font-bold text-sm text-[#3B2314]">Logo Saat Ini</p>
                  <p className="text-xs text-[#7A563E] mt-0.5">
                    {config.customLogo ? 'Logo kustom terpasang' : 'Logo biskuit bawaan'}
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />

              <div className="flex flex-wrap gap-2.5 w-full">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#C68642] text-[#FFFFFF] text-sm font-semibold hover:bg-[#B07232] transition-colors cursor-pointer min-h-[40px]"
                >
                  <ImageUp className="w-4 h-4" />
                  <span>Unggah Logo</span>
                </button>

                {config.customLogo && (
                  <button
                    type="button"
                    onClick={handleRestoreDefaultLogo}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#FFFDF9] text-[#5C3D28] border border-[#DEC7AC] text-sm font-semibold hover:bg-[#EFE3D3] transition-colors cursor-pointer min-h-[40px]"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Logo Bawaan</span>
                  </button>
                )}
              </div>
            </div>

            {/* Site Name & Slogan Inputs */}
            <div className="md:col-span-7 space-y-4">
              <div>
                <label
                  htmlFor="site-name-input"
                  className="block text-sm font-semibold text-[#3B2314] mb-1.5"
                >
                  Nama Website
                </label>
                <div className="flex gap-2">
                  <input
                    id="site-name-input"
                    type="text"
                    maxLength={40}
                    value={config.siteName}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({ ...prev, siteName: e.target.value }))
                    }
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        onUpdateConfig((prev) => ({ ...prev, siteName: DEFAULT_SITE_NAME }));
                      }
                    }}
                    placeholder="BISCUIT SPIN"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FDF8F2] border border-[#DEC7AC] text-[#3B2314] font-semibold focus:outline-none focus:border-[#B06A2B]"
                  />
                  {config.siteName !== DEFAULT_SITE_NAME && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({ ...prev, siteName: DEFAULT_SITE_NAME }))
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-[#F4E9DC] text-[#5C3D28] border border-[#DEC7AC] text-xs font-semibold hover:bg-[#EAD9C4] cursor-pointer whitespace-nowrap"
                    >
                      Default
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="site-slogan-input"
                  className="block text-sm font-semibold text-[#3B2314] mb-1.5"
                >
                  Slogan Website
                </label>
                <div className="flex gap-2">
                  <input
                    id="site-slogan-input"
                    type="text"
                    maxLength={90}
                    value={config.slogan}
                    onChange={(e) =>
                      onUpdateConfig((prev) => ({ ...prev, slogan: e.target.value }))
                    }
                    onBlur={(e) => {
                      if (!e.target.value.trim()) {
                        onUpdateConfig((prev) => ({ ...prev, slogan: DEFAULT_SLOGAN }));
                      }
                    }}
                    placeholder="Spin the Wheel, Get Your Question!"
                    className="flex-1 px-4 py-2.5 rounded-xl bg-[#FDF8F2] border border-[#DEC7AC] text-[#3B2314] focus:outline-none focus:border-[#B06A2B]"
                  />
                  {config.slogan !== DEFAULT_SLOGAN && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateConfig((prev) => ({ ...prev, slogan: DEFAULT_SLOGAN }))
                      }
                      className="px-3.5 py-2.5 rounded-xl bg-[#F4E9DC] text-[#5C3D28] border border-[#DEC7AC] text-xs font-semibold hover:bg-[#EAD9C4] cursor-pointer whitespace-nowrap"
                    >
                      Default
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Question Count & Bulk Replace */}
        <div className="bg-[#FFFDF9] border border-[#E5D3BE] rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
              <h2 className="font-display font-bold text-xl text-[#3B2314] mb-1">
                02. Jumlah Bagian Roda &amp; Daftar Pertanyaan
              </h2>
              <p className="text-sm text-[#6B4B35]">
                Atur jumlah pertanyaan (2–20), tambah, edit satu per satu, atau ganti seluruh isi pertanyaan sekaligus.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleOpenBulkEditor}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#F4E9DC] text-[#4A2816] border border-[#DEC7AC] text-sm font-semibold hover:bg-[#EAD9C4] transition-colors cursor-pointer min-h-[40px]"
              >
                <FileText className="w-4 h-4" />
                <span>{showBulkEditor ? 'Tutup Editor Massal' : 'Ganti Semua Pertanyaan'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetDefaultQuestions}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FFFDF9] text-[#6B4B35] border border-[#DEC7AC] text-sm font-semibold hover:bg-[#F4E9DC] transition-colors cursor-pointer min-h-[40px]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset Default (10)</span>
              </button>
            </div>
          </div>

          {/* Question Count Control */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-[#F7EFE5] border border-[#E5D3BE] mb-6">
            <div>
              <p className="font-semibold text-sm text-[#3B2314]">Atur Jumlah Pertanyaan</p>
              <p className="text-xs text-[#7A563E]">
                Roda spin otomatis menyesuaikan jumlah bagian (standar: 10 bagian, nomor 1–10).
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                aria-label="Kurangi jumlah pertanyaan"
                disabled={config.questions.length <= MIN_QUESTIONS}
                onClick={() => handleQuestionCountChange(config.questions.length - 1)}
                className="w-10 h-10 rounded-xl bg-[#FFFDF9] border border-[#DEC7AC] flex items-center justify-center text-[#3B2314] hover:bg-[#EAD9C4] disabled:opacity-40 cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>

              <input
                type="number"
                min={MIN_QUESTIONS}
                max={MAX_QUESTIONS}
                value={config.questions.length}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!Number.isNaN(val)) {
                    handleQuestionCountChange(val);
                  }
                }}
                aria-label="Jumlah pertanyaan"
                className="w-16 h-10 text-center rounded-xl bg-[#FFFDF9] border border-[#DEC7AC] font-display font-bold text-lg text-[#3B2314] tabular-nums focus:outline-none focus:border-[#B06A2B]"
              />

              <button
                type="button"
                aria-label="Tambah jumlah pertanyaan"
                disabled={config.questions.length >= MAX_QUESTIONS}
                onClick={() => handleQuestionCountChange(config.questions.length + 1)}
                className="w-10 h-10 rounded-xl bg-[#FFFDF9] border border-[#DEC7AC] flex items-center justify-center text-[#3B2314] hover:bg-[#EAD9C4] disabled:opacity-40 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>

              {config.questions.length !== 10 && (
                <button
                  type="button"
                  onClick={() => handleQuestionCountChange(10)}
                  className="px-3.5 h-10 rounded-xl bg-[#C68642] text-white text-xs font-semibold hover:bg-[#B07232] cursor-pointer whitespace-nowrap"
                >
                  Set 10 Standar
                </button>
              )}
            </div>
          </div>

          {/* Bulk Replace Panel */}
          {showBulkEditor && (
            <div className="mb-6 p-5 rounded-2xl bg-[#FDF8F2] border border-[#C68642]">
              <label
                htmlFor="bulk-questions-textarea"
                className="block font-display font-bold text-base text-[#3B2314] mb-1"
              >
                Ganti Seluruh Isi Pertanyaan (1 baris = 1 pertanyaan)
              </label>
              <p className="text-xs text-[#7A563E] mb-3">
                Tempel atau tulis daftar pertanyaan baru, pisahkan setiap pertanyaan dengan baris baru (Enter). Minimal 2 baris, maksimal 20 baris.
              </p>
              <textarea
                id="bulk-questions-textarea"
                rows={8}
                value={bulkText}
                onChange={(e) => setBulkText(e.target.value)}
                className="w-full p-4 rounded-xl bg-[#FFFFFF] border border-[#DEC7AC] text-sm text-[#3B2314] leading-relaxed focus:outline-none focus:border-[#B06A2B]"
                placeholder="Tulis pertanyaan 1 di baris ini&#10;Tulis pertanyaan 2 di baris berikutnya..."
              />
              <div className="mt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowBulkEditor(false)}
                  className="px-4 py-2 rounded-xl bg-[#F4E9DC] text-[#5C3D28] text-sm font-semibold hover:bg-[#EAD9C4] cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyBulk}
                  className="px-5 py-2 rounded-xl bg-[#4A2816] text-[#FFFDF9] text-sm font-semibold hover:bg-[#61361E] cursor-pointer"
                >
                  Terapkan Semua Pertanyaan
                </button>
              </div>
            </div>
          )}

          {/* Add Single New Question */}
          <form onSubmit={handleAddQuestion} className="flex flex-col sm:flex-row gap-3 mb-6">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Tulis pertanyaan baru untuk ditambahkan ke roda..."
              className="flex-1 px-4 py-3 rounded-xl bg-[#FDF8F2] border border-[#DEC7AC] text-[#3B2314] text-sm sm:text-base focus:outline-none focus:border-[#B06A2B]"
            />
            <button
              type="submit"
              disabled={!newQuestion.trim() || config.questions.length >= MAX_QUESTIONS}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#C68642] text-white font-semibold text-sm sm:text-base hover:bg-[#B07232] disabled:opacity-50 transition-colors cursor-pointer whitespace-nowrap shrink-0 min-h-[44px]"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Pertanyaan</span>
            </button>
          </form>

          {/* Editable List of Questions */}
          <div className="divide-y divide-[#EFE3D3]">
            {config.questions.map((question, idx) => (
              <div key={`q-row-${idx}`} className="py-3.5 flex items-start gap-3">
                <span className="w-9 h-10 rounded-xl bg-[#EFE3D3] text-[#4A2816] font-display font-bold text-sm flex items-center justify-center shrink-0 tabular-nums mt-0.5">
                  {idx + 1}
                </span>

                <textarea
                  rows={2}
                  value={question}
                  onChange={(e) => handleUpdateQuestion(idx, e.target.value)}
                  aria-label={`Isi pertanyaan nomor ${idx + 1}`}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-[#FDF8F2] border border-[#E5D3BE] text-[#3B2314] text-sm sm:text-base leading-snug focus:outline-none focus:border-[#B06A2B] resize-y min-h-[44px]"
                />

                <button
                  type="button"
                  onClick={() => handleDeleteQuestion(idx)}
                  disabled={config.questions.length <= MIN_QUESTIONS}
                  aria-label={`Hapus pertanyaan nomor ${idx + 1}`}
                  title={
                    config.questions.length <= MIN_QUESTIONS
                      ? 'Minimal 2 pertanyaan diperlukan'
                      : `Hapus pertanyaan #${idx + 1}`
                  }
                  className="w-10 h-10 rounded-xl bg-[#FFFDF9] border border-[#E5D3BE] text-[#8C4A32] hover:bg-[#F9E4DC] disabled:opacity-35 flex items-center justify-center shrink-0 cursor-pointer mt-0.5 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
};
