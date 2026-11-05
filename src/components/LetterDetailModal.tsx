import React, { useState } from 'react';
import { HijaiyyahLetter, HarakatType } from '../types/hijaiyyah';
import { sound } from '../utils/audio';
import { X, Volume2, Sparkles, PenTool, ArrowRight, ArrowLeft } from 'lucide-react';

interface LetterDetailModalProps {
  letter: HijaiyyahLetter;
  onClose: () => void;
  onGoToTrace: (letter: HijaiyyahLetter) => void;
  onPrevLetter: () => void;
  onNextLetter: () => void;
}

export const LetterDetailModal: React.FC<LetterDetailModalProps> = ({
  letter,
  onClose,
  onGoToTrace,
  onPrevLetter,
  onNextLetter,
}) => {
  const [activeHarakat, setActiveHarakat] = useState<HarakatType>('original');

  const getDisplayedArabic = () => {
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

  const getPronunciationText = () => {
    switch (activeHarakat) {
      case 'fathah':
        return letter.harakat.fathah.sound;
      case 'kasrah':
        return letter.harakat.kasrah.sound;
      case 'dhommah':
        return letter.harakat.dhommah.sound;
      default:
        return letter.soundPronounce;
    }
  };

  const handleSpeak = () => {
    sound.playStarTwinkle();
    const textToSpeak = getDisplayedArabic();
    sound.speak(textToSpeak);
  };

  const handleWordSpeak = () => {
    sound.playClick();
    sound.speak(letter.wordExample.arabic);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-pop-in">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border-4 border-amber-300 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 text-white">
          <div className="flex items-center gap-2">
            <span className="font-kids font-bold text-lg">
              Huruf ke-{letter.number} · {letter.latin}
            </span>
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

        {/* Modal content body */}
        <div className="p-6 text-center space-y-6">
          {/* Giant Arabic Display Box */}
          <div className="relative mx-auto w-48 h-48 sm:w-56 sm:h-56 rounded-3xl bg-amber-50/70 border-4 border-dashed border-amber-300 flex flex-col items-center justify-center shadow-inner group">
            <span className="font-arabic text-8xl sm:text-9xl text-amber-900 select-none transition-transform group-hover:scale-105">
              {getDisplayedArabic()}
            </span>

            {/* Pronunciation speech tag */}
            <button
              onClick={handleSpeak}
              className="mt-2 flex items-center gap-2 px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-full font-kids font-bold text-base shadow-md transition-all cursor-pointer"
            >
              <Volume2 className="w-4 h-4 animate-bounce" />
              <span>Bunyi: "{getPronunciationText()}"</span>
            </button>
          </div>

          {/* Harakat Switcher Tabs */}
          <div>
            <p className="font-kids font-medium text-xs text-slate-500 mb-2">
              Pilih Harakat (Tanda Baca):
            </p>
            <div className="grid grid-cols-4 gap-2 max-w-xs mx-auto">
              <button
                onClick={() => {
                  sound.playClick();
                  setActiveHarakat('original');
                }}
                className={`py-2 px-1 rounded-xl font-kids text-xs font-bold transition-all cursor-pointer ${
                  activeHarakat === 'original'
                    ? 'bg-amber-500 text-white shadow-xs scale-102 ring-2 ring-amber-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-amber-100'
                }`}
              >
                <span>Asli</span>
                <span className="block font-arabic text-base">{letter.arabic}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveHarakat('fathah');
                }}
                className={`py-2 px-1 rounded-xl font-kids text-xs font-bold transition-all cursor-pointer ${
                  activeHarakat === 'fathah'
                    ? 'bg-rose-500 text-white shadow-xs scale-102 ring-2 ring-rose-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-rose-100'
                }`}
              >
                <span>Fathah (-a)</span>
                <span className="block font-arabic text-base">{letter.harakat.fathah.arabic}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveHarakat('kasrah');
                }}
                className={`py-2 px-1 rounded-xl font-kids text-xs font-bold transition-all cursor-pointer ${
                  activeHarakat === 'kasrah'
                    ? 'bg-sky-500 text-white shadow-xs scale-102 ring-2 ring-sky-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-sky-100'
                }`}
              >
                <span>Kasrah (-i)</span>
                <span className="block font-arabic text-base">{letter.harakat.kasrah.arabic}</span>
              </button>

              <button
                onClick={() => {
                  sound.playClick();
                  setActiveHarakat('dhommah');
                }}
                className={`py-2 px-1 rounded-xl font-kids text-xs font-bold transition-all cursor-pointer ${
                  activeHarakat === 'dhommah'
                    ? 'bg-emerald-500 text-white shadow-xs scale-102 ring-2 ring-emerald-300'
                    : 'bg-slate-100 text-slate-700 hover:bg-emerald-100'
                }`}
              >
                <span>Dhommah (-u)</span>
                <span className="block font-arabic text-base">{letter.harakat.dhommah.arabic}</span>
              </button>
            </div>
          </div>

          {/* Example word & kid illustration */}
          <div 
            onClick={handleWordSpeak}
            className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl select-none group-hover:scale-115 transition-transform">
                {letter.wordExample.emoji}
              </span>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <span className="font-kids font-bold text-slate-900 text-base">
                    {letter.wordExample.transliteration}
                  </span>
                  <span className="font-arabic text-lg font-bold text-amber-700">
                    ({letter.wordExample.arabic})
                  </span>
                </div>
                <p className="font-kids text-xs text-slate-500">
                  {letter.wordExample.meaningId}
                </p>
              </div>
            </div>
            <Volume2 className="w-5 h-5 text-amber-600 group-hover:scale-110 transition-transform" />
          </div>

          {/* Writing tip hint */}
          <div className="p-3 bg-slate-50 rounded-xl text-left border border-slate-200 text-xs font-kids text-slate-600 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
            <span>
              <strong>Cara Menulis:</strong> {letter.strokeHint}
            </span>
          </div>

          {/* Actions: Tracing Shortcut + Prev / Next */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={() => {
                sound.playClick();
                onPrevLetter();
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-kids text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Sebelumnya</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onGoToTrace(letter);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-kids font-bold text-sm rounded-xl shadow-md active:scale-95 transition-all cursor-pointer"
            >
              <PenTool className="w-4 h-4" />
              <span>Latihan Tulis Huruf Ini</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                onNextLetter();
              }}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-kids text-xs font-bold text-slate-700 transition-colors cursor-pointer"
            >
              <span>Selanjutnya</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
