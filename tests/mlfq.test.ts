import { describe, it, expect } from 'vitest';
import { solveMLFQ } from '../src/algorithms/mlfq';
import { Process } from '../src/types/process';

describe('Multilevel Feedback Queue (MLFQ) Algorithm', () => {
  it('demotes CPU-bound processes through feedback queues', () => {
    /**
     * Configuration:
     * Q0: RR q=2
     * Q1: RR q=4
     * Q2: FCFS
     * 
     * P1: AT=0, BT=7
     * Execution Trace:
     * - In Q0: runs 2 units [0, 2] (rem: 5). Demoted to Q1!
     * - In Q1: runs 4 units [2, 6] (rem: 1). Demoted to Q2!
     * - In Q2: runs 1 unit  [6, 7] (rem: 0). Finishes!
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 7 },
    ];

    const result = solveMLFQ(processes);

    expect(result.processMetrics['P1'].completionTime).toBe(7);
    expect(result.aggregateMetrics.makespan).toBe(7);
    expect(result.stepLogs.some((l) => l.description.includes('Demoted to Q1'))).toBe(true);
    expect(result.stepLogs.some((l) => l.description.includes('Demoted to Q2'))).toBe(true);
  });

  it('preempts lower-queue execution when high-priority process arrives in Q0', () => {
    /**
     * P1 arrives at t=0, BT=10
     * P2 arrives at t=3, BT=2
     * 
     * t=0..2: P1 in Q0 (rem: 8). Demoted to Q1.
     * t=2..3: P1 starts in Q1.
     * At t=3: P2 arrives in Q0 (higher priority!).
     * P1 is preempted!
     * t=3..5: P2 runs in Q0 and finishes at t=5.
     * t=5: P1 resumes in Q1.
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 10 },
      { pid: 'P2', arrivalTime: 3, burstTime: 2 },
    ];

    const result = solveMLFQ(processes);

    expect(result.timeline).toEqual([
      { pid: 'P1', start: 0, end: 3, isIdle: false },
      { pid: 'P2', start: 3, end: 5, isIdle: false },
      { pid: 'P1', start: 5, end: 12, isIdle: false },
    ]);
  });

  it('promotes starved process via Aging mechanism', () => {
    /**
     * Aging threshold = 5 units.
     * Process P1 runs long burst in Q0.
     * Process P2 is in Q1.
     * When P2 waits >= 5 units in Q1 without CPU, aging elevates it to Q0!
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 8, queueLevel: 0 },
      { pid: 'P2', arrivalTime: 0, burstTime: 2, queueLevel: 1 },
    ];

    const result = solveMLFQ(processes, {
      queues: [
        { queueIndex: 0, algorithm: 'RR', quantum: 10 },
        { queueIndex: 1, algorithm: 'RR', quantum: 4 },
        { queueIndex: 2, algorithm: 'FCFS' },
      ],
      agingThreshold: 5,
    });

    // P2 should be aged and logged
    expect(result.stepLogs.some((l) => l.event === 'AGING')).toBe(true);
  });
});
