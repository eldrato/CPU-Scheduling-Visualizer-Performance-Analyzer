import { Process } from '../types/process';
import { AlgorithmResult, MLFQOptions, TimelineSegment, StepLog } from './types';
import { calculateMetrics } from '../utils/metrics';

interface MLFQProcessState {
  process: Process;
  remainingBurst: number;
  currentQueue: number;
  lastQueueEntryTime: number;
  waitingInCurrentQueue: number;
}

const DEFAULT_MLFQ_OPTIONS: MLFQOptions = {
  queues: [
    { queueIndex: 0, algorithm: 'RR', quantum: 2 },
    { queueIndex: 1, algorithm: 'RR', quantum: 4 },
    { queueIndex: 2, algorithm: 'FCFS' },
  ],
  agingThreshold: 12,
};

/**
 * Multilevel Feedback Queue (MLFQ) Scheduling.
 * 
 * Features:
 * - Multiple priority queues with descending priority (Q0 highest).
 * - Higher priority queues preempt lower priority queues.
 * - Processes that consume their entire quantum in Qi are demoted to Qi+1.
 * - Starvation prevention via Aging: processes waiting in lower queues for >= agingThreshold
 *   are boosted to a higher queue.
 */
export function solveMLFQ(
  processes: Process[],
  options: MLFQOptions = DEFAULT_MLFQ_OPTIONS
): AlgorithmResult {
  const queuesConfig = options.queues || DEFAULT_MLFQ_OPTIONS.queues;
  const agingThreshold = options.agingThreshold ?? DEFAULT_MLFQ_OPTIONS.agingThreshold;
  const numQueues = queuesConfig.length;

  if (processes.length === 0) {
    return {
      algorithmId: 'mlfq',
      algorithmName: 'Multilevel Feedback Queue (MLFQ)',
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

  // Process state tracking
  const states: Map<string, MLFQProcessState> = new Map();
  for (const p of processes) {
    const initialQueue = Math.min(numQueues - 1, Math.max(0, p.queueLevel ?? 0));
    states.set(p.pid, {
      process: p,
      remainingBurst: p.burstTime,
      currentQueue: initialQueue,
      lastQueueEntryTime: p.arrivalTime,
      waitingInCurrentQueue: 0,
    });
  }

  // Queue buckets: queues[0], queues[1], queues[2]
  const queues: string[][] = Array.from({ length: numQueues }, () => []);

  const unarrived = [...processes].sort((a, b) => {
    if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
    return a.pid.localeCompare(b.pid, undefined, { numeric: true });
  });

  const rawTimeline: TimelineSegment[] = [];
  const stepLogs: StepLog[] = [];
  let currentTime = 0;
  let contextSwitches = 0;
  let lastRunningPid: string | null = null;
  let completedCount = 0;
  const n = processes.length;

  const getRemainingBurstsSnapshot = (): Record<string, number> => {
    const res: Record<string, number> = {};
    for (const [pid, s] of states.entries()) {
      res[pid] = s.remainingBurst;
    }
    return res;
  };

  const getCombinedReadyQueue = (): string[] => {
    const list: string[] = [];
    for (let q = 0; q < numQueues; q++) {
      for (const pid of queues[q]) {
        list.push(`${pid}(Q${q})`);
      }
    }
    return list;
  };

  // Helper to admit arrivals
  const admitArrivals = (targetTime: number) => {
    const newlyArrived: Process[] = [];
    while (unarrived.length > 0 && unarrived[0].arrivalTime <= targetTime) {
      newlyArrived.push(unarrived.shift()!);
    }

    newlyArrived.sort((a, b) => {
      if (a.arrivalTime !== b.arrivalTime) return a.arrivalTime - b.arrivalTime;
      return a.pid.localeCompare(b.pid, undefined, { numeric: true });
    });

    for (const p of newlyArrived) {
      const st = states.get(p.pid)!;
      queues[st.currentQueue].push(p.pid);
      st.lastQueueEntryTime = p.arrivalTime;

      stepLogs.push({
        time: p.arrivalTime,
        event: 'ARRIVAL',
        description: `Process ${p.pid} arrived into Queue ${st.currentQueue} (burst=${p.burstTime}).`,
        runningProcess: lastRunningPid,
        readyQueue: getCombinedReadyQueue(),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
    }
  };

  // Check aging threshold in lower queues
  const applyAging = (now: number) => {
    for (let q = 1; q < numQueues; q++) {
      const pidsInQueue = [...queues[q]];
      for (const pid of pidsInQueue) {
        const st = states.get(pid)!;
        const waitTime = now - st.lastQueueEntryTime;
        if (waitTime >= agingThreshold) {
          // Promote to queue q - 1
          queues[q] = queues[q].filter((id) => id !== pid);
          st.currentQueue = q - 1;
          st.lastQueueEntryTime = now;
          queues[q - 1].push(pid);

          stepLogs.push({
            time: now,
            event: 'AGING',
            description: `t=${now}: Aging trigger! Process ${pid} waited ${waitTime} units in Q${q}. Promoted to Q${q - 1} to prevent starvation.`,
            runningProcess: lastRunningPid,
            readyQueue: getCombinedReadyQueue(),
            remainingBursts: getRemainingBurstsSnapshot(),
          });
        }
      }
    }
  };

  while (completedCount < n) {
    admitArrivals(currentTime);
    applyAging(currentTime);

    // Find the highest-priority non-empty queue
    let activeQueueIndex = -1;
    for (let q = 0; q < numQueues; q++) {
      if (queues[q].length > 0) {
        activeQueueIndex = q;
        break;
      }
    }

    if (activeQueueIndex === -1) {
      // Idle gap until next arrival
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
      lastRunningPid = null;
      admitArrivals(currentTime);
      applyAging(currentTime);
      continue;
    }

    const currentPid = queues[activeQueueIndex].shift()!;
    const st = states.get(currentPid)!;
    const qConfig = queuesConfig[activeQueueIndex];

    if (lastRunningPid !== null && lastRunningPid !== currentPid) {
      contextSwitches++;
    }
    lastRunningPid = currentPid;

    // Determine quantum for this queue level
    const maxSlice = qConfig.algorithm === 'RR' ? (qConfig.quantum ?? 2) : st.remainingBurst;
    
    // Check if a process in a higher queue will arrive before slice finishes
    let actualRunTime = 0;
    let preemptedByHigherQueue = false;

    // Run tick by tick or small step up to maxSlice
    const sliceTarget = Math.min(maxSlice, st.remainingBurst);
    let sliceRemaining = sliceTarget;

    const sliceStartTime = currentTime;

    while (sliceRemaining > 0) {
      // Check if unarrived process arrives at currentTime + 1 into a higher queue
      const nextTick = currentTime + 1;
      st.remainingBurst -= 1;
      sliceRemaining -= 1;
      currentTime = nextTick;

      // Admit arrivals at nextTick
      admitArrivals(currentTime);
      applyAging(currentTime);

      // Check if any process has appeared in a higher priority queue (index < activeQueueIndex)
      let higherQueueHasWork = false;
      for (let hq = 0; hq < activeQueueIndex; hq++) {
        if (queues[hq].length > 0) {
          higherQueueHasWork = true;
          break;
        }
      }

      if (higherQueueHasWork && st.remainingBurst > 0) {
        preemptedByHigherQueue = true;
        break;
      }

      if (st.remainingBurst === 0) {
        break;
      }
    }

    actualRunTime = currentTime - sliceStartTime;

    rawTimeline.push({
      pid: currentPid,
      start: sliceStartTime,
      end: currentTime,
      isIdle: false,
    });

    stepLogs.push({
      time: sliceStartTime,
      event: 'SCHEDULE',
      description: `t=${sliceStartTime}: Dispatched ${currentPid} from Q${activeQueueIndex} for ${actualRunTime} units.`,
      runningProcess: currentPid,
      readyQueue: getCombinedReadyQueue(),
      remainingBursts: getRemainingBurstsSnapshot(),
    });

    if (st.remainingBurst === 0) {
      completedCount++;
      stepLogs.push({
        time: currentTime,
        event: 'COMPLETE',
        description: `t=${currentTime}: ${currentPid} finished execution from Q${activeQueueIndex}.`,
        runningProcess: null,
        readyQueue: getCombinedReadyQueue(),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
      lastRunningPid = null;
    } else if (preemptedByHigherQueue) {
      // Preempted by a higher queue arrival: keep in same queue or demote?
      // Standard OS rule: If preempted before using entire quantum, returns to front/rear of same queue
      queues[activeQueueIndex].unshift(currentPid);
      st.lastQueueEntryTime = currentTime;

      stepLogs.push({
        time: currentTime,
        event: 'PREEMPT',
        description: `t=${currentTime}: ${currentPid} preempted by higher-priority queue arrival. Re-enqueued in Q${activeQueueIndex}.`,
        runningProcess: null,
        readyQueue: getCombinedReadyQueue(),
        remainingBursts: getRemainingBurstsSnapshot(),
      });
    } else {
      // Used full quantum: demote to next lower queue if available
      const nextQueue = Math.min(numQueues - 1, activeQueueIndex + 1);
      st.currentQueue = nextQueue;
      st.lastQueueEntryTime = currentTime;
      queues[nextQueue].push(currentPid);

      if (nextQueue > activeQueueIndex) {
        stepLogs.push({
          time: currentTime,
          event: 'PREEMPT',
          description: `t=${currentTime}: Quantum expired for ${currentPid} in Q${activeQueueIndex}. Demoted to Q${nextQueue} (remaining=${st.remainingBurst}).`,
          runningProcess: null,
          readyQueue: getCombinedReadyQueue(),
          remainingBursts: getRemainingBurstsSnapshot(),
        });
      } else {
        stepLogs.push({
          time: currentTime,
          event: 'PREEMPT',
          description: `t=${currentTime}: Quantum expired for ${currentPid} in lowest queue Q${nextQueue}. Placed at end of Q${nextQueue}.`,
          runningProcess: null,
          readyQueue: getCombinedReadyQueue(),
          remainingBursts: getRemainingBurstsSnapshot(),
        });
      }
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
    algorithmId: 'mlfq',
    algorithmName: 'Multilevel Feedback Queue (MLFQ)',
    timeline: mergedTimeline,
    idleSegments,
    processMetrics,
    aggregateMetrics,
    stepLogs,
    contextSwitches,
  };
}
