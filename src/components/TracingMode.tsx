import React, { useRef, useState, useEffect } from 'react';
import { HijaiyyahLetter } from '../types/hijaiyyah';
import { HIJAIYYAH_LETTERS } from '../data/hijaiyyahData';
import { sound } from '../utils/audio';
import confetti from 'canvas-confetti';
import { Volume2, Eraser, Check, ArrowLeft, ArrowRight, Sparkles, Palette, Star } from 'lucide-react';

interface TracingModeProps {
  initialLetter?: HijaiyyahLetter;
  onAddStar: (amount?: number) => void;
  onIncrementLettersTraced: () => void;
}

const BRUSH_COLORS = [
  { id: 'rainbow', label: 'Pelangi 🌈', color: 'rainbow' },
  { id: 'gold', label: 'Emas ✨', color: '#F59E0B' },
  { id: 'emerald', label: 'Hijau 🌿', color: '#10B981' },
  { id: 'blue', label: 'Biru 💧', color: '#3B82F6' },
  { id: 'pink', label: 'Merah Muda 🌸', color: '#EC4899' },
  { id: 'orange', label: 'Oranye 🍊', color: '#F97316' },
];

export const TracingMode: React.FC<TracingModeProps> = ({
  initialLetter,
  onAddStar,
  onIncrementLettersTraced,
}) => {
  const [currentLetter, setCurrentLetter] = useState<HijaiyyahLetter>(
    initialLetter || HIJAIYYAH_LETTERS[0]
  );
  const [brushColor, setBrushColor] = useState<string>('#F59E0B');
  const [isRainbow, setIsRainbow] = useState<boolean>(false);
  const [brushSize, setBrushSize] = useState<number>(18);
  const [hasDrawn, setHasDrawn] = useState<boolean>(false);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);
  const rainbowHueRef = useRef<number>(0);

  // Sync if initialLetter changes
  useEffect(() => {
    if (initialLetter) {
      setCurrentLetter(initialLetter);
    }
  }, [initialLetter]);

  // Clear canvas whenever letter changes
  useEffect(() => {
    clearCanvas();
    sound.speak(currentLetter.arabic);
  }, [currentLetter]);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const getCanvasCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX = 0;
    let clientY = 0;

    if ('touches' in e && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if ('clientX' in e) {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    isDrawingRef.current = true;
    const pos = getCanvasCoordinates(e);
    lastPosRef.current = pos;
    setHasDrawn(true);
    drawDot(pos.x, pos.y);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawingRef.current) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const currentPos = getCanvasCoordinates(e);
    const lastPos = lastPosRef.current || currentPos;

    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(currentPos.x, currentPos.y);

    if (isRainbow) {
      rainbowHueRef.current = (rainbowHueRef.current + 5) % 360;
      ctx.strokeStyle = `hsl(${rainbowHueRef.current}, 95%, 55%)`;
    } else {
      ctx.strokeStyle = brushColor;
    }

    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = 8;
    ctx.shadowColor = isRainbow ? `hsl(${rainbowHueRef.current}, 95%, 55%)` : brushColor;
    ctx.stroke();

    lastPosRef.current = currentPos;
  };

  const drawDot = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fillStyle = isRainbow ? `hsl(${rainbowHueRef.current}, 95%, 55%)` : brushColor;
    ctx.shadowBlur = 8;
    ctx.shadowColor = ctx.fillStyle;
    ctx.fill();
  };

  const stopDrawing = () => {
    isDrawingRef.current = false;
    lastPosRef.current = null;
  };

  const handleFinish = () => {
    sound.playSuccess();
    onAddStar(3);
    onIncrementLettersTraced();
    setShowCelebration(true);

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
    });

    setTimeout(() => {
      setShowCelebration(false);
      handleNextLetter();
    }, 1800);
  };

  const handleNextLetter = () => {
    sound.playClick();
    const currentIdx = HIJAIYYAH_LETTERS.findIndex((l) => l.id === currentLetter.id);
    const nextIdx = (currentIdx + 1) % HIJAIYYAH_LETTERS.length;
    setCurrentLetter(HIJAIYYAH_LETTERS[nextIdx]);
  };

  const handlePrevLetter = () => {
    sound.playClick();
    const currentIdx = HIJAIYYAH_LETTERS.findIndex((l) => l.id === currentLetter.id);
    const prevIdx = (currentIdx - 1 + HIJAIYYAH_LETTERS.length) % HIJAIYYAH_LETTERS.length;
    setCurrentLetter(HIJAIYYAH_LETTERS[prevIdx]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Banner and Navigation */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-amber-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-arabic text-3xl font-bold shadow-sm">
            {currentLetter.arabic}
          </div>
          <div>
            <h2 className="font-kids font-bold text-slate-800 text-lg flex items-center gap-2">
              <span>Tulis Huruf: {currentLetter.latin}</span>
              <button
                onClick={() => {
                  sound.playStarTwinkle();
                  sound.speak(currentLetter.arabic);
                }}
                title="Dengar Bunyi Huruf"
                className="p-1 rounded-full bg-amber-100 hover:bg-amber-200 text-amber-700 cursor-pointer transition-colors"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </h2>
            <p className="font-kids text-xs text-amber-700">
              💡 {currentLetter.strokeHint}
            </p>
          </div>
        </div>

        {/* Prev / Next controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevLetter}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-kids font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Sebelumnya</span>
          </button>
          <button
            onClick={handleNextLetter}
            className="flex items-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-kids font-bold text-xs rounded-xl cursor-pointer transition-colors"
          >
            <span>Selanjutnya</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tracing Blackboard Arena */}
      <div className="relative w-full h-[460px] sm:h-[500px] rounded-3xl overflow-hidden bg-slate-900 border-4 border-amber-300 shadow-xl flex items-center justify-center select-none touch-none">
        {/* Blackboard texture grid lines */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        {/* Middle Guideline baseline (helpful for handwriting orientation) */}
        <div className="absolute top-1/2 left-8 right-8 border-b-2 border-dashed border-slate-700/60 pointer-events-none" />

        {/* Translucent Arabic Letter Template Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <span className="font-arabic text-[260px] sm:text-[320px] text-slate-600/50 leading-none select-none tracking-normal drop-shadow-md">
            {currentLetter.arabic}
          </span>
        </div>

        {/* Hint arrow instruction */}
        <div className="absolute top-4 left-4 z-10 bg-slate-800/80 backdrop-blur-xs px-3.5 py-1.5 rounded-full border border-slate-700 text-xs font-kids font-medium text-amber-300 flex items-center gap-1.5 pointer-events-none">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Ikuti bayangan huruf putih di atas papan tulis!</span>
        </div>

        {/* Interactive HTML5 Canvas Layer */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="absolute inset-0 w-full h-full cursor-crosshair z-20"
        />

        {/* Celebration overlay */}
        {showCelebration && (
          <div className="absolute inset-0 z-30 bg-emerald-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white animate-pop-in">
            <span className="text-6xl mb-2 animate-bounce">🌟</span>
            <h3 className="font-kids text-3xl font-black text-amber-300">
              Hebat Sekali!
            </h3>
            <p className="font-kids text-sm text-emerald-100 mt-1">
              Tulisanmu sangat bagus! (+3 Bintang ⭐)
            </p>
          </div>
        )}
      </div>

      {/* Brush Tools & Action Controls */}
      <div className="p-4 bg-white rounded-2xl border border-amber-200 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Colors */}
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4 text-slate-400" />
          <span className="font-kids text-xs font-bold text-slate-600">Warna Kapur:</span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {BRUSH_COLORS.map((bc) => {
              const isSelected = bc.id === 'rainbow' ? isRainbow : !isRainbow && brushColor === bc.color;

              return (
                <button
                  key={bc.id}
                  onClick={() => {
                    sound.playClick();
                    if (bc.id === 'rainbow') {
                      setIsRainbow(true);
                    } else {
                      setIsRainbow(false);
                      setBrushColor(bc.color);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-xl font-kids text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-amber-500 text-white shadow-xs scale-105 ring-2 ring-amber-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {bc.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Brush Size */}
        <div className="flex items-center gap-2">
          <span className="font-kids text-xs font-bold text-slate-600">Tebal:</span>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {[
              { size: 12, label: 'Sedang' },
              { size: 20, label: 'Tebal' },
              { size: 30, label: 'Ekstra' },
            ].map((s) => (
              <button
                key={s.size}
                onClick={() => {
                  sound.playClick();
                  setBrushSize(s.size);
                }}
                className={`px-2.5 py-1 rounded-lg font-kids text-xs font-bold transition-all cursor-pointer ${
                  brushSize === s.size
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Clear and Finish Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sound.playClick();
              clearCanvas();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-kids font-bold text-xs cursor-pointer transition-colors"
          >
            <Eraser className="w-4 h-4 text-slate-500" />
            <span>Hapus & Ulangi</span>
          </button>

          <button
            onClick={handleFinish}
            disabled={!hasDrawn}
            className={`flex items-center gap-1.5 px-5 py-2 rounded-xl font-kids font-bold text-xs shadow-md transition-all cursor-pointer ${
              hasDrawn
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Selesai Menulis!</span>
          </button>
        </div>
      </div>

      {/* Quick Letters Carousel at Bottom */}
      <div className="p-3 bg-white rounded-2xl border border-amber-200 shadow-xs space-y-2">
        <span className="font-kids text-xs font-bold text-slate-500 block px-1">
          Pilih Huruf untuk Ditulis:
        </span>
        <div className="flex items-center gap-2 overflow-x-auto py-1 px-1 no-scrollbar">
          {HIJAIYYAH_LETTERS.map((letter) => {
            const isCurrent = letter.id === currentLetter.id;
            return (
              <button
                key={letter.id}
                onClick={() => {
                  sound.playClick();
                  setCurrentLetter(letter);
                }}
                className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-arabic text-2xl font-bold shrink-0 transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-amber-500 text-white shadow-md scale-105 ring-2 ring-amber-300'
                    : 'bg-amber-50 text-slate-800 hover:bg-amber-100'
                }`}
              >
                <span>{letter.arabic}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
