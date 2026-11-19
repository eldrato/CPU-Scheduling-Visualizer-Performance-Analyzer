import React, { useState } from 'react';
import { TimelineSegment } from '../../algorithms/types';
import { Process } from '../../types/process';
import { Layers } from 'lucide-react';

interface Props {
  timeline: TimelineSegment[];
  processes: Process[];
  currentTime: number;
  makespan: number;
  onSeek: (time: number) => void;
}

interface HoveredBlock {
  seg: TimelineSegment;
  x: number;
  y: number;
}

export const GanttChart: React.FC<Props> = ({
  timeline,
  processes,
  currentTime,
  makespan,
  onSeek,
}) => {
  const [hovered, setHovered] = useState<HoveredBlock | null>(null);

  if (makespan === 0 || timeline.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No timeline data available. Please add processes to run the simulation.</p>
      </div>
    );
  }

  // Map PID to process color
  const colorMap: Record<string, string> = {};
  for (const p of processes) {
    colorMap[p.pid] = p.color || '#3b82f6';
  }

  // Calculate ticks
  const tickStep = makespan > 40 ? Math.ceil(makespan / 20) : makespan > 20 ? 2 : 1;
  const ticks: number[] = [];
  for (let t = 0; t <= makespan; t += tickStep) {
    ticks.push(t);
  }
  if (ticks[ticks.length - 1] !== makespan) {
    ticks.push(makespan);
  }

  const scrubberPercent = Math.min(100, Math.max(0, (currentTime / makespan) * 100));

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 relative">
      {/* Title & Legend */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            CPU Execution Gantt Timeline
          </h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {processes.map((p) => (
            <div key={p.pid} className="flex items-center gap-1.5 font-mono">
              <span
                className="w-3 h-3 rounded-md shrink-0 shadow-xs"
                style={{ backgroundColor: p.color || '#3b82f6' }}
              />
              <span className="text-slate-600 dark:text-slate-300 font-medium">{p.pid}</span>
            </div>
          ))}
          <div className="flex items-center gap-1.5 font-mono">
            <span className="w-3 h-3 rounded-md shrink-0 bg-slate-200 dark:bg-slate-700 border border-dashed border-slate-400 flex items-center justify-center text-[8px] text-slate-600">
              ///
            </span>
            <span className="text-slate-500 dark:text-slate-400">IDLE</span>
          </div>
        </div>
      </div>

      {/* Main Gantt Canvas */}
      <div className="relative pt-4 pb-8 select-none">
        {/* SVG Patterns for IDLE Hatch and Grid */}
        <svg className="absolute w-0 h-0">
          <defs>
            <pattern
              id="idleHatch"
              width="8"
              height="8"
              patternTransform="rotate(45 0 0)"
              patternUnits="userSpaceOnUse"
            >
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="8"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-slate-300 dark:text-slate-700"
              />
            </pattern>
          </defs>
        </svg>

        {/* Timeline Bar Container */}
        <div className="relative h-16 w-full bg-slate-100 dark:bg-slate-800/80 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 flex shadow-inner">
          {timeline.map((seg, idx) => {
            const widthPct = ((seg.end - seg.start) / makespan) * 100;
            const isIdle = seg.isIdle || seg.pid === 'IDLE';
            const color = colorMap[seg.pid] || '#64748b';

            return (
              <div
                key={`${seg.pid}-${seg.start}-${idx}`}
                onClick={() => onSeek(seg.start)}
                onMouseEnter={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  setHovered({
                    seg,
                    x: rect.left + rect.width / 2,
                    y: rect.top,
                  });
                }}
                onMouseLeave={() => setHovered(null)}
                style={{
                  width: `${widthPct}%`,
                  backgroundColor: isIdle ? undefined : color,
                }}
                className={`h-full relative group cursor-pointer transition-transform hover:brightness-110 flex items-center justify-center font-mono font-semibold text-xs border-r border-white/20 dark:border-slate-900/30 overflow-hidden ${
                  isIdle ? 'bg-slate-200/70 dark:bg-slate-800' : 'text-white shadow-xs'
                }`}
              >
                {isIdle && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none">
                    <rect width="100%" height="100%" fill="url(#idleHatch)" />
                  </svg>
                )}

                <span className="relative z-10 drop-shadow-sm px-1 truncate">
                  {isIdle ? 'IDLE' : seg.pid}
                </span>

                {/* Duration indicator if wide enough */}
                {widthPct > 5 && (
                  <span className="absolute bottom-1 right-1.5 text-[9px] opacity-75 font-mono">
                    {seg.end - seg.start}
                  </span>
                )}
              </div>
            );
          })}

          {/* Real-time scrubber needle */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none transition-all duration-75 shadow-lg"
            style={{ left: `${scrubberPercent}%` }}
          >
            <div className="w-3 h-3 bg-red-500 rounded-full -ml-[5px] -top-1 absolute shadow-md" />
            <div className="w-3 h-3 bg-red-500 rounded-full -ml-[5px] -bottom-1 absolute shadow-md" />
          </div>
        </div>

        {/* Time Scale Ticks Bar */}
        <div className="relative w-full h-6 mt-1.5">
          {ticks.map((t) => {
            const leftPct = (t / makespan) * 100;
            return (
              <div
                key={t}
                onClick={() => onSeek(t)}
                className="absolute transform -translate-x-1/2 flex flex-col items-center cursor-pointer group"
                style={{ left: `${leftPct}%` }}
              >
                <div className="w-px h-2 bg-slate-300 dark:bg-slate-700 group-hover:bg-blue-500 transition-colors" />
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-medium mt-0.5">
                  {t}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Floating Hover Tooltip */}
      {hovered && (
        <div
          className="fixed z-50 transform -translate-x-1/2 -translate-y-full mb-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs rounded-xl py-2 px-3 shadow-xl pointer-events-none animate-in fade-in zoom-in-95 duration-100 border border-slate-800 dark:border-slate-200"
          style={{ left: hovered.x, top: hovered.y - 8 }}
        >
          <div className="font-semibold text-sm mb-1 flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor:
                  hovered.seg.isIdle || hovered.seg.pid === 'IDLE'
                    ? '#94a3b8'
                    : colorMap[hovered.seg.pid] || '#3b82f6',
              }}
            />
            <span>{hovered.seg.isIdle ? 'CPU Idle' : `Process ${hovered.seg.pid}`}</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] font-mono text-slate-300 dark:text-slate-600">
            <span>Start Time:</span>
            <span className="font-bold text-white dark:text-slate-900">{hovered.seg.start}</span>
            <span>End Time:</span>
            <span className="font-bold text-white dark:text-slate-900">{hovered.seg.end}</span>
            <span>Duration:</span>
            <span className="font-bold text-white dark:text-slate-900">
              {hovered.seg.end - hovered.seg.start} units
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
