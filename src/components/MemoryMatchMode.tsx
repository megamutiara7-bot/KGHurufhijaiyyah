import React, { useState, useEffect } from 'react';
import { HijaiyyahLetter } from '../types/hijaiyyah';
import { HIJAIYYAH_LETTERS } from '../data/hijaiyyahData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Sparkles, Trophy, RefreshCw, Star, CheckCircle2 } from 'lucide-react';

interface MemoryCard {
  uniqueId: string;
  letter: HijaiyyahLetter;
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryMatchModeProps {
  onAddStar: (amount?: number) => void;
  onIncrementMemoryWins: () => void;
}

export const MemoryMatchMode: React.FC<MemoryMatchModeProps> = ({
  onAddStar,
  onIncrementMemoryWins,
}) => {
  const [pairsCount, setPairsCount] = useState<number>(4); // 4 pairs (8 cards) default for TK
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState<number>(0);
  const [matchesFound, setMatchesFound] = useState<number>(0);
  const [isGameWon, setIsGameWon] = useState<boolean>(false);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Initialize deck
  const initGame = (numPairs: number = pairsCount) => {
    // Pick random unique letters
    const shuffledLetters = [...HIJAIYYAH_LETTERS].sort(() => 0.5 - Math.random());
    const selectedLetters = shuffledLetters.slice(0, numPairs);

    // Create 2 cards per letter
    const deck: MemoryCard[] = [];
    selectedLetters.forEach((letter) => {
      deck.push({
        uniqueId: `${letter.id}-1`,
        letter,
        isFlipped: false,
        isMatched: false,
      });
      deck.push({
        uniqueId: `${letter.id}-2`,
        letter,
        isFlipped: false,
        isMatched: false,
      });
    });

    // Shuffle deck
    const shuffledDeck = deck.sort(() => 0.5 - Math.random());

    setCards(shuffledDeck);
    setFlippedCards([]);
    setMoves(0);
    setMatchesFound(0);
    setIsGameWon(false);
    setIsProcessing(false);
  };

  useEffect(() => {
    initGame(pairsCount);
  }, [pairsCount]);

  // Card click handler
  const handleCardClick = (index: number) => {
    if (isProcessing) return;
    if (cards[index].isFlipped || cards[index].isMatched) return;

    sound.playClick();
    sound.speak(cards[index].letter.arabic);

    // Flip this card
    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, index];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setIsProcessing(true);
      setMoves((m) => m + 1);

      const [firstIdx, secondIdx] = newFlipped;
      const card1 = newCards[firstIdx];
      const card2 = newCards[secondIdx];

      if (card1.letter.id === card2.letter.id) {
        // MATCH!
        setTimeout(() => {
          sound.playSuccess();
          onAddStar(2);

          const matchedCards = [...newCards];
          matchedCards[firstIdx].isMatched = true;
          matchedCards[secondIdx].isMatched = true;
          setCards(matchedCards);
          setFlippedCards([]);
          setIsProcessing(false);

          const newMatchesCount = matchesFound + 1;
          setMatchesFound(newMatchesCount);

          // Check if won
          if (newMatchesCount === pairsCount) {
            setIsGameWon(true);
            sound.playFanfare();
            onIncrementMemoryWins();
            onAddStar(10); // Victory bonus
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
            });
          }
        }, 500);
      } else {
        // MISMATCH
        setTimeout(() => {
          sound.playOops();
          const resetCards = [...newCards];
          resetCards[firstIdx].isFlipped = false;
          resetCards[secondIdx].isFlipped = false;
          setCards(resetCards);
          setFlippedCards([]);
          setIsProcessing(false);
        }, 1100);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top HUD */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-amber-200 shadow-xs">
        <div>
          <h2 className="font-kids font-bold text-slate-800 text-lg flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-400" />
            <span>Pasang Kartu Huruf Kembar</span>
          </h2>
          <p className="font-kids text-xs text-slate-500">
            Balik 2 kartu untuk menemukan pasangan huruf hijaiyyah yang sama!
          </p>
        </div>

        {/* Controls & Difficulty */}
        <div className="flex items-center gap-3">
          {/* Difficulty pills */}
          <div className="flex items-center gap-1 bg-amber-50 p-1 rounded-xl border border-amber-200">
            {[
              { count: 4, label: 'Mudah (8 Kartu)' },
              { count: 6, label: 'Sedang (12 Kartu)' },
              { count: 8, label: 'Pintar (16 Kartu)' },
            ].map((lvl) => (
              <button
                key={lvl.count}
                onClick={() => {
                  sound.playClick();
                  setPairsCount(lvl.count);
                }}
                className={`px-3 py-1.5 rounded-lg font-kids text-xs font-bold transition-all cursor-pointer ${
                  pairsCount === lvl.count
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-amber-800'
                }`}
              >
                {lvl.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              sound.playClick();
              initGame(pairsCount);
            }}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-kids font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Kocok Ulang</span>
          </button>
        </div>
      </div>

      {/* Progress counters */}
      <div className="flex items-center justify-center gap-6 text-sm font-kids font-bold text-slate-700">
        <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-xs">
          Pasangan Ditemukan:{' '}
          <span className="text-amber-600 font-extrabold tabular-nums">
            {matchesFound} / {pairsCount}
          </span>
        </span>
        <span className="flex items-center gap-1.5 bg-white px-4 py-2 rounded-xl border border-amber-200 shadow-xs">
          Langkah Tebakan:{' '}
          <span className="text-slate-800 font-extrabold tabular-nums">{moves}</span>
        </span>
      </div>

      {/* Cards Table Grid */}
      <div
        className={`grid gap-3.5 sm:gap-4 mx-auto ${
          pairsCount === 4
            ? 'grid-cols-4 max-w-xl'
            : pairsCount === 6
            ? 'grid-cols-3 sm:grid-cols-4 max-w-2xl'
            : 'grid-cols-4 max-w-3xl'
        }`}
      >
        {cards.map((card, idx) => {
          const isRevealed = card.isFlipped || card.isMatched;

          return (
            <div
              key={card.uniqueId}
              onClick={() => handleCardClick(idx)}
              className="aspect-square relative cursor-pointer select-none perspective-1000 group"
            >
              <div
                className={`w-full h-full rounded-3xl transition-transform duration-300 transform-style-3d shadow-sm hover:shadow-md flex items-center justify-center border-3 ${
                  isRevealed
                    ? card.isMatched
                      ? 'bg-emerald-50 border-emerald-400 scale-98 ring-4 ring-emerald-200'
                      : 'bg-white border-amber-400 scale-102'
                    : 'bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 group-hover:scale-102 active:scale-95'
                }`}
              >
                {isRevealed ? (
                  /* Front: Arabic letter & word */
                  <div className="flex flex-col items-center justify-center text-center p-2 animate-pop-in">
                    <span className="font-arabic text-5xl sm:text-6xl text-slate-900 leading-none mb-1">
                      {card.letter.arabic}
                    </span>
                    <span className="font-kids font-bold text-xs text-amber-700">
                      {card.letter.latin}
                    </span>
                    <span className="text-sm mt-0.5">{card.letter.wordExample.emoji}</span>
                  </div>
                ) : (
                  /* Back: Card cover */
                  <div className="flex flex-col items-center justify-center text-white">
                    <span className="text-2xl sm:text-3xl font-kids font-bold opacity-80 group-hover:scale-115 transition-transform">
                      ❓
                    </span>
                    <span className="font-kids font-bold text-[10px] opacity-75 mt-1">
                      Buka Aku
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Victory Modal */}
      {isGameWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-pop-in">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full border-4 border-amber-400 shadow-2xl text-center space-y-6">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg animate-bounce">
              <Trophy className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <h3 className="font-kids text-3xl font-black text-slate-900">
                Hebat Sekali! 🎉
              </h3>
              <p className="font-kids text-slate-600 text-sm">
                Kamu berhasil mencocokkan semua {pairsCount} pasang huruf hijaiyyah hanya dalam{' '}
                <strong>{moves} langkah</strong>!
              </p>
            </div>

            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3].map((starIdx) => (
                <Star
                  key={starIdx}
                  className="w-8 h-8 text-amber-400 fill-amber-400 animate-pulse"
                />
              ))}
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 font-kids text-sm font-bold text-amber-800">
              Hadiah: +10 Bintang Ditambahkan! ⭐
            </div>

            <button
              onClick={() => {
                sound.playClick();
                initGame(pairsCount);
              }}
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-kids font-bold text-base rounded-2xl shadow-lg active:scale-95 transition-all cursor-pointer"
            >
              Main Pasang Kartu Lagi
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
