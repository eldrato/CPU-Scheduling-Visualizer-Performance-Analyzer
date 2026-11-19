import { Process } from '../types/process';
import { AlgorithmResult, TimelineSegment, StepLog } from './types';
import { calculateMetrics } from '../utils/metrics';

interface ProcessState {
  process: Process;
  remainingBurst: number;
}

/**
 * Shortest Remaining Time First (SRTF) - Preemptive SJF.
 * 
 * At any point in time, the CPU is allocated to the process with the
 * shortest remaining burst time. If a new process arrives with a shorter
 * remaining time than the current running process, preemption occurs.
 * 
 * Tie-breaker:
 * 1. Smallest remaining burst time.
 * 2. If equal to currently running process: keep currently running (avoid thrashing).
 * 3. Among waiting processes: earlier arrival time, then alphanumeric PID order.
 */
export function solveSRTF(processes: Process[]): AlgorithmResult {
  if (processes.length === 0) {
    return {
      algorithmId: 'srtf',
      algorithmName: 'Shortest Remaining Time First (SRTF)',
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

  // Create state mapping
  const states: Map<string, ProcessState> = new Map();
  for (const p of processes) {
    states.set(p.pid, {
      process: p,
      remainingBurst: p.burstTime,
    });
  }

  const unarrived = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.pid.localeCompare(b.pid, undefined, { numeric: true });
  });

  const readyPids: Set<string> = new Set();
  const rawTimeline: TimelineSegment[] = [];
  const stepLogs: StepLog[] = [];
  let currentTime = 0;
  let contextSwitches = 0;
  let runningPid: string | null = null;
  let lastScheduledPid: string | null = null;
  let completedCount = 0;
  const n = processes.length;

  const getRemainingBurstsSnapshot = (): Record<string, number> => {
    const res: Record<string, number> = {};
    for (const [pid, s] of states.entries()) {
      res[pid] = s.remainingBurst;
    }
    return res;
  };

  const updateArrivals = (time: number) => {
    while (unarrived.length > 0 && unarrived[0].arrivalTime <= time) {
      const arrived = unarrived.shift()!;
      readyPids.add(arrived.pid);
      stepLogs.push({
        time: arrived.arrivalTime,
        event: 'ARRIVAL',
        description: `Process ${arrived.pid} arrived (burst=${arrived.burstTime}).`,
        runningProcess: runningPid,
        readyQueue: Array.from(readyPids).filter((p) => p !== runningPid),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
    }
  };

  while (completedCount < n) {
    updateArrivals(currentTime);

    if (readyPids.size === 0) {
      // Idle until next arrival
      const nextArrival = unarrived[0].arrivalTime;

      rawTimeline.push({
        pid: 'IDLE',
        start: currentTime,
        end: nextArrival,
        isIdle: true,
      });

      stepLogs.push({
        time: currentTime,
        event: 'IDLE',
        description: `CPU idle from t=${currentTime} to t=${nextArrival}.`,
        runningProcess: null,
        readyQueue: [],
        remainingBursts: getRemainingBurstsSnapshot(),
      });

      currentTime = nextArrival;
      runningPid = null;
      lastScheduledPid = null;
      updateArrivals(currentTime);
      continue;
    }

    // Pick best process among readyPids
    // If runningPid is still eligible, consider it
    let bestPid: string | null = null;
    let minRemaining = Infinity;

    for (const pid of readyPids) {
      const st = states.get(pid)!;
      if (st.remainingBurst <= 0) continue;

      if (st.remainingBurst < minRemaining) {
        minRemaining = st.remainingBurst;
        bestPid = pid;
      } else if (st.remainingBurst === minRemaining) {
        // Tie-breaking:
        // 1. If one of them is the currently running process, prefer the running process to avoid unnecessary preemption
        if (runningPid === pid) {
          bestPid = pid;
        } else if (runningPid === bestPid) {
          // keep runningPid
        } else {
          // Tie-break by arrival time, then PID
          const pA = states.get(bestPid!)!.process;
          const pB = st.process;
          if (pB.arrivalTime < pA.arrivalTime) {
            bestPid = pid;
          } else if (pB.arrivalTime === pA.arrivalTime) {
            if (pB.pid.localeCompare(pA.pid, undefined, { numeric: true }) < 0) {
              bestPid = pid;
            }
          }
        }
      }
    }

    if (!bestPid) {
      currentTime++;
      continue;
    }

    // Check if preemption or switch occurred
    if (lastScheduledPid !== null && lastScheduledPid !== bestPid) {
      contextSwitches++;
      const prev = states.get(lastScheduledPid)!;
      const next = states.get(bestPid)!;
      stepLogs.push({
        time: currentTime,
        event: 'PREEMPT',
        description: `t=${currentTime}: Switched from ${lastScheduledPid} (remaining=${prev.remainingBurst}) to ${bestPid} (remaining=${next.remainingBurst}).`,
        runningProcess: bestPid,
        readyQueue: Array.from(readyPids).filter((p) => p !== bestPid),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
    } else if (lastScheduledPid === null) {
      stepLogs.push({
        time: currentTime,
        event: 'SCHEDULE',
        description: `t=${currentTime}: Dispatched ${bestPid} (remaining=${states.get(bestPid)!.remainingBurst}).`,
        runningProcess: bestPid,
        readyQueue: Array.from(readyPids).filter((p) => p !== bestPid),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
    }

    runningPid = bestPid;
    lastScheduledPid = bestPid;

    // Determine how long runningPid can run before next potential event:
    // Event 1: runningPid finishes all its remaining burst
    // Event 2: a new process arrives that MIGHT have a strictly shorter burst
    const currentRemaining = states.get(runningPid)!.remainingBurst;
    let runUntil = currentTime + currentRemaining;

    if (unarrived.length > 0) {
      const nextArrival = unarrived[0].arrivalTime;
      if (nextArrival > currentTime && nextArrival < runUntil) {
        runUntil = nextArrival;
      }
    }

    const duration = runUntil - currentTime;
    rawTimeline.push({
      pid: runningPid,
      start: currentTime,
      end: runUntil,
      isIdle: false,
    });

    states.get(runningPid)!.remainingBurst -= duration;
    currentTime = runUntil;

    if (states.get(runningPid)!.remainingBurst === 0) {
      readyPids.delete(runningPid);
      completedCount++;
      stepLogs.push({
        time: currentTime,
        event: 'COMPLETE',
        description: `t=${currentTime}: ${runningPid} finished execution.`,
        runningProcess: null,
        readyQueue: Array.from(readyPids),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
      runningPid = null;
    }
  }

  // Merge contiguous segments for identical process in timeline
  const mergedTimeline: TimelineSegment[] = [];
  for (const seg of rawTimeline) {
    if (mergedTimeline.length === 0) {
      mergedTimeline.push({ ...seg });
    } else {
      const prev = mergedTimeline[mergedTimeline.length - 1];
      if (prev.pid === seg.pid && prev.isIdle === seg.isIdle && prev.end === seg.start) {
        prev.end = seg.end;
      } else {
        mergedTimeline.push({ ...seg });
      }
    }
  }

  const { processMetrics, aggregateMetrics, idleSegments } = calculateMetrics(
    processes,
    mergedTimeline,
    contextSwitches
  );

  return {
    algorithmId: 'srtf',
    algorithmName: 'Shortest Remaining Time First (SRTF)',
    timeline: mergedTimeline,
    idleSegments,
    processMetrics,
    aggregateMetrics,
    stepLogs,
    contextSwitches,
  };
}
