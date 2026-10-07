'use client';

import { Volume2, Play, Pause, RotateCcw } from 'lucide-react';

interface AudioPlayerHUDProps {
  isSpeaking: boolean;
  onTogglePlay: () => void;
  speechRate: number;
  onChangeRate: (rate: number) => void;
  onRestart: () => void;
  language: string;
}

export function AudioPlayerHUD({
  isSpeaking,
  onTogglePlay,
  speechRate,
  onChangeRate,
  onRestart,
  language,
}: AudioPlayerHUDProps) {
  const rates = [0.75, 1.0, 1.25];

  return (
    <aside
      aria-label="Audio reader controls"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-ink/95 text-surface backdrop-blur-md rounded-2xl shadow-xl border border-white/10 px-4 py-2.5 flex items-center gap-3 sm:gap-4 no-print transition-all"
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onTogglePlay}
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
            isSpeaking
              ? 'bg-amber-400 text-slate-900 shadow-xs'
              : 'bg-accent text-white hover:bg-accent-hover'
          }`}
          aria-label={isSpeaking ? 'Pause audio narration' : 'Play audio narration'}
        >
          {isSpeaking ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
        </button>

        <button
          onClick={onRestart}
          className="p-1.5 text-slate-300 hover:text-white rounded-lg transition-colors"
          title="Restart audio from beginning"
          aria-label="Restart audio from beginning"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="hidden sm:block border-l border-white/20 pl-3">
        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-200">
          <Volume2 className={`w-3.5 h-3.5 ${isSpeaking ? 'text-amber-400 animate-pulse' : ''}`} />
          <span>{isSpeaking ? `Narrating (${language})` : `Listen Aloud (${language})`}</span>
        </div>
        <span className="text-[9px] text-slate-400 block">
          Speech pace adjusted for seniors &amp; ESL
        </span>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center bg-white/10 rounded-lg p-0.5 border border-white/10">
        {rates.map((rate) => (
          <button
            key={rate}
            onClick={() => onChangeRate(rate)}
            className={`px-2 py-0.5 text-[10px] font-bold rounded transition-colors ${
              speechRate === rate
                ? 'bg-surface text-ink shadow-2xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            {rate}x
          </button>
        ))}
      </div>
    </aside>
  );
}
