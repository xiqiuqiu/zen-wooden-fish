export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
}

export interface Inventory {
  merits: number; // Raw clicks (remainder)
  beads: number;  // 100 merits
  incense: number; // 18 beads
  lotus: number;   // 3 incense
}

export enum GameState {
  IDLE,
  MEDITATING,
}

export type Language = 'zh' | 'en';