import React from 'react';
import { Process } from '../../types/process';
import { AlgorithmResult } from '../../algorithms/types';
import { solveFCFS } from '../../algorithms/fcfs';
import { solveSJF } from '../../algorithms/sjf';
import { solveSRTF } from '../../algorithms/srtf';
import { solvePriority } from '../../algorithms/priority';
import { solveRoundRobin } from '../../algorithms/roundRobin';
import { solveMLFQ } from '../../algorithms/mlfq';
import { ComparisonCharts } from './ComparisonCharts';
import {
  Trophy,
  Award,
  Sparkles,
  BarChart3,
  CheckCircle,
} from 'lucide-react';

interface Props {
  processes: Process[];
  quantum: number;
  lowerNumberIsHigherPriority: boolean;
}

export const CompareAllView: React.FC<Props> = ({
  processes,
  quantum,
  lowerNumberIsHigherPriority,
}) => {
  if (processes.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 text-center text-slate-400">
        Please add processes to view side-by-side algorithm comparison.
      </div>
    );
  }

  // Execute all algorithms
  const fcfsRes = solveFCFS(processes);
  const sjfRes = solveSJF(processes);
  const srtfRes = solveSRTF(processes);
  const prioNPRes = solvePriority(processes, false, { lowerNumberIsHigherPriority });
  const prioPRes = solvePriority(processes, true, { lowerNumberIsHigherPriority });
  const rrRes = solveRoundRobin(processes, { quantum });
  const mlfqRes = solveMLFQ(processes);

  const allResults: AlgorithmResult[] = [
    fcfsRes,
    sjfRes,
    srtfRes,
    prioNPRes,
    prioPRes,
    rrRes,
    mlfqRes,
  ];

  // Find best values
  const minWT = Math.min(...allResults.map((r) => r.aggregateMetrics.avgWaitingTime));
  const minTAT = Math.min(...allResults.map((r) => r.aggregateMetrics.avgTurnaroundTime));
  const minRT = Math.min(...allResults.map((r) => r.aggregateMetrics.avgResponseTime));
  const minSwitches = Math.min(...allResults.map((r) => r.aggregateMetrics.totalContextSwitches));
  const maxUtil = Math.max(...allResults.map((r) => r.aggregateMetrics.cpuUtilization));

  // Determine winners
  const bestWTAlgos = allResults.filter((r) => r.aggregateMetrics.avgWaitingTime === minWT);
  const bestTATAlgos = allResults.filter((r) => r.aggregateMetrics.avgTurnaroundTime === minTAT);
  const bestRTAlgos = allResults.filter((r) => r.aggregateMetrics.avgResponseTime === minRT);
  const bestSwitchAlgos = allResults.filter(
    (r) => r.aggregateMetrics.totalContextSwitches === minSwitches
  );

  // Generate automated natural language conclusion
  const generateConclusion = (): string => {
    const srtfBestWT = srtfRes.aggregateMetrics.avgWaitingTime === minWT;
    const fcfsDiff = (fcfsRes.aggregateMetrics.avgWaitingTime - minWT).toFixed(2);
    const srtfSwitches = srtfRes.aggregateMetrics.totalContextSwitches;
    const rrSwitches = rrRes.aggregateMetrics.totalContextSwitches;

    let conclusion = `For this process workload, **${bestWTAlgos.map((a) => a.algorithmName).join(' and ')}** achieved the minimum average waiting time of **${minWT} ms** and average turnaround time of **${minTAT} ms**. `;

    if (srtfBestWT && fcfsRes.aggregateMetrics.avgWaitingTime > minWT) {
      conclusion += `Preemptive SJF (SRTF) demonstrated its theoretical optimality by reducing average waiting time by **${fcfsDiff} ms** compared to FCFS, at the expense of **${srtfSwitches}** context switches. `;
    }

    if (fcfsRes.aggregateMetrics.avgWaitingTime === minWT && fcfsRes.aggregateMetrics.totalContextSwitches === 0) {
      conclusion += `FCFS performed equivalently with zero context switch overhead, indicating that arrival sequence or burst durations were naturally ordered. `;
    } else if (fcfsRes.aggregateMetrics.avgWaitingTime > minWT * 1.5) {
      conclusion += `FCFS exhibited symptoms of the **Convoy Effect**, where long-burst jobs significantly delayed shorter subsequent tasks. `;
    }

    if (rrRes.aggregateMetrics.avgResponseTime <= minRT + 1) {
      conclusion += `Round Robin (q=${quantum}) delivered strong interactive responsiveness (Avg RT = **${rrRes.aggregateMetrics.avgResponseTime} ms**), but introduced **${rrSwitches}** context switches. `;
    }

    return conclusion;
  };

  return (
    <div className="space-y-6">
      {/* Top Best-in-Class Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 dark:from-blue-950/40 dark:to-slate-900 border border-blue-200 dark:border-blue-900/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lowest Waiting Time</span>
            <Trophy className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
            {minWT} ms
          </div>
          <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-1 truncate">
            {bestWTAlgos.map((a) => a.algorithmName.split(' ')[0]).join(', ')}
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 dark:from-purple-950/40 dark:to-slate-900 border border-purple-200 dark:border-purple-900/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lowest Turnaround</span>
            <Award className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
            {minTAT} ms
          </div>
          <div className="text-xs text-purple-700 dark:text-purple-300 font-medium mt-1 truncate">
            {bestTATAlgos.map((a) => a.algorithmName.split(' ')[0]).join(', ')}
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 dark:from-amber-950/40 dark:to-slate-900 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fastest Response</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
            {minRT} ms
          </div>
          <div className="text-xs text-amber-700 dark:text-amber-300 font-medium mt-1 truncate">
            {bestRTAlgos.map((a) => a.algorithmName.split(' ')[0]).join(', ')}
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 dark:from-emerald-950/40 dark:to-slate-900 border border-emerald-200 dark:border-emerald-900/60 rounded-2xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Lowest Preemption Cost</span>
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-slate-100 font-mono">
            {minSwitches} Switches
          </div>
          <div className="text-xs text-emerald-700 dark:text-emerald-300 font-medium mt-1 truncate">
            {bestSwitchAlgos.map((a) => a.algorithmName.split(' ')[0]).join(', ')}
          </div>
        </div>
      </div>

      {/* Auto-Generated Verdict / Academic Summary Card */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-semibold text-sm mb-2">
          <BarChart3 className="w-4 h-4" />
          <span>Automated Performance Verdict & Trade-off Analysis</span>
        </div>
        <p
          className="text-xs leading-relaxed text-slate-700 dark:text-slate-300"
          dangerouslySetInnerHTML={{
            __html: generateConclusion().replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>'),
          }}
        />
      </div>

      {/* Side-by-Side Comparison Matrix Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
            Side-by-Side Algorithm Benchmark Matrix
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Green highlights denote optimal values for this process configuration.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/75 dark:bg-slate-850 text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Algorithm</th>
                <th className="py-3 px-4">Avg Waiting (WT)</th>
                <th className="py-3 px-4">Avg Turnaround (TAT)</th>
                <th className="py-3 px-4">Avg Response (RT)</th>
                <th className="py-3 px-4">CPU Util %</th>
                <th className="py-3 px-4">Throughput</th>
                <th className="py-3 px-4">Context Switches</th>
                <th className="py-3 px-4">Makespan</th>
              </tr>
            </thead>
            <tbody>
              {allResults.map((res) => {
                const isBestWT = res.aggregateMetrics.avgWaitingTime === minWT;
                const isBestTAT = res.aggregateMetrics.avgTurnaroundTime === minTAT;
                const isBestRT = res.aggregateMetrics.avgResponseTime === minRT;
                const isBestSwitches = res.aggregateMetrics.totalContextSwitches === minSwitches;
                const isBestUtil = res.aggregateMetrics.cpuUtilization === maxUtil;

                return (
                  <tr
                    key={res.algorithmId}
                    className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-sans font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                      <span>{res.algorithmName}</span>
                      {isBestWT && (
                        <span className="p-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                          <Trophy className="w-3 h-3" />
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          isBestWT
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {res.aggregateMetrics.avgWaitingTime} ms
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          isBestTAT
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {res.aggregateMetrics.avgTurnaroundTime} ms
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          isBestRT
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {res.aggregateMetrics.avgResponseTime} ms
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={
                          isBestUtil
                            ? 'font-bold text-emerald-600 dark:text-emerald-400'
                            : 'text-slate-600 dark:text-slate-300'
                        }
                      >
                        {res.aggregateMetrics.cpuUtilization}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                      {res.aggregateMetrics.throughput}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold ${
                          isBestSwitches
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                            : 'text-slate-700 dark:text-slate-200'
                        }`}
                      >
                        {res.aggregateMetrics.totalContextSwitches}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 dark:text-slate-200 font-semibold">
                      {res.aggregateMetrics.makespan} ms
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visual Bar Charts */}
      <ComparisonCharts results={allResults} />
    </div>
  );
};
