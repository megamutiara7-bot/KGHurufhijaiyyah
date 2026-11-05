import React, { useState, useEffect } from 'react';
import { GameMode, PlayerStats, HijaiyyahLetter } from './types/hijaiyyah';
import { HIJAIYYAH_LETTERS } from './data/hijaiyyahData';
import { Navbar } from './components/Navbar';
import { LearnMode } from './components/LearnMode';
import { QuizMode } from './components/QuizMode';
import { BalloonPopMode } from './components/BalloonPopMode';
import { MemoryMatchMode } from './components/MemoryMatchMode';
import { TracingMode } from './components/TracingMode';
import { StickerAlbumModal } from './components/StickerAlbumModal';
import { sound } from './utils/audio';
import { BookOpen, HelpCircle, Gamepad2, Sparkles, PenTool, Heart, Star } from 'lucide-react';

const STORAGE_KEY = 'hijaiyyah_game_stats_v1';

const INITIAL_STATS: PlayerStats = {
  stars: 5, // Start with 5 bonus stars to encourage them!
  quizzesCompleted: 0,
  balloonsPopped: 0,
  memoryMatchesWon: 0,
  lettersTraced: 0,
  unlockedBadges: ['first_step'],
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<GameMode>('learn');
  const [letterForTracing, setLetterForTracing] = useState<HijaiyyahLetter | undefined>(undefined);
  const [isAlbumOpen, setIsAlbumOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isMusicPlaying, setIsMusicPlaying] = useState<boolean>(false);

  // Load stats from localStorage
  const [playerStats, setPlayerStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // Fallback
    }
    return INITIAL_STATS;
  });

  // Save stats to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(playerStats));
    } catch {
      // Storage error ignored
    }
  }, [playerStats]);

  // Audio control callbacks
  const handleToggleMute = () => {
    sound.isMuted = !isMuted;
    setIsMuted(!isMuted);
    if (!isMuted && isMusicPlaying) {
      sound.stopMusic();
      setIsMusicPlaying(false);
    }
  };

  const handleToggleMusic = () => {
    const isNowPlaying = sound.toggleMusic();
    setIsMusicPlaying(isNowPlaying);
  };

  // Stat updates
  const handleAddStar = (amount: number = 1) => {
    setPlayerStats((prev) => ({
      ...prev,
      stars: prev.stars + amount,
    }));
  };

  const handleIncrementQuizCount = () => {
    setPlayerStats((prev) => ({
      ...prev,
      quizzesCompleted: prev.quizzesCompleted + 1,
    }));
  };

  const handleIncrementBalloonsPopped = () => {
    setPlayerStats((prev) => ({
      ...prev,
      balloonsPopped: prev.balloonsPopped + 1,
    }));
  };

  const handleIncrementMemoryWins = () => {
    setPlayerStats((prev) => ({
      ...prev,
      memoryMatchesWon: prev.memoryMatchesWon + 1,
    }));
  };

  const handleIncrementLettersTraced = () => {
    setPlayerStats((prev) => ({
      ...prev,
      lettersTraced: prev.lettersTraced + 1,
    }));
  };

  const handleResetProgress = () => {
    setPlayerStats(INITIAL_STATS);
    setIsAlbumOpen(false);
  };

  const handleGoToTrace = (letter: HijaiyyahLetter) => {
    setLetterForTracing(letter);
    setCurrentMode('trace');
  };

  return (
    <div className="min-h-screen flex flex-col bg-amber-50/40 text-slate-800 font-kids antialiased">
      {/* Top Bar Navigation */}
      <Navbar
        currentMode={currentMode}
        onSelectMode={(mode) => {
          if (mode !== 'trace') {
            setLetterForTracing(undefined);
          }
          setCurrentMode(mode);
        }}
        playerStats={playerStats}
        onOpenAlbum={() => setIsAlbumOpen(true)}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        isMusicPlaying={isMusicPlaying}
        onToggleMusic={handleToggleMusic}
      />

      {/* Main Game Screen Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {currentMode === 'learn' && (
          <LearnMode
            onGoToTrace={handleGoToTrace}
            onAddStar={handleAddStar}
          />
        )}

        {currentMode === 'quiz' && (
          <QuizMode
            onAddStar={handleAddStar}
            onIncrementQuizCount={handleIncrementQuizCount}
          />
        )}

        {currentMode === 'balloon' && (
          <BalloonPopMode
            onAddStar={handleAddStar}
            onIncrementBalloonsPopped={handleIncrementBalloonsPopped}
          />
        )}

        {currentMode === 'memory' && (
          <MemoryMatchMode
            onAddStar={handleAddStar}
            onIncrementMemoryWins={handleIncrementMemoryWins}
          />
        )}

        {currentMode === 'trace' && (
          <TracingMode
            initialLetter={letterForTracing}
            onAddStar={handleAddStar}
            onIncrementLettersTraced={handleIncrementLettersTraced}
          />
        )}
      </main>

      {/* Child-Friendly Quick Mode Switcher Bar at Bottom */}
      <aside className="border-t border-amber-200/80 bg-white/90 backdrop-blur-xs py-3 px-4 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-kids">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>Mode Bermain:</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentMode('learn');
                }}
                className={`font-bold hover:underline cursor-pointer ${
                  currentMode === 'learn' ? 'text-amber-600' : 'text-slate-600'
                }`}
              >
                1. Taman Belajar
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentMode('quiz');
                }}
                className={`font-bold hover:underline cursor-pointer ${
                  currentMode === 'quiz' ? 'text-amber-600' : 'text-slate-600'
                }`}
              >
                2. Tebak Huruf
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentMode('balloon');
                }}
                className={`font-bold hover:underline cursor-pointer ${
                  currentMode === 'balloon' ? 'text-amber-600' : 'text-slate-600'
                }`}
              >
                3. Pecah Balon
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentMode('memory');
                }}
                className={`font-bold hover:underline cursor-pointer ${
                  currentMode === 'memory' ? 'text-amber-600' : 'text-slate-600'
                }`}
              >
                4. Pasang Kartu
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  sound.playClick();
                  setCurrentMode('trace');
                }}
                className={`font-bold hover:underline cursor-pointer ${
                  currentMode === 'trace' ? 'text-amber-600' : 'text-slate-600'
                }`}
              >
                5. Tulis Huruf
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-[11px]">
            <span>Dibuat khusus untuk anak usia TK (3 - 6 tahun)</span>
            <span>·</span>
            <span className="flex items-center gap-1 text-amber-700 font-semibold">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Ceria & Edukatif
            </span>
          </div>
        </div>
      </aside>

      {/* Sticker Album Modal */}
      {isAlbumOpen && (
        <StickerAlbumModal
          playerStats={playerStats}
          onClose={() => setIsAlbumOpen(false)}
          onResetProgress={handleResetProgress}
        />
      )}
    </div>
  );
}
