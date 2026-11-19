import React from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  RotateCcw,
  Gauge,
  Clock,
} from 'lucide-react';

interface Props {
  currentTime: number;
  makespan: number;
  isPlaying: boolean;
  speed: number;
  onTogglePlay: () => void;
  onStepForward: () => void;
  onStepBack: () => void;
  onReset: () => void;
  onSeek: (time: number) => void;
  onChangeSpeed: (speed: number) => void;
}

export const PlaybackControls: React.FC<Props> = ({
  currentTime,
  makespan,
  isPlaying,
  speed,
  onTogglePlay,
  onStepForward,
  onStepBack,
  onReset,
  onSeek,
  onChangeSpeed,
}) => {
  const speeds = [0.5, 1, 2, 4];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
      {/* Time Display and Scrubber */}
      <div className="w-full md:w-auto flex-1 flex items-center gap-3">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/50 rounded-xl text-blue-700 dark:text-blue-300 font-mono text-sm shrink-0">
          <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="font-semibold">t = {currentTime}</span>
          <span className="text-blue-400 dark:text-blue-500">/ {makespan}</span>
        </div>

        <input
          type="range"
          min="0"
          max={Math.max(1, makespan)}
          value={currentTime}
          onChange={(e) => onSeek(Number(e.target.value))}
          className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      {/* Main Playback Buttons */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={onReset}
          title="Reset to t=0"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={onStepBack}
          disabled={currentTime <= 0}
          title="Step Back 1 Unit"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors active:scale-95"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={onTogglePlay}
          title={isPlaying ? 'Pause Simulation' : 'Play Simulation'}
          className="flex items-center justify-center w-11 h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all active:scale-90"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
        </button>

        <button
          onClick={onStepForward}
          disabled={currentTime >= makespan}
          title="Step Forward 1 Unit"
          className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl transition-colors active:scale-95"
        >
          <SkipForward className="w-4 h-4" />
        </button>
      </div>

      {/* Speed Selector */}
      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
        <Gauge className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
        {speeds.map((s) => (
          <button
            key={s}
            onClick={() => onChangeSpeed(s)}
            className={`px-2 py-1 text-xs font-semibold rounded-lg transition-all ${
              speed === s
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
};
