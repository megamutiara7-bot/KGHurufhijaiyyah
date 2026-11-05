export type HarakatType = 'fathah' | 'kasrah' | 'dhommah' | 'original';

export interface HijaiyyahLetter {
  id: string;
  number: number;
  arabic: string;
  name: string;
  latin: string;
  soundPronounce: string; // Phonetic sound e.g. "Alif", "Baaa"
  harakat: {
    fathah: { arabic: string; sound: string; latin: string };
    kasrah: { arabic: string; sound: string; latin: string };
    dhommah: { arabic: string; sound: string; latin: string };
  };
  wordExample: {
    arabic: string;
    transliteration: string;
    meaningId: string;
    icon: string;
    emoji: string;
  };
  strokeHint: string; // Short tip for writing e.g. "Tarik garis lurus dari atas ke bawah"
  color: {
    bg: string;
    border: string;
    text: string;
    lightBg: string;
    gradient: string;
  };
  traceGuidePath?: string; // SVG path data for tracing
}

export type GameMode = 'learn' | 'quiz' | 'balloon' | 'memory' | 'trace';

export interface PlayerStats {
  stars: number;
  quizzesCompleted: number;
  balloonsPopped: number;
  memoryMatchesWon: number;
  lettersTraced: number;
  unlockedBadges: string[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  requiredStars: number;
}
