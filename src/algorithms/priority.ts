import { Process } from '../types/process';
import { AlgorithmResult, PriorityOptions, TimelineSegment, StepLog } from './types';
import { calculateMetrics } from '../utils/metrics';

interface ProcessState {
  process: Process;
  remainingBurst: number;
}

/**
 * Priority Scheduling (Non-preemptive and Preemptive).
 * 
 * Each process is assigned a priority integer.
 * Preemptive mode: If an arriving process has strictly higher priority than the running
 * process, it preempts the current process.
 * 
 * Equal priority edge case:
 * In preemptive mode, equal priority does NOT preempt the running process.
 * Tie-breaker for ready queue: earlier arrival time, then alphanumeric PID order.
 */
export function solvePriority(
  processes: Process[],
  preemptive: boolean = false,
  options: PriorityOptions = { lowerNumberIsHigherPriority: true }
): AlgorithmResult {
  const { lowerNumberIsHigherPriority } = options;

  if (processes.length === 0) {
    return {
      algorithmId: preemptive ? 'priority-p' : 'priority-np',
      algorithmName: preemptive ? 'Priority (Preemptive)' : 'Priority (Non-preemptive)',
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

  // Helper to compare priorities: returns true if pA has strictly higher priority than pB
  const isHigherPriority = (priorityA: number = 0, priorityB: number = 0): boolean => {
    if (lowerNumberIsHigherPriority) {
      return priorityA < priorityB;
    }
    return priorityA > priorityB;
  };

  const isPriorityEqual = (priorityA: number = 0, priorityB: number = 0): boolean => {
    return priorityA === priorityB;
  };

  if (!preemptive) {
    // Non-preemptive Priority
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
          description: `Process ${arrived.pid} arrived (burst=${arrived.burstTime}, priority=${arrived.priority ?? 0}).`,
          runningProcess: lastRunningPid,
          readyQueue: readyPool.map((p) => p.pid),
          remainingBursts: { ...remainingBursts },
        });
      }
    };

    while (unarrived.length > 0 || readyPool.length > 0) {
      updateReadyPool(currentTime);

      if (readyPool.length === 0) {
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
        // Sort ready pool by priority
        readyPool.sort((a, b) => {
          const prioA = a.priority ?? 0;
          const prioB = b.priority ?? 0;
          if (prioA !== prioB) {
            return isHigherPriority(prioA, prioB) ? -1 : 1;
          }
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
          description: `t=${startTime}: Dispatched ${selected.pid} (priority=${selected.priority ?? 0}) to run until t=${endTime}.`,
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
      algorithmId: 'priority-np',
      algorithmName: 'Priority (Non-preemptive)',
      timeline,
      idleSegments,
      processMetrics,
      aggregateMetrics,
      stepLogs,
      contextSwitches,
    };
  }

  // Preemptive Priority Scheduling
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
        description: `Process ${arrived.pid} arrived (burst=${arrived.burstTime}, priority=${arrived.priority ?? 0}).`,
        runningProcess: runningPid,
        readyQueue: Array.from(readyPids).filter((p) => p !== runningPid),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
    }
  };

  while (completedCount < n) {
    updateArrivals(currentTime);

    if (readyPids.size === 0) {
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

    // Determine highest priority process in readyPids
    let bestPid: string | null = null;

    for (const pid of readyPids) {
      const st = states.get(pid)!;
      if (st.remainingBurst <= 0) continue;

      if (bestPid === null) {
        bestPid = pid;
        continue;
      }

      const bestState = states.get(bestPid)!;
      const prioBest = bestState.process.priority ?? 0;
      const prioCurr = st.process.priority ?? 0;

      if (isHigherPriority(prioCurr, prioBest)) {
        bestPid = pid;
      } else if (isPriorityEqual(prioCurr, prioBest)) {
        // Tie-breaker rule:
        // If one of them is the currently running process, do NOT preempt running process!
        if (runningPid === pid) {
          bestPid = pid;
        } else if (runningPid === bestPid) {
          // keep bestPid
        } else {
          // Both are waiting: earlier arrival time, then PID
          if (st.process.arrivalTime < bestState.process.arrivalTime) {
            bestPid = pid;
          } else if (st.process.arrivalTime === bestState.process.arrivalTime) {
            if (st.process.pid.localeCompare(bestState.process.pid, undefined, { numeric: true }) < 0) {
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

    if (lastScheduledPid !== null && lastScheduledPid !== bestPid) {
      contextSwitches++;
      const next = states.get(bestPid)!;
      stepLogs.push({
        time: currentTime,
        event: 'PREEMPT',
        description: `t=${currentTime}: Switched from ${lastScheduledPid} to ${bestPid} (priority=${next.process.priority ?? 0}).`,
        runningProcess: bestPid,
        readyQueue: Array.from(readyPids).filter((p) => p !== bestPid),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
    } else if (lastScheduledPid === null) {
      stepLogs.push({
        time: currentTime,
        event: 'SCHEDULE',
        description: `t=${currentTime}: Dispatched ${bestPid} (priority=${states.get(bestPid)!.process.priority ?? 0}).`,
        runningProcess: bestPid,
        readyQueue: Array.from(readyPids).filter((p) => p !== bestPid),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
    }

    runningPid = bestPid;
    lastScheduledPid = bestPid;

    // Run until either runningPid completes or next arrival with strictly higher priority
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
    algorithmId: preemptive ? 'priority-p' : 'priority-np',
    algorithmName: preemptive ? 'Priority (Preemptive)' : 'Priority (Non-preemptive)',
    timeline: mergedTimeline,
    idleSegments,
    processMetrics,
    aggregateMetrics,
    stepLogs,
    contextSwitches,
  };
}
