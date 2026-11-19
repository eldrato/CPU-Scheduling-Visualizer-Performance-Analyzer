import { Process } from '../types/process';
import { AlgorithmResult, TimelineSegment, StepLog } from './types';
import { calculateMetrics } from '../utils/metrics';

/**
 * Shortest Job First (SJF) - Non-preemptive.
 * 
 * Selects the waiting process with the smallest CPU burst time.
 * Once scheduled, the process runs until completion.
 * 
 * Tie-breaker:
 * 1. Smallest burst time.
 * 2. Earlier arrival time.
 * 3. Alphanumeric PID order ("P1" before "P2").
 */
export function solveSJF(processes: Process[]): AlgorithmResult {
  if (processes.length === 0) {
    return {
      algorithmId: 'sjf',
      algorithmName: 'Shortest Job First (SJF)',
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

  const unarrived = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.pid.localeCompare(b.pid, undefined, { numeric: true });
  });

  const readyPool: Process[] = [];
  const timeline: TimelineSegment[] = [];
  const stepLogs: StepLog[] = [];
  let currentTime = 0;
  let contextSwitches = 0;
  let lastRunningPid: string | null = null;

  const remainingBursts: Record<string, number> = {};
  for (const p of processes) {
    remainingBursts[p.pid] = p.burstTime;
  }

  const updateReadyPool = (time: number) => {
    while (unarrived.length > 0 && unarrived[0].arrivalTime <= time) {
      const arrived = unarrived.shift()!;
      readyPool.push(arrived);
      stepLogs.push({
        time: arrived.arrivalTime,
        event: 'ARRIVAL',
        description: `Process ${arrived.pid} arrived with burst ${arrived.burstTime}.`,
        runningProcess: lastRunningPid,
        readyQueue: readyPool.map((p) => p.pid),
        remainingBursts: { ...remainingBursts },
      });
    }
  };

  while (unarrived.length > 0 || readyPool.length > 0) {
    updateReadyPool(currentTime);

    if (readyPool.length === 0) {
      // Idle period
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
      updateReadyPool(currentTime);
    }

    if (readyPool.length > 0) {
      // Pick process with shortest burst time
      readyPool.sort((a, b) => {
        if (a.burstTime !== b.burstTime) return a.burstTime - b.burstTime;
        if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
        return a.pid.localeCompare(b.pid, undefined, { numeric: true });
      });

      const selected = readyPool.shift()!;

      if (lastRunningPid !== null && lastRunningPid !== selected.pid) {
        contextSwitches++;
      }
      lastRunningPid = selected.pid;

      const startTime = currentTime;
      const endTime = currentTime + selected.burstTime;

      timeline.push({
        pid: selected.pid,
        start: startTime,
        end: endTime,
        isIdle: false,
      });

      remainingBursts[selected.pid] = 0;

      stepLogs.push({
        time: startTime,
        event: 'SCHEDULE',
        description: `t=${startTime}: Dispatched ${selected.pid} (shortest burst=${selected.burstTime}) until t=${endTime}.`,
        runningProcess: selected.pid,
        readyQueue: readyPool.map((p) => p.pid),
        remainingBursts: { ...remainingBursts },
      });

      currentTime = endTime;
      updateReadyPool(currentTime);

      stepLogs.push({
        time: endTime,
        event: 'COMPLETE',
        description: `t=${endTime}: ${selected.pid} finished execution.`,
        runningProcess: null,
        readyQueue: readyPool.map((p) => p.pid),
        remainingBursts: { ...remainingBursts },
      });
    }
  }

  const { processMetrics, aggregateMetrics, idleSegments } = calculateMetrics(
    processes,
    timeline,
    contextSwitches
  );

  return {
    algorithmId: 'sjf',
    algorithmName: 'Shortest Job First (SJF)',
    timeline,
    idleSegments,
    processMetrics,
    aggregateMetrics,
    stepLogs,
    contextSwitches,
  };
}
