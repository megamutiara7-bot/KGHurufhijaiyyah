import React, { useState, useEffect, useRef } from 'react';
import { HijaiyyahLetter, HarakatType } from '../types/hijaiyyah';
import { HIJAIYYAH_LETTERS } from '../data/hijaiyyahData';
import { sound } from '../utils/audio';
import { LetterDetailModal } from './LetterDetailModal';
import { Volume2, Play, Square, Sparkles, Filter, Info } from 'lucide-react';

interface LearnModeProps {
  onGoToTrace: (letter: HijaiyyahLetter) => void;
  onAddStar: (amount?: number) => void;
}

export const LearnMode: React.FC<LearnModeProps> = ({ onGoToTrace, onAddStar }) => {
  const [selectedLetter, setSelectedLetter] = useState<HijaiyyahLetter | null>(null);
  const [activeHarakat, setActiveHarakat] = useState<HarakatType>('original');
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [isAutoplaying, setIsAutoplaying] = useState<boolean>(false);
  const [autoplayIndex, setAutoplayIndex] = useState<number>(-1);
  const autoplayTimerRef = useRef<number | null>(null);

  // Filter letters by group
  const filteredLetters = HIJAIYYAH_LETTERS.filter((letter) => {
    if (activeGroup === 'all') return true;
    if (activeGroup === 'g1') return letter.number >= 1 && letter.number <= 7;
    if (activeGroup === 'g2') return letter.number >= 8 && letter.number <= 14;
    if (activeGroup === 'g3') return letter.number >= 15 && letter.number <= 20;
    if (activeGroup === 'g4') return letter.number >= 21 && letter.number <= 29;
    return true;
  });

  const getLetterChar = (letter: HijaiyyahLetter) => {
    switch (activeHarakat) {
      case 'fathah':
        return letter.harakat.fathah.arabic;
      case 'kasrah':
        return letter.harakat.kasrah.arabic;
      case 'dhommah':
        return letter.harakat.dhommah.arabic;
      default:
        return letter.arabic;
    }
  };

  const getLetterSound = (letter: HijaiyyahLetter) => {
    switch (activeHarakat) {
      case 'fathah':
        return letter.harakat.fathah.sound;
      case 'kasrah':
        return letter.harakat.kasrah.sound;
      case 'dhommah':
        return letter.harakat.dhommah.sound;
      default:
        return letter.latin;
    }
  };

  // Card click handler
  const handleCardClick = (letter: HijaiyyahLetter) => {
    sound.playClick();
    const spokenText = getLetterChar(letter);
    sound.speak(spokenText);
    setSelectedLetter(letter);
    onAddStar(1);
  };

  // Autoplay through letters
  useEffect(() => {
    if (!isAutoplaying) {
      if (autoplayTimerRef.current !== null) {
        clearInterval(autoplayTimerRef.current);
        autoplayTimerRef.current = null;
      }
      setAutoplayIndex(-1);
      return;
    }

    let currentIndex = 0;
    setAutoplayIndex(currentIndex);

    const playStep = () => {
      if (currentIndex >= HIJAIYYAH_LETTERS.length) {
        setIsAutoplaying(false);
        setAutoplayIndex(-1);
        sound.playFanfare();
        return;
      }
      const item = HIJAIYYAH_LETTERS[currentIndex];
      setAutoplayIndex(currentIndex);
      sound.speak(getLetterChar(item));
      currentIndex++;
    };

    playStep();
    autoplayTimerRef.current = window.setInterval(playStep, 1700);

    return () => {
      if (autoplayTimerRef.current !== null) {
        clearInterval(autoplayTimerRef.current);
      }
    };
  }, [isAutoplaying, activeHarakat]);

  // Prev / Next inside modal
  const handleNextLetter = () => {
    if (!selectedLetter) return;
    const currentIdx = HIJAIYYAH_LETTERS.findIndex((l) => l.id === selectedLetter.id);
    const nextIdx = (currentIdx + 1) % HIJAIYYAH_LETTERS.length;
    setSelectedLetter(HIJAIYYAH_LETTERS[nextIdx]);
    sound.speak(getLetterChar(HIJAIYYAH_LETTERS[nextIdx]));
  };

  const handlePrevLetter = () => {
    if (!selectedLetter) return;
    const currentIdx = HIJAIYYAH_LETTERS.findIndex((l) => l.id === selectedLetter.id);
    const prevIdx = (currentIdx - 1 + HIJAIYYAH_LETTERS.length) % HIJAIYYAH_LETTERS.length;
    setSelectedLetter(HIJAIYYAH_LETTERS[prevIdx]);
    sound.speak(getLetterChar(HIJAIYYAH_LETTERS[prevIdx]));
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Intro */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 p-6 sm:p-8 text-white shadow-md">
        <div className="relative z-10 max-w-3xl">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-amber-200 fill-amber-200" />
            <span className="font-kids font-bold text-xs uppercase tracking-wider text-amber-100">
              Taman Belajar Huruf Hijaiyyah
            </span>
          </div>
          <h2 className="font-kids text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white text-balance leading-tight">
            Sentuh Hurufnya & Dengarkan Bunyinya! 🌟
          </h2>
          <p className="font-kids text-sm sm:text-base text-amber-100 mt-2 max-w-xl">
            Ayo adik-adik, ketuk kartu huruf untuk mendengar suara dan melihat contoh kata bergambar yang lucu!
          </p>

          {/* Autoplay & Guide action */}
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                sound.playClick();
                setIsAutoplaying(!isAutoplaying);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-kids font-bold text-sm shadow-md transition-all cursor-pointer ${
                isAutoplaying
                  ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                  : 'bg-white text-amber-800 hover:bg-amber-50 active:scale-95'
              }`}
            >
              {isAutoplaying ? (
                <>
                  <Square className="w-4 h-4 fill-white" />
                  <span>Hentikan Suara Berurutan</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-amber-800" />
                  <span>Putar Suara Semua Huruf (Otomatis)</span>
                </>
              )}
            </button>

            <span className="text-xs font-kids text-amber-100 flex items-center gap-1.5 bg-black/10 px-3 py-2 rounded-xl">
              <Info className="w-3.5 h-3.5" />
              <span>Dapat +1 bintang setiap kali kamu menyentuh huruf baru!</span>
            </span>
          </div>
        </div>

        {/* Decorative background Arabic letters */}
        <div className="absolute right-4 -bottom-6 font-arabic text-9xl text-white/15 select-none pointer-events-none hidden md:block">
          ي هـ و ن م
        </div>
      </div>

      {/* Control Bar: Harakat Selector + Group Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-amber-200/80 shadow-xs">
        {/* Harakat filter (Asli, Fathah, Kasrah, Dhommah) */}
        <div className="flex items-center gap-2">
          <span className="font-kids font-bold text-xs text-slate-500 whitespace-nowrap">
            Tanda Baca (Harakat):
          </span>
          <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200">
            <button
              onClick={() => {
                sound.playClick();
                setActiveHarakat('original');
              }}
              className={`px-3 py-1.5 rounded-lg font-kids text-xs font-bold transition-all cursor-pointer ${
                activeHarakat === 'original'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-amber-800'
              }`}
            >
              Asli (ا)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveHarakat('fathah');
              }}
              className={`px-3 py-1.5 rounded-lg font-kids text-xs font-bold transition-all cursor-pointer ${
                activeHarakat === 'fathah'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-rose-800'
              }`}
            >
              Fathah (-a)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveHarakat('kasrah');
              }}
              className={`px-3 py-1.5 rounded-lg font-kids text-xs font-bold transition-all cursor-pointer ${
                activeHarakat === 'kasrah'
                  ? 'bg-sky-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-sky-800'
              }`}
            >
              Kasrah (-i)
            </button>
            <button
              onClick={() => {
                sound.playClick();
                setActiveHarakat('dhommah');
              }}
              className={`px-3 py-1.5 rounded-lg font-kids text-xs font-bold transition-all cursor-pointer ${
                activeHarakat === 'dhommah'
                  ? 'bg-emerald-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-emerald-800'
              }`}
            >
              Dhommah (-u)
            </button>
          </div>
        </div>

        {/* Group Selector */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
          <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {[
            { id: 'all', label: 'Semua (29)' },
            { id: 'g1', label: 'ا - خ' },
            { id: 'g2', label: 'د - ص' },
            { id: 'g3', label: 'ض - ف' },
            { id: 'g4', label: 'ق - ي' },
          ].map((grp) => (
            <button
              key={grp.id}
              onClick={() => {
                sound.playClick();
                setActiveGroup(grp.id);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-kids font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeGroup === grp.id
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {grp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Hijaiyyah Letter Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5 sm:gap-4">
        {filteredLetters.map((letter) => {
          const isHighlighted = isAutoplaying && HIJAIYYAH_LETTERS[autoplayIndex]?.id === letter.id;

          return (
            <div
              key={letter.id}
              onClick={() => handleCardClick(letter)}
              className={`relative bg-white rounded-3xl p-4 border-2 border-amber-200/90 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer text-center group flex flex-col items-center justify-between hover:-translate-y-1 active:scale-95 ${
                isHighlighted
                  ? 'ring-4 ring-amber-400 bg-amber-50 scale-105 shadow-lg'
                  : ''
              }`}
            >
              {/* Number badge & sound icon */}
              <div className="w-full flex items-center justify-between text-[11px] font-kids font-bold text-slate-400">
                <span className="w-6 h-6 rounded-full bg-amber-100/80 text-amber-900 flex items-center justify-center text-[10px]">
                  {letter.number}
                </span>
                <Volume2 className="w-4 h-4 text-amber-500 group-hover:scale-125 transition-transform" />
              </div>

              {/* Main Arabic Letter Display */}
              <div className="my-2 py-1 flex items-center justify-center">
                <span className="font-arabic text-6xl sm:text-7xl text-slate-800 leading-none group-hover:text-amber-600 transition-colors select-none">
                  {getLetterChar(letter)}
                </span>
              </div>

              {/* Latin Name & Phonetic Sound */}
              <div className="w-full pt-1 border-t border-slate-100">
                <h3 className="font-kids font-bold text-slate-900 text-sm sm:text-base">
                  {getLetterSound(letter)}
                </h3>
                <div className="flex items-center justify-center gap-1 text-[11px] font-kids text-slate-500">
                  <span>{letter.wordExample.emoji}</span>
                  <span className="truncate max-w-[85px]">{letter.wordExample.transliteration}</span>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="mt-2 w-full py-1 bg-amber-50 rounded-xl text-[10px] font-kids font-bold text-amber-800 opacity-90 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                Buka & Pelajari
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Detail */}
      {selectedLetter && (
        <LetterDetailModal
          letter={selectedLetter}
          onClose={() => setSelectedLetter(null)}
          onGoToTrace={(l) => {
            setSelectedLetter(null);
            onGoToTrace(l);
          }}
          onNextLetter={handleNextLetter}
          onPrevLetter={handlePrevLetter}
        />
      )}
    </div>
  );
};
