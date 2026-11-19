import React from 'react';
import { Process } from '../../types/process';
import { Cpu, ListOrdered, CheckCircle2, Clock, Hourglass } from 'lucide-react';

interface Props {
  currentTime: number;
  activePid: string | null;
  readyQueue: string[];
  remainingBursts: Record<string, number>;
  processes: Process[];
}

export const LiveInspector: React.FC<Props> = ({
  currentTime,
  activePid,
  readyQueue,
  remainingBursts,
  processes,
}) => {
  const isIdle = activePid === 'IDLE';

  const activeProcess = processes.find((p) => p.pid === activePid);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* 1. CPU State Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <Cpu className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Active CPU State</span>
          </div>
          <span className="flex h-2 w-2 relative">
            <span
              className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                isIdle ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
            <span
              className={`relative inline-flex rounded-full h-2 w-2 ${
                isIdle ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
            />
          </span>
        </div>

        <div className="flex items-center gap-3 py-2">
          {isIdle ? (
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 flex items-center justify-center text-amber-600 dark:text-amber-400">
                <Hourglass className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  CPU Idle
                </h4>
                <p className="text-xs text-slate-400">No ready processes</p>
              </div>
            </div>
          ) : activeProcess ? (
            <div className="flex items-center gap-2.5">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center font-mono font-bold text-white shadow-md text-base"
                style={{ backgroundColor: activeProcess.color || '#3b82f6' }}
              >
                {activeProcess.pid}
              </div>
              <div>
                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm">
                  Executing {activeProcess.pid}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  Rem. Burst: {remainingBursts[activeProcess.pid] ?? 0} / {activeProcess.burstTime}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400">Simulation not started</div>
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Clock Tick</span>
          <span className="font-mono font-semibold text-slate-700 dark:text-slate-300">
            t = {currentTime}
          </span>
        </div>
      </div>

      {/* 2. Ready Queue Pipeline Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <ListOrdered className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Ready Queue Pipeline</span>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-900/40">
            {readyQueue.length} Waiting
          </span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto py-2 min-h-[48px]">
          {readyQueue.length === 0 ? (
            <span className="text-xs text-slate-400 italic">Queue is currently empty</span>
          ) : (
            readyQueue.map((pid, idx) => {
              const proc = processes.find((p) => p.pid === pid);
              return (
                <div
                  key={pid}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono shrink-0 shadow-xs animate-in zoom-in-95 duration-150"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: proc?.color || '#3b82f6' }}
                  />
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pid}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    ({remainingBursts[pid] ?? 0})
                  </span>
                  {idx < readyQueue.length - 1 && (
                    <span className="text-slate-300 dark:text-slate-600 ml-1">→</span>
                  )}
                </div>
              );
            })
          )}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Dispatch Order</span>
          <span className="text-slate-600 dark:text-slate-300 font-medium">Head → Tail</span>
        </div>
      </div>

      {/* 3. Remaining Bursts Summary */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
            <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Process Status & Progress</span>
          </div>
        </div>

        <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
          {processes.map((p) => {
            const rem = remainingBursts[p.pid] ?? p.burstTime;
            const isCompleted = rem === 0;
            const isArrived = p.arrivalTime <= currentTime;
            const isRunning = p.pid === activePid;

            const progressPct = ((p.burstTime - rem) / p.burstTime) * 100;

            return (
              <div key={p.pid} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: p.color || '#3b82f6' }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{p.pid}</span>
                    {isRunning && (
                      <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded text-[9px] font-sans font-medium">
                        Running
                      </span>
                    )}
                    {isCompleted && (
                      <span className="flex items-center gap-0.5 text-emerald-600 text-[10px]">
                        <CheckCircle2 className="w-3 h-3" /> Done
                      </span>
                    )}
                    {!isArrived && (
                      <span className="text-slate-400 text-[10px]">Arrives at t={p.arrivalTime}</span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-500">
                    {rem} / {p.burstTime}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-150 rounded-full"
                    style={{
                      width: `${progressPct}%`,
                      backgroundColor: isCompleted ? '#10b981' : p.color || '#3b82f6',
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Overall Progress</span>
          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
            {Object.values(remainingBursts).filter((r) => r === 0).length} / {processes.length} Done
          </span>
        </div>
      </div>
    </div>
  );
};
