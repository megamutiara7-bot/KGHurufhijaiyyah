import React, { useState, useEffect, useRef } from 'react';
import { HijaiyyahLetter } from '../types/hijaiyyah';
import { HIJAIYYAH_LETTERS } from '../data/hijaiyyahData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Volume2, Trophy, RefreshCw, Sparkles, Target, Zap } from 'lucide-react';

interface BalloonItem {
  id: number;
  letter: HijaiyyahLetter;
  x: number; // percentage 5% to 85%
  y: number; // top percentage, starts at 105% and moves to -20%
  speed: number;
  color: string;
  size: number;
  popped: boolean;
}

interface BalloonPopModeProps {
  onAddStar: (amount?: number) => void;
  onIncrementBalloonsPopped: () => void;
}

const BALLOON_COLORS = [
  'from-rose-400 to-red-500 shadow-rose-200',
  'from-sky-400 to-blue-500 shadow-sky-200',
  'from-amber-400 to-yellow-500 shadow-amber-200',
  'from-emerald-400 to-teal-500 shadow-emerald-200',
  'from-purple-400 to-violet-500 shadow-purple-200',
  'from-pink-400 to-rose-400 shadow-pink-200',
  'from-orange-400 to-amber-500 shadow-orange-200',
];

export const BalloonPopMode: React.FC<BalloonPopModeProps> = ({
  onAddStar,
  onIncrementBalloonsPopped,
}) => {
  const [targetLetter, setTargetLetter] = useState<HijaiyyahLetter>(HIJAIYYAH_LETTERS[1]); // Default 'Ba'
  const [balloons, setBalloons] = useState<BalloonItem[]>([]);
  const [score, setScore] = useState<number>(0);
  const [popsCount, setPopsCount] = useState<number>(0);
  const [freePlay, setFreePlay] = useState<boolean>(false); // Free play vs target mission
  const [feedbackMsg, setFeedbackMsg] = useState<string>('Pecahkan balon huruf yang diminta!');
  const requestRef = useRef<number | null>(null);
  const nextBalloonId = useRef<number>(1);
  const lastSpawnTime = useRef<number>(Date.now());

  // Set new target letter
  const pickNewTarget = () => {
    const randomIdx = Math.floor(Math.random() * HIJAIYYAH_LETTERS.length);
    const newTarget = HIJAIYYAH_LETTERS[randomIdx];
    setTargetLetter(newTarget);
    sound.speak(`Cari huruf ${newTarget.latin}`);
    setFeedbackMsg(`Ayo cari & pecahkan huruf: ${newTarget.latin} (${newTarget.arabic})!`);
  };

  // Initial setup
  useEffect(() => {
    pickNewTarget();
    setBalloons([]);
  }, []);

  // Game animation loop
  useEffect(() => {
    let isRunning = true;

    const gameLoop = () => {
      const now = Date.now();

      // Spawn balloon every 1.2 to 1.8 seconds if < 7 on screen
      if (now - lastSpawnTime.current > 1300) {
        lastSpawnTime.current = now;
        setBalloons((prev) => {
          if (prev.filter((b) => !b.popped).length >= 7) return prev;

          // 40% chance to spawn the target letter, 60% random other letter
          let letterToSpawn: HijaiyyahLetter;
          if (!freePlay && Math.random() < 0.45) {
            letterToSpawn = targetLetter;
          } else {
            letterToSpawn = HIJAIYYAH_LETTERS[Math.floor(Math.random() * HIJAIYYAH_LETTERS.length)];
          }

          const newBalloon: BalloonItem = {
            id: nextBalloonId.current++,
            letter: letterToSpawn,
            x: Math.floor(Math.random() * 75) + 8, // 8% to 83%
            y: 105,
            speed: 0.18 + Math.random() * 0.12, // gentle rising speed for kids
            color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
            size: Math.floor(Math.random() * 15) + 85, // 85px to 100px
            popped: false,
          };

          return [...prev, newBalloon];
        });
      }

      // Move balloons upward
      setBalloons((prev) =>
        prev
          .map((b) => ({
            ...b,
            y: b.popped ? b.y : b.y - b.speed,
          }))
          .filter((b) => b.y > -25) // remove once floated off screen
      );

      if (isRunning) {
        requestRef.current = requestAnimationFrame(gameLoop);
      }
    };

    requestRef.current = requestAnimationFrame(gameLoop);

    return () => {
      isRunning = false;
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [targetLetter, freePlay]);

  // Handle balloon click
  const handleBalloonClick = (balloon: BalloonItem) => {
    if (balloon.popped) return;

    sound.playPop();
    onIncrementBalloonsPopped();
    setPopsCount((p) => p + 1);

    // Mark as popped immediately
    setBalloons((prev) =>
      prev.map((b) => (b.id === balloon.id ? { ...b, popped: true } : b))
    );

    // Speak letter
    sound.speak(balloon.letter.arabic);

    if (freePlay || balloon.letter.id === targetLetter.id) {
      // Correct!
      sound.playSuccess();
      setScore((s) => s + 10);
      onAddStar(2);
      setFeedbackMsg(`Hebat! Balon ${balloon.letter.latin} (${balloon.letter.arabic}) pecah! 🎈`);

      // Sparkle confetti
      confetti({
        particleCount: 25,
        spread: 45,
        origin: { x: balloon.x / 100, y: Math.max(0.1, balloon.y / 100) },
      });

      // If target mode, after hitting target, maybe pick a new target occasionally
      if (!freePlay && Math.random() < 0.6) {
        setTimeout(pickNewTarget, 1000);
      }
    } else {
      // Hit a different balloon
      setFeedbackMsg(`Itu huruf ${balloon.letter.latin} (${balloon.letter.arabic}). Cari huruf ${targetLetter.latin} ya! 😊`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top HUD */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-amber-200 shadow-xs">
        {/* Current Target or Freeplay */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-arabic text-3xl font-bold shadow-sm">
            {freePlay ? '🎈' : targetLetter.arabic}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-kids font-bold text-xs uppercase tracking-wider text-slate-500">
                {freePlay ? 'Mode Bebas Ceria' : 'Misi Target Huruf'}
              </span>
              <button
                onClick={() => {
                  sound.playClick();
                  setFreePlay(!freePlay);
                }}
                className="text-[11px] font-kids font-bold text-amber-700 bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded-md cursor-pointer transition-colors"
              >
                Ganti ke: {freePlay ? 'Mode Misi Target' : 'Mode Bebas Santai'}
              </button>
            </div>
            <h3 className="font-kids font-bold text-slate-900 text-lg">
              {freePlay ? 'Pecahkan Semua Balon Bebas!' : `Cari Huruf: ${targetLetter.latin} (${targetLetter.arabic})`}
            </h3>
          </div>
        </div>

        {/* Action button & score */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          {!freePlay && (
            <button
              onClick={() => {
                sound.playClick();
                pickNewTarget();
              }}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-kids font-bold text-xs rounded-xl cursor-pointer transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Ganti Huruf</span>
            </button>
          )}

          <div className="flex items-center gap-3">
            <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl font-kids text-xs font-bold text-amber-900">
              Skor: <span className="text-sm font-extrabold text-amber-600 tabular-nums">{score}</span>
            </div>
            <div className="bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl font-kids text-xs font-bold text-emerald-900">
              Pecah: <span className="text-sm font-extrabold text-emerald-600 tabular-nums">{popsCount}</span> 🎈
            </div>
          </div>
        </div>
      </div>

      {/* Game Playing Arena (Sky & Clouds) */}
      <div className="relative w-full h-[520px] rounded-3xl overflow-hidden bg-gradient-to-b from-sky-300 via-sky-200 to-amber-100/70 border-4 border-amber-200 shadow-inner select-none cursor-crosshair">
        {/* Floating Clouds Background */}
        <div className="absolute top-6 left-12 w-28 h-10 bg-white/70 rounded-full blur-[1px] pointer-events-none" />
        <div className="absolute top-16 right-20 w-40 h-12 bg-white/60 rounded-full blur-[1px] pointer-events-none" />
        <div className="absolute top-36 left-1/3 w-36 h-10 bg-white/50 rounded-full blur-[1px] pointer-events-none" />

        {/* Live Feedback banner at top */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 bg-white/90 backdrop-blur-xs px-5 py-2 rounded-full border border-sky-200 shadow-sm text-center">
          <p className="font-kids font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
            <span>{feedbackMsg}</span>
          </p>
        </div>

        {/* Floating Balloons */}
        {balloons.map((balloon) => {
          if (balloon.popped) {
            return (
              <div
                key={balloon.id}
                style={{
                  left: `${balloon.x}%`,
                  top: `${balloon.y}%`,
                }}
                className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none animate-ping text-3xl font-extrabold text-amber-500"
              >
                ✨ POP!
              </div>
            );
          }

          const isTarget = !freePlay && balloon.letter.id === targetLetter.id;

          return (
            <div
              key={balloon.id}
              onClick={() => handleBalloonClick(balloon)}
              style={{
                left: `${balloon.x}%`,
                top: `${balloon.y}%`,
                width: `${balloon.size}px`,
                height: `${balloon.size * 1.25}px`,
              }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 active:scale-90 group z-10"
            >
              {/* Balloon Body */}
              <div
                className={`relative w-full h-full rounded-[50%_50%_50%_50%_/_60%_60%_40%_40%] bg-gradient-to-br ${balloon.color} shadow-lg flex flex-col items-center justify-center p-2 border-2 border-white/40 ${
                  isTarget ? 'ring-4 ring-amber-300 ring-offset-2' : ''
                }`}
              >
                {/* Balloon Highlight reflection */}
                <div className="absolute top-2 left-3 w-3 h-6 bg-white/40 rounded-full -rotate-25 pointer-events-none" />

                {/* Arabic Letter on Balloon */}
                <span className="font-arabic text-4xl sm:text-5xl font-bold text-white leading-none drop-shadow-md select-none mt-1">
                  {balloon.letter.arabic}
                </span>

                {/* Subtext Latin name */}
                <span className="font-kids font-bold text-[11px] text-white/90 drop-shadow-xs select-none">
                  {balloon.letter.latin}
                </span>

                {/* Balloon Knot */}
                <div className="absolute -bottom-2 w-3 h-2 bg-inherit rounded-xs" />
                {/* Balloon String */}
                <div className="absolute -bottom-7 w-0.5 h-6 bg-slate-500/50 rounded-full" />
              </div>
            </div>
          );
        })}

        {/* Bottom ground decoration */}
        <div className="absolute -bottom-6 left-0 right-0 h-16 bg-gradient-to-t from-emerald-500/80 to-transparent pointer-events-none flex items-end justify-center pb-2">
          <p className="font-kids text-xs font-bold text-emerald-950/70">
            🌳 Tekan balon yang sedang terbang ke atas untuk meletuskannya! 🎈
          </p>
        </div>
      </div>
    </div>
  );
};
