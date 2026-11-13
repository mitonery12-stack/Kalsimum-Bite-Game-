import { useEffect, useState } from 'react';
import { AnimatePresence } from 'motion/react';
import { Header } from './components/Header';
import { HomeView } from './components/HomeView';
import { PlayView } from './components/PlayView';
import { SettingsView } from './components/SettingsView';
import { GameConfig, ScreenView, loadConfig, saveConfig } from './types/game';
import { soundEngine } from './utils/sound';

export default function App() {
  const [config, setConfig] = useState<GameConfig>(() => loadConfig());
  const [activeScreen, setActiveScreen] = useState<ScreenView>('home');

  useEffect(() => {
    saveConfig(config);
  }, [config]);

  useEffect(() => {
    document.title = `${config.siteName} — ${config.slogan}`;
  }, [config.siteName, config.slogan]);

  const handleNavigate = (screen: ScreenView) => {
    soundEngine.unlock();
    soundEngine.playClick(config.soundEnabled);
    setActiveScreen(screen);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleSound = () => {
    soundEngine.unlock();
    setConfig((prev) => {
      const nextEnabled = !prev.soundEnabled;
      if (nextEnabled) {
        soundEngine.playClick(true);
      }
      return { ...prev, soundEnabled: nextEnabled };
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FDF8F2] bg-biscuit-dots text-[#3B2314]">
      <Header
        siteName={config.siteName}
        customLogo={config.customLogo}
        activeScreen={activeScreen}
        soundEnabled={config.soundEnabled}
        onNavigate={handleNavigate}
        onToggleSound={handleToggleSound}
      />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeScreen === 'home' && (
            <HomeView
              key="home"
              siteName={config.siteName}
              slogan={config.slogan}
              customLogo={config.customLogo}
              questionCount={config.questions.length}
              onStartPlay={() => handleNavigate('play')}
              onOpenSettings={() => handleNavigate('settings')}
            />
          )}

          {activeScreen === 'play' && (
            <PlayView
              key="play"
              questions={config.questions}
              soundEnabled={config.soundEnabled}
              onOpenSettings={() => handleNavigate('settings')}
            />
          )}

          {activeScreen === 'settings' && (
            <SettingsView
              key="settings"
              config={config}
              onUpdateConfig={setConfig}
              onBackToPlay={() => handleNavigate('play')}
            />
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-[#E5D3BE] bg-[#FDF8F2] py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs sm:text-sm text-[#7A563E]">
          <span>
            {config.siteName} · {config.slogan}
          </span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => handleNavigate('home')}
              className="hover:text-[#3B2314] transition-colors cursor-pointer"
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('play')}
              className="hover:text-[#3B2314] transition-colors cursor-pointer"
            >
              Arena Spin
            </button>
            <button
              type="button"
              onClick={() => handleNavigate('settings')}
              className="hover:text-[#3B2314] transition-colors cursor-pointer"
            >
              Pengaturan
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
