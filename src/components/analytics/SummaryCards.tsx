import React from 'react';
import { AggregateMetrics } from '../../types/process';
import { Clock, TrendingUp, Cpu, Activity, RefreshCw, Zap } from 'lucide-react';

interface Props {
  metrics: AggregateMetrics;
}

export const SummaryCards: React.FC<Props> = ({ metrics }) => {
  const cards = [
    {
      title: 'Avg Waiting Time',
      value: `${metrics.avgWaitingTime} ms`,
      sub: 'TAT - Burst Time',
      icon: Clock,
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-900/50',
    },
    {
      title: 'Avg Turnaround',
      value: `${metrics.avgTurnaroundTime} ms`,
      sub: 'CT - Arrival Time',
      icon: TrendingUp,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40 border-purple-200/80 dark:border-purple-900/50',
    },
    {
      title: 'Avg Response',
      value: `${metrics.avgResponseTime} ms`,
      sub: 'First CPU - Arrival',
      icon: Zap,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/50',
    },
    {
      title: 'CPU Utilization',
      value: `${metrics.cpuUtilization}%`,
      sub: `${metrics.makespan > 0 ? 'Active vs Total Makespan' : '100%'}`,
      icon: Cpu,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/50',
    },
    {
      title: 'Throughput',
      value: `${metrics.throughput} /ms`,
      sub: 'Processes / Unit Time',
      icon: Activity,
      color: 'text-cyan-600 dark:text-cyan-400',
      bg: 'bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200/80 dark:border-cyan-900/50',
    },
    {
      title: 'Context Switches',
      value: `${metrics.totalContextSwitches}`,
      sub: 'Process Transitions',
      icon: RefreshCw,
      color: 'text-rose-600 dark:text-rose-400',
      bg: 'bg-rose-50 dark:bg-rose-950/40 border-rose-200/80 dark:border-rose-900/50',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className={`border rounded-2xl p-3.5 shadow-xs flex flex-col justify-between ${c.bg} transition-all hover:shadow-sm`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
                {c.title}
              </span>
              <Icon className={`w-4 h-4 ${c.color}`} />
            </div>
            <div className="font-mono font-bold text-lg text-slate-900 dark:text-slate-100">
              {c.value}
            </div>
            <div className="text-[10px] text-slate-400 font-medium mt-0.5 truncate">
              {c.sub}
            </div>
          </div>
        );
      })}
    </div>
  );
};
