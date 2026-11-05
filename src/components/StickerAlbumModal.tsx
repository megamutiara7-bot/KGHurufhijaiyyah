import React from 'react';
import { PlayerStats, Badge } from '../types/hijaiyyah';
import { INITIAL_BADGES } from '../data/hijaiyyahData';
import { sound } from '../utils/audio';
import { X, Award, Star, Lock, Sparkles, RefreshCcw } from 'lucide-react';

interface StickerAlbumModalProps {
  playerStats: PlayerStats;
  onClose: () => void;
  onResetProgress: () => void;
}

export const StickerAlbumModal: React.FC<StickerAlbumModalProps> = ({
  playerStats,
  onClose,
  onResetProgress,
}) => {
  // Check badge unlock status based on current stars
  const badges: Badge[] = INITIAL_BADGES.map((b) => ({
    ...b,
    unlocked: playerStats.stars >= b.requiredStars,
  }));

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-pop-in">
      <div 
        className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white">
          <div className="flex items-center gap-2">
            <Award className="w-6 h-6 text-amber-200 fill-amber-200" />
            <h3 className="font-kids font-bold text-lg">
              Buku Bintang & Lencana Juara
            </h3>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Star Summary Card */}
          <div className="p-5 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div className="space-y-1">
              <span className="font-kids text-xs font-semibold text-amber-700 uppercase tracking-wide">
                Total Koleksi Bintangmu
              </span>
              <div className="flex items-center gap-2">
                <Star className="w-8 h-8 text-amber-500 fill-amber-400 animate-pulse-subtle" />
                <span className="font-kids text-4xl font-black text-amber-900 tabular-nums">
                  {playerStats.stars}
                </span>
              </div>
              <p className="font-kids text-xs text-slate-500">
                Lencana Terbuka: {unlockedCount} dari {badges.length}
              </p>
            </div>

            {/* Overall Crown Mascot */}
            <div className="w-16 h-16 rounded-2xl bg-amber-200/60 flex items-center justify-center text-4xl select-none">
              👑
            </div>
          </div>

          {/* Activity counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-kids text-lg font-bold text-slate-800 tabular-nums">
                {playerStats.quizzesCompleted}
              </span>
              <span className="block font-kids text-[10px] text-slate-500">
                🎯 Kuis Selesai
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-kids text-lg font-bold text-slate-800 tabular-nums">
                {playerStats.balloonsPopped}
              </span>
              <span className="block font-kids text-[10px] text-slate-500">
                🎈 Balon Pecah
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-kids text-lg font-bold text-slate-800 tabular-nums">
                {playerStats.memoryMatchesWon}
              </span>
              <span className="block font-kids text-[10px] text-slate-500">
                🧠 Pasang Kartu
              </span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="font-kids text-lg font-bold text-slate-800 tabular-nums">
                {playerStats.lettersTraced}
              </span>
              <span className="block font-kids text-[10px] text-slate-500">
                ✏️ Huruf Ditulis
              </span>
            </div>
          </div>

          {/* Badges Grid */}
          <div className="space-y-3">
            <h4 className="font-kids font-bold text-sm text-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Daftar Lencana & Piala:</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 transition-all ${
                    badge.unlocked
                      ? 'bg-amber-50/70 border-amber-300 shadow-xs'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-xl bg-white shadow-xs border border-amber-100 flex items-center justify-center text-2xl shrink-0">
                    <span>{badge.icon}</span>
                    {!badge.unlocked && (
                      <div className="absolute inset-0 bg-slate-900/40 rounded-xl flex items-center justify-center">
                        <Lock className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <h5 className="font-kids font-bold text-slate-900 text-xs sm:text-sm truncate">
                        {badge.title}
                      </h5>
                      <span className="font-kids text-[11px] font-bold text-amber-700 whitespace-nowrap">
                        {badge.requiredStars} ⭐
                      </span>
                    </div>
                    <p className="font-kids text-[11px] text-slate-500 line-clamp-2">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Reset button */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Apakah ingin mengulang bintang dan pencapaian dari awal?')) {
                  sound.playClick();
                  onResetProgress();
                }
              }}
              className="text-xs font-kids font-semibold text-rose-500 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCcw className="w-3 h-3" />
              <span>Mulai Petualangan Baru</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white font-kids font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              Tutup & Lanjut Main
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
