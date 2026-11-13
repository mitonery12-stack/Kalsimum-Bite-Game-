export type ScreenView = 'home' | 'play' | 'settings';

export interface GameConfig {
  siteName: string;
  slogan: string;
  customLogo: string | null;
  questions: string[];
  soundEnabled: boolean;
}

export const DEFAULT_SITE_NAME = 'BISCUIT SPIN';
export const DEFAULT_SLOGAN = 'Spin the Wheel, Get Your Question!';

export const DEFAULT_QUESTIONS: string[] = [
  'Kalau kamu menjadi sebuah rasa biskuit, rasa apa yang paling menggambarkan dirimu dan kenapa?',
  'Ceritakan satu momen paling lucu atau tak terlupakan bersama teman-teman tahun ini!',
  'Camilan atau minuman hangat apa yang wajib ada saat kamu bersantai di akhir pekan?',
  'Jika kamu bisa pergi berlibur ke mana saja besok pagi, destinasi mana yang akan kamu pilih?',
  'Apa satu hal kecil yang selalu berhasil membuat harimu langsung membaik?',
  'Sebutkan satu bakat tersembunyi atau hobi seru yang jarang diketahui orang lain tentangmu!',
  'Kalau kamu punya toko roti sendiri, menu andalan unik apa yang bakal kamu jual?',
  'Film, buku, atau lagu apa yang menurutmu wajib dicoba semua orang minimal sekali?',
  'Apa pencapaian sederhana yang paling kamu syukuri dalam beberapa bulan terakhir?',
  'Jika ada waktu luang seharian penuh tanpa gadget, aktivitas seru apa yang ingin kamu lakukan?',
];

export const DEFAULT_CONFIG: GameConfig = {
  siteName: DEFAULT_SITE_NAME,
  slogan: DEFAULT_SLOGAN,
  customLogo: null,
  questions: DEFAULT_QUESTIONS,
  soundEnabled: true,
};

const STORAGE_KEY = 'biscuit_spin_config_v1';

export function loadConfig(): GameConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_CONFIG;
    const parsed = JSON.parse(raw) as Partial<GameConfig>;
    const validQuestions =
      Array.isArray(parsed.questions) && parsed.questions.length >= 2
        ? parsed.questions.map((q) => String(q))
        : DEFAULT_QUESTIONS;

    return {
      siteName:
        typeof parsed.siteName === 'string' && parsed.siteName.trim().length > 0
          ? parsed.siteName
          : DEFAULT_SITE_NAME,
      slogan:
        typeof parsed.slogan === 'string' && parsed.slogan.trim().length > 0
          ? parsed.slogan
          : DEFAULT_SLOGAN,
      customLogo: typeof parsed.customLogo === 'string' ? parsed.customLogo : null,
      questions: validQuestions,
      soundEnabled: typeof parsed.soundEnabled === 'boolean' ? parsed.soundEnabled : true,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}

export function saveConfig(config: GameConfig): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return true;
  } catch {
    return false;
  }
}
