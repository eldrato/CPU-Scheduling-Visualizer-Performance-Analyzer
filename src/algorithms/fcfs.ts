import { Process } from '../types/process';
import { AlgorithmResult, TimelineSegment, StepLog } from './types';
import { calculateMetrics } from '../utils/metrics';

/**
 * First-Come, First-Served (FCFS) Scheduling Algorithm.
 * 
 * Non-preemptive algorithm where the process that requests the CPU first
 * is allocated the CPU first.
 * 
 * Tie-breaker:
 * 1. Earlier arrival time.
 * 2. Alphanumeric PID order (e.g. "P1" before "P2").
 */
export function solveFCFS(processes: Process[]): AlgorithmResult {
  if (processes.length === 0) {
    return {
      algorithmId: 'fcfs',
      algorithmName: 'First-Come, First-Served (FCFS)',
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

  // Create a copy and sort by arrival time, then PID
  const sorted = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) {
      return a.arrivalTime - b.arrivalTime;
    }
    return a.pid.localeCompare(b.pid, undefined, { numeric: true });
  });

  const timeline: TimelineSegment[] = [];
  const stepLogs: StepLog[] = [];
  let currentTime = 0;
  let contextSwitches = 0;
  let lastRunningPid: string | null = null;

  // Track remaining bursts for live inspection
  const remainingBursts: Record<string, number> = {};
  for (const p of processes) {
    remainingBursts[p.pid] = p.burstTime;
  }

  // Ready queue simulation for step narrative
  const unarrived = [...sorted];
  const readyQueue: Process[] = [];

  const updateReadyQueue = (time: number) => {
    while (unarrived.length > 0 && unarrived[0].arrivalTime <= time) {
      const arrived = unarrived.shift()!;
      readyQueue.push(arrived);
      stepLogs.push({
        time: arrived.arrivalTime,
        event: 'ARRIVAL',
        description: `Process ${arrived.pid} arrived with burst ${arrived.burstTime}.`,
        runningProcess: lastRunningPid,
        readyQueue: readyQueue.map((p) => p.pid),
        remainingBursts: { ...remainingBursts },
      });
    }
  };

  while (unarrived.length > 0 || readyQueue.length > 0) {
    updateReadyQueue(currentTime);

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
        description: `CPU is idle from t=${idleStart} to t=${idleEnd} awaiting process arrival.`,
        runningProcess: null,
        readyQueue: [],
        remainingBursts: { ...remainingBursts },
      });

      currentTime = nextArrival;
      lastRunningPid = null;
      updateReadyQueue(currentTime);
    }

    if (readyQueue.length > 0) {
      const currentProcess = readyQueue.shift()!;

      if (lastRunningPid !== null && lastRunningPid !== currentProcess.pid) {
        contextSwitches++;
      }
      lastRunningPid = currentProcess.pid;

      const startTime = currentTime;
      const endTime = currentTime + currentProcess.burstTime;

      timeline.push({
        pid: currentProcess.pid,
        start: startTime,
        end: endTime,
        isIdle: false,
      });

      remainingBursts[currentProcess.pid] = 0;

      stepLogs.push({
        time: startTime,
        event: 'SCHEDULE',
        description: `t=${startTime}: Dispatched ${currentProcess.pid} to run for ${currentProcess.burstTime} units until t=${endTime}.`,
        runningProcess: currentProcess.pid,
        readyQueue: readyQueue.map((p) => p.pid),
        remainingBursts: { ...remainingBursts },
      });

      currentTime = endTime;
      updateReadyQueue(currentTime);

      stepLogs.push({
        time: endTime,
        event: 'COMPLETE',
        description: `t=${endTime}: ${currentProcess.pid} finished execution. Turnaround: ${endTime - currentProcess.arrivalTime}, Waiting: ${endTime - currentProcess.arrivalTime - currentProcess.burstTime}.`,
        runningProcess: null,
        readyQueue: readyQueue.map((p) => p.pid),
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
    algorithmId: 'fcfs',
    algorithmName: 'First-Come, First-Served (FCFS)',
    timeline,
    idleSegments,
    processMetrics,
    aggregateMetrics,
    stepLogs,
    contextSwitches,
  };
}
