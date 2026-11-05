import React from 'react';
import { GameMode, PlayerStats } from '../types/hijaiyyah';
import { sound } from '../utils/audio';
import { Volume2, VolumeX, Music, Award, Star, BookOpen, Sparkles, HelpCircle, Gamepad2, PenTool } from 'lucide-react';

interface NavbarProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  playerStats: PlayerStats;
  onOpenAlbum: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isMusicPlaying: boolean;
  onToggleMusic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  onSelectMode,
  playerStats,
  onOpenAlbum,
  isMuted,
  onToggleMute,
  isMusicPlaying,
  onToggleMusic,
}) => {
  const navItems: { mode: GameMode; label: string; icon: React.ReactNode }[] = [
    { mode: 'learn', label: 'Taman Belajar', icon: <BookOpen className="w-4 h-4" /> },
    { mode: 'quiz', label: 'Tebak Huruf', icon: <HelpCircle className="w-4 h-4" /> },
    { mode: 'balloon', label: 'Pecah Balon', icon: <Gamepad2 className="w-4 h-4" /> },
    { mode: 'memory', label: 'Pasang Kartu', icon: <Sparkles className="w-4 h-4" /> },
    { mode: 'trace', label: 'Tulis Huruf', icon: <PenTool className="w-4 h-4" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-amber-200/60 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand title */}
        <div 
          onClick={() => {
            sound.playClick();
            onSelectMode('learn');
          }}
          className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap shrink-0 group select-none"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105 active:scale-95">
            <span className="font-arabic text-2xl font-bold leading-none mb-0.5">ب</span>
          </div>
          <div>
            <h1 className="font-kids text-xl sm:text-2xl font-bold tracking-tight bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 bg-clip-text text-transparent">
              Hijaiyyah Ceria
            </h1>
            <p className="text-[11px] font-medium text-amber-700/80 -mt-0.5 hidden sm:block">
              Belajar & Bermain Anak TK
            </p>
          </div>
        </div>

        {/* Zone 2: Navigation buttons (Single-line interactive mode tabs) */}
        <nav className="flex items-center gap-1.5 overflow-x-auto py-1 px-1 no-scrollbar">
          {navItems.map((item) => {
            const isActive = currentMode === item.mode;
            return (
              <button
                key={item.mode}
                onClick={() => {
                  sound.playClick();
                  onSelectMode(item.mode);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl text-xs sm:text-sm font-kids font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-sm scale-102 ring-2 ring-amber-300'
                    : 'text-slate-600 hover:text-amber-800 hover:bg-amber-100/60'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions & Star Meter */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Star counter */}
          <button
            onClick={() => {
              sound.playClick();
              onOpenAlbum();
            }}
            title="Lihat Hadiah Bintang & Lencana"
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100/80 hover:bg-amber-200/90 border border-amber-300/80 rounded-xl transition-all cursor-pointer group"
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500 fill-amber-400 animate-pulse-subtle" />
            <span className="font-kids font-bold text-amber-900 text-xs sm:text-sm tabular-nums">
              {playerStats.stars}
            </span>
            <Award className="w-3.5 h-3.5 text-amber-700 ml-0.5 group-hover:scale-110 transition-transform" />
          </button>

          {/* Background Music Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleMusic();
            }}
            title={isMusicPlaying ? 'Matikan Musik Latar' : 'Putar Musik Ceria'}
            aria-label="Toggle Musik"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              isMusicPlaying
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ring-2 ring-emerald-300'
                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
            }`}
          >
            <Music className={`w-4 h-4 ${isMusicPlaying ? 'animate-bounce' : ''}`} />
          </button>

          {/* Sound FX Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleMute();
            }}
            title={isMuted ? 'Nyalakan Efek Suara' : 'Matikan Suara'}
            aria-label="Toggle Suara"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              !isMuted
                ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </header>
  );
};
