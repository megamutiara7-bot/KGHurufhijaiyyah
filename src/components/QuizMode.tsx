import React, { useState, useEffect, useCallback } from 'react';
import { HijaiyyahLetter } from '../types/hijaiyyah';
import { HIJAIYYAH_LETTERS } from '../data/hijaiyyahData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Volume2, Star, Sparkles, RefreshCw, Trophy, Flame, CheckCircle2, ArrowRight } from 'lucide-react';

interface QuizModeProps {
  onAddStar: (amount?: number) => void;
  onIncrementQuizCount: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ onAddStar, onIncrementQuizCount }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [targetLetter, setTargetLetter] = useState<HijaiyyahLetter>(HIJAIYYAH_LETTERS[0]);
  const [options, setOptions] = useState<HijaiyyahLetter[]>([]);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [score, setScore] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [isRoundFinished, setIsRoundFinished] = useState<boolean>(false);

  const TOTAL_QUESTIONS_PER_ROUND = 5;

  // Generate question
  const generateNewQuestion = useCallback(() => {
    // Pick 1 random target letter
    const randomIndex = Math.floor(Math.random() * HIJAIYYAH_LETTERS.length);
    const target = HIJAIYYAH_LETTERS[randomIndex];
    setTargetLetter(target);

    // Pick 3 unique wrong options
    const others = HIJAIYYAH_LETTERS.filter((l) => l.id !== target.id);
    const shuffledOthers = [...others].sort(() => 0.5 - Math.random());
    const wrongOptions = shuffledOthers.slice(0, 3);

    // Shuffle 4 options
    const allOptions = [target, ...wrongOptions].sort(() => 0.5 - Math.random());
    setOptions(allOptions);
    setSelectedOptionId(null);
    setIsAnswered(false);
    setIsCorrect(false);

    // Speak prompt after brief delay
    setTimeout(() => {
      sound.speak(target.arabic);
    }, 200);
  }, []);

  // Start fresh round
  const startNewRound = () => {
    setCurrentQuestionIdx(0);
    setScore(0);
    setStreak(0);
    setIsRoundFinished(false);
    generateNewQuestion();
  };

  useEffect(() => {
    startNewRound();
  }, []);

  const handleRepeatVoice = () => {
    sound.playStarTwinkle();
    sound.speak(targetLetter.arabic);
  };

  const handleSelectOption = (option: HijaiyyahLetter) => {
    if (isAnswered) return;

    setSelectedOptionId(option.id);
    setIsAnswered(true);

    if (option.id === targetLetter.id) {
      // Correct!
      setIsCorrect(true);
      setScore((s) => s + 1);
      const newStreak = streak + 1;
      setStreak(newStreak);
      sound.playSuccess();
      onAddStar(3);

      // Confetti burst
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#F59E0B', '#10B981', '#3B82F6', '#EC4899', '#8B5CF6'],
      });
    } else {
      // Incorrect
      setIsCorrect(false);
      setStreak(0);
      sound.playOops();
    }
  };

  const handleNextQuestion = () => {
    sound.playClick();
    if (currentQuestionIdx + 1 >= TOTAL_QUESTIONS_PER_ROUND) {
      setIsRoundFinished(true);
      sound.playFanfare();
      onIncrementQuizCount();
      onAddStar(5); // Bonus stars for finishing round
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 },
      });
    } else {
      setCurrentQuestionIdx((i) => i + 1);
      generateNewQuestion();
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header bar / status */}
      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-amber-200 shadow-xs">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-500" />
          <span className="font-kids font-bold text-slate-800 text-sm">
            Tebak Huruf · Soal {currentQuestionIdx + 1} dari {TOTAL_QUESTIONS_PER_ROUND}
          </span>
        </div>

        <div className="flex items-center gap-4">
          {streak > 1 && (
            <div className="flex items-center gap-1 text-orange-600 font-kids font-bold text-xs bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200 animate-wiggle">
              <Flame className="w-3.5 h-3.5 fill-orange-500" />
              <span>{streak}x Beruntun!</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 font-kids font-bold text-amber-900 bg-amber-100/80 px-3 py-1 rounded-xl">
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span className="text-sm tabular-nums">{score} Benar</span>
          </div>
        </div>
      </div>

      {!isRoundFinished ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-amber-200/90 shadow-md space-y-8">
          {/* Audio Prompt Box */}
          <div className="text-center space-y-3">
            <p className="font-kids text-sm font-semibold text-amber-700 uppercase tracking-wide">
              Dengarkan & Cari Hurufnya
            </p>
            <h2 className="font-kids text-2xl sm:text-3xl font-extrabold text-slate-800">
              Manakah huruf <span className="text-amber-600 underline decoration-amber-300 decoration-wavy">"{targetLetter.latin}"</span>?
            </h2>

            {/* Big friendly voice button */}
            <div className="pt-2">
              <button
                onClick={handleRepeatVoice}
                className="inline-flex items-center gap-2.5 px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 active:scale-95 text-white font-kids font-bold text-base rounded-2xl shadow-md transition-all cursor-pointer group"
              >
                <Volume2 className="w-6 h-6 group-hover:scale-110 animate-bounce" />
                <span>Tekan untuk Dengar Suara</span>
              </button>
            </div>
          </div>

          {/* 4 Choices Grid */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-xl mx-auto">
            {options.map((option, idx) => {
              const isSelected = selectedOptionId === option.id;
              const isOptionCorrect = option.id === targetLetter.id;

              let cardStyle = 'bg-white border-2 border-amber-200 hover:border-amber-400 hover:bg-amber-50/50';
              if (isAnswered) {
                if (isOptionCorrect) {
                  cardStyle = 'bg-emerald-50 border-4 border-emerald-500 scale-102 shadow-md';
                } else if (isSelected && !isOptionCorrect) {
                  cardStyle = 'bg-rose-50 border-4 border-rose-400 opacity-60';
                } else {
                  cardStyle = 'bg-slate-50 border-2 border-slate-200 opacity-40';
                }
              }

              return (
                <button
                  key={option.id}
                  disabled={isAnswered}
                  onClick={() => handleSelectOption(option)}
                  className={`p-6 sm:p-8 rounded-3xl transition-all duration-200 flex flex-col items-center justify-center cursor-pointer shadow-xs active:scale-95 group ${cardStyle}`}
                >
                  <span className="font-arabic text-7xl sm:text-8xl text-slate-800 leading-none mb-2 select-none group-hover:scale-110 transition-transform">
                    {option.arabic}
                  </span>

                  {isAnswered && isOptionCorrect && (
                    <div className="flex items-center gap-1 text-emerald-700 font-kids font-bold text-xs mt-1 animate-pop-in">
                      <CheckCircle2 className="w-4 h-4 fill-emerald-500 text-white" />
                      <span>Benar! ({option.latin})</span>
                    </div>
                  )}

                  {!isAnswered && (
                    <span className="font-kids text-xs font-semibold text-slate-400">
                      Pilihan {idx + 1}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Feedback & Next Button */}
          {isAnswered && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-4 animate-pop-in">
              <div className="flex items-center gap-3 text-center sm:text-left">
                <span className="text-3xl">{isCorrect ? '🎉' : '💪'}</span>
                <div>
                  <h4 className="font-kids font-bold text-slate-900 text-base">
                    {isCorrect ? 'Hebat Sekali! Kamu Benar!' : 'Hampir Benar, Ayo Coba Lagi!'}
                  </h4>
                  <p className="font-kids text-xs text-slate-600">
                    Ini adalah huruf <strong>{targetLetter.latin} ({targetLetter.arabic})</strong> - seperti pada kata {targetLetter.wordExample.transliteration} ({targetLetter.wordExample.emoji})
                  </p>
                </div>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 active:scale-95 text-white font-kids font-bold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{currentQuestionIdx + 1 >= TOTAL_QUESTIONS_PER_ROUND ? 'Lihat Hasil' : 'Soal Berikutnya'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Round Finished Summary */
        <div className="bg-white rounded-3xl p-8 border-2 border-amber-300 shadow-xl text-center space-y-6 animate-pop-in">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-lg animate-bounce">
            <Trophy className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h3 className="font-kids text-3xl font-extrabold text-slate-900">
              Luar Biasa, Adik Juara! 🌟
            </h3>
            <p className="font-kids text-slate-600 text-sm max-w-md mx-auto">
              Kamu berhasil menyelesaikan 5 tebakan huruf dengan sangat baik!
            </p>
          </div>

          {/* Score card */}
          <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 max-w-sm mx-auto flex items-center justify-around">
            <div className="text-center">
              <span className="block font-kids text-2xl font-black text-amber-700">
                {score} / {TOTAL_QUESTIONS_PER_ROUND}
              </span>
              <span className="font-kids text-xs text-slate-500">Skor Benar</span>
            </div>
            <div className="w-px h-10 bg-amber-200" />
            <div className="text-center">
              <span className="block font-kids text-2xl font-black text-emerald-600">
                +{score * 3 + 5} ⭐
              </span>
              <span className="font-kids text-xs text-slate-500">Bintang Didapat</span>
            </div>
          </div>

          <button
            onClick={() => {
              sound.playClick();
              startNewRound();
            }}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 hover:scale-105 active:scale-95 text-white font-kids font-bold text-base rounded-2xl shadow-lg transition-all cursor-pointer"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Main Tebak Huruf Lagi</span>
          </button>
        </div>
      )}
    </div>
  );
};
