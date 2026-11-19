import { Process } from '../types/process';
import { AlgorithmResult, RoundRobinOptions, TimelineSegment, StepLog } from './types';
import { calculateMetrics } from '../utils/metrics';

/**
 * Round Robin (RR) Scheduling Algorithm.
 * 
 * Preemptive algorithm designed for time-sharing systems.
 * Each ready process is given a fixed time slice (quantum q).
 * 
 * Crucial Edge Case Handled:
 * When a process's quantum expires at time t, and one or more new processes
 * arrive at exactly time t, the newly arrived processes are inserted into
 * the ready queue BEFORE the preempted process is re-enqueued.
 * 
 * Tie-breaker for simultaneous arrivals: Alphanumeric PID order.
 */
export function solveRoundRobin(
  processes: Process[],
  options: RoundRobinOptions = { quantum: 2 }
): AlgorithmResult {
  const quantum = Math.max(1, options.quantum);

  if (processes.length === 0) {
    return {
      algorithmId: 'rr',
      algorithmName: `Round Robin (q=${quantum})`,
      timeline: [],
      idleSegments: [],
      processMetrics: {},
      aggregateMetrics: {
        avgWaitingTime: 0,
        avgTurnaroundTime: 0,
        avgResponseTime: 0,
        cpuUtilization: 100,
        throughput: 0,
        totalContextSwitches: 0,
        makespan: 0,
      },
      stepLogs: [],
      contextSwitches: 0,
    };
  }

  // Sort unarrived processes by arrival time, then PID
  const unarrived = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.pid.localeCompare(b.pid, undefined, { numeric: true });
  });

  const remainingBursts: Record<string, number> = {};
  for (const p of processes) {
    remainingBursts[p.pid] = p.burstTime;
  }

  const readyQueue: Process[] = [];
  const timeline: TimelineSegment[] = [];
  const stepLogs: StepLog[] = [];
  let currentTime = 0;
  let contextSwitches = 0;
  let lastRunningPid: string | null = null;

  // Helper to admit arrivals up to time `targetTime`
  const admitArrivalsUpTo = (targetTime: number) => {
    const newlyArrived: Process[] = [];
    while (unarrived.length > 0 && unarrived[0].arrivalTime <= targetTime) {
      newlyArrived.push(unarrived.shift()!);
    }

    // Sort simultaneous arrivals by PID
    newlyArrived.sort((a, b) => {
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid, undefined, { numeric: true });
    });

    for (const p of newlyArrived) {
      readyQueue.push(p);
      stepLogs.push({
        time: p.arrivalTime,
        event: 'ARRIVAL',
        description: `Process ${p.pid} arrived with burst ${p.burstTime}. Added to ready queue.`,
        runningProcess: lastRunningPid,
        readyQueue: readyQueue.map((item) => item.pid),
        remainingBursts: { ...remainingBursts },
      });
    }
  };

  while (unarrived.length > 0 || readyQueue.length > 0) {
    admitArrivalsUpTo(currentTime);

    if (readyQueue.length === 0) {
      // CPU Idle gap
      const nextArrival = unarrived[0].arrivalTime;
      const idleStart = currentTime;
      const idleEnd = nextArrival;

      timeline.push({
        pid: 'IDLE',
        start: idleStart,
        end: idleEnd,
        isIdle: true,
      });

      stepLogs.push({
        time: idleStart,
        event: 'IDLE',
        description: `CPU idle from t=${idleStart} to t=${idleEnd}.`,
        runningProcess: null,
        readyQueue: [],
        remainingBursts: { ...remainingBursts },
      });

      currentTime = nextArrival;
      lastRunningPid = null;
      admitArrivalsUpTo(currentTime);
    }

    if (readyQueue.length > 0) {
      const current = readyQueue.shift()!;

      if (lastRunningPid !== null && lastRunningPid !== current.pid) {
        contextSwitches++;
      }
      lastRunningPid = current.pid;

      const remBurst = remainingBursts[current.pid];
      const slice = Math.min(quantum, remBurst);
      const startTime = currentTime;
      const endTime = currentTime + slice;

      timeline.push({
        pid: current.pid,
        start: startTime,
        end: endTime,
        isIdle: false,
      });

      remainingBursts[current.pid] -= slice;

      stepLogs.push({
        time: startTime,
        event: 'SCHEDULE',
        description: `t=${startTime}: Dispatched ${current.pid} for slice ${slice} (quantum=${quantum}, remaining=${remainingBursts[current.pid]}).`,
        runningProcess: current.pid,
        readyQueue: readyQueue.map((p) => p.pid),
        remainingBursts: { ...remainingBursts },
      });

      currentTime = endTime;

      // FIRST: Admit all processes that arrived up to the end of this quantum slice (including exactly at endTime)
      admitArrivalsUpTo(currentTime);

      // THEN: If current process is still not finished, re-enqueue it at the back
      if (remainingBursts[current.pid] > 0) {
        readyQueue.push(current);
        stepLogs.push({
          time: currentTime,
          event: 'PREEMPT',
          description: `t=${currentTime}: Quantum expired for ${current.pid}. Preempted and placed at rear of ready queue (remaining=${remainingBursts[current.pid]}).`,
          runningProcess: null,
          readyQueue: readyQueue.map((p) => p.pid),
          remainingBursts: { ...remainingBursts },
        });
      } else {
        stepLogs.push({
          time: currentTime,
          event: 'COMPLETE',
          description: `t=${currentTime}: ${current.pid} finished execution.`,
          runningProcess: null,
          readyQueue: readyQueue.map((p) => p.pid),
          remainingBursts: { ...remainingBursts },
        });
        lastRunningPid = null;
      }
    }
  }

  const { processMetrics, aggregateMetrics, idleSegments } = calculateMetrics(
    processes,
    timeline,
    contextSwitches
  );

  return {
    algorithmId: 'rr',
    algorithmName: `Round Robin (q=${quantum})`,
    timeline,
    idleSegments,
    processMetrics,
    aggregateMetrics,
    stepLogs,
    contextSwitches,
  };
}
