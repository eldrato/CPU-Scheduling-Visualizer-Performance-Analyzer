import { Process, ProcessMetric, AggregateMetrics } from '../types/process';
import { TimelineSegment, IdleSegment } from '../algorithms/types';

/**
 * Computes individual process metrics (CT, TAT, WT, RT) and system aggregate metrics.
 * 
 * Formulas:
 * - Turnaround Time (TAT) = Completion Time (CT) - Arrival Time (AT)
 * - Waiting Time (WT) = Turnaround Time (TAT) - Burst Time (BT)
 * - Response Time (RT) = First CPU Allocation Time - Arrival Time (AT)
 * - CPU Utilization (%) = ((Makespan - Total Idle Time) / Makespan) * 100
 * - Throughput = Completed Processes / Makespan
 */
export function calculateMetrics(
  processes: Process[],
  timeline: TimelineSegment[],
  contextSwitches: number
): {
  processMetrics: Record<string, ProcessMetric>;
  aggregateMetrics: AggregateMetrics;
  idleSegments: IdleSegment[];
} {
  const processMetrics: Record<string, ProcessMetric> = {};
  const firstCpuTime: Record<string, number> = {};
  const completionTime: Record<string, number> = {};

  // Track first CPU time and completion time for each process from timeline
  for (const seg of timeline) {
    if (seg.isIdle || seg.pid === 'IDLE') continue;

    if (firstCpuTime[seg.pid] === undefined) {
      firstCpuTime[seg.pid] = seg.start;
    }
    completionTime[seg.pid] = seg.end;
  }

  // Extract idle segments
  const idleSegments: IdleSegment[] = [];
  let totalIdleTime = 0;

  for (const seg of timeline) {
    if (seg.isIdle || seg.pid === 'IDLE') {
      const duration = seg.end - seg.start;
      if (duration > 0) {
        idleSegments.push({
          start: seg.start,
          end: seg.end,
          duration,
        });
        totalIdleTime += duration;
      }
    }
  }

  let totalWT = 0;
  let totalTAT = 0;
  let totalRT = 0;

  for (const p of processes) {
    const ct = completionTime[p.pid] ?? p.arrivalTime;
    const tat = ct - p.arrivalTime;
    const wt = tat - p.burstTime;
    const firstStart = firstCpuTime[p.pid] ?? p.arrivalTime;
    const rt = firstStart - p.arrivalTime;

    processMetrics[p.pid] = {
      pid: p.pid,
      arrivalTime: p.arrivalTime,
      burstTime: p.burstTime,
      priority: p.priority,
      startTime: firstStart,
      completionTime: ct,
      turnaroundTime: Math.max(0, tat),
      waitingTime: Math.max(0, wt),
      responseTime: Math.max(0, rt),
    };

    totalWT += Math.max(0, wt);
    totalTAT += Math.max(0, tat);
    totalRT += Math.max(0, rt);
  }

  const makespan = timeline.length > 0 ? timeline[timeline.length - 1].end : 0;
  const n = processes.length;

  const aggregateMetrics: AggregateMetrics = {
    avgWaitingTime: n > 0 ? Number((totalWT / n).toFixed(2)) : 0,
    avgTurnaroundTime: n > 0 ? Number((totalTAT / n).toFixed(2)) : 0,
    avgResponseTime: n > 0 ? Number((totalRT / n).toFixed(2)) : 0,
    cpuUtilization:
      makespan > 0
        ? Number((((makespan - totalIdleTime) / makespan) * 100).toFixed(2))
        : 100,
    throughput:
      makespan > 0 ? Number((n / makespan).toFixed(4)) : 0,
    totalContextSwitches: contextSwitches,
    makespan,
  };

  return { processMetrics, aggregateMetrics, idleSegments };
}
