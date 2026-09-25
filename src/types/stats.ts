export interface RecentDictation {
  text: string;
  words: number;
  at: number;
}

export interface UsageStats {
  totalWords: number;
  totalDictationSeconds: number;
  totalAppSeconds: number;
  dictationCount: number;
  recent: RecentDictation[];
}
