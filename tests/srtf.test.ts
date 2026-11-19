import { describe, it, expect } from 'vitest';
import { solveSRTF } from '../src/algorithms/srtf';
import { Process } from '../src/types/process';

describe('Shortest Remaining Time First (SRTF) - Preemptive SJF', () => {
  it('solves classic Silberschatz textbook problem with preemption', () => {
    /**
     * Silberschatz OS Concepts 9th/10th Ed Example:
     * Process  Arrival  Burst
     * P1       0        8
     * P2       1        4
     * P3       2        9
     * P4       3        5
     * 
     * Hand Execution Trace:
     * t=0: P1 arrives with burst 8. Starts running.
     * t=1: P2 arrives with burst 4. P1 remaining burst = 7.
     *      Since 4 < 7, P1 is PREEMPTED by P2!
     *      P2 runs.
     * t=2: P3 arrives with burst 9. P2 has remaining 3. 3 < 9 -> P2 continues.
     * t=3: P4 arrives with burst 5. P2 has remaining 2. 2 < 5 -> P2 continues.
     * t=5: P2 completes [1, 5] (CT=5).
     *      Ready pool:
     *      P1: remaining 7
     *      P3: remaining 9
     *      P4: remaining 5
     *      Shortest is P4 (remaining 5). P4 runs [5, 10].
     * t=10: P4 completes [5, 10] (CT=10).
     *       Ready pool:
     *       P1: remaining 7
     *       P3: remaining 9
     *       Shortest is P1 (remaining 7). P1 runs [10, 17].
     * t=17: P1 completes [10, 17] (CT=17).
     *       P3 runs [17, 26] (CT=26).
     * 
     * Expected Metrics:
     * P1: CT=17, TAT=17-0=17, WT=17-8=9,  RT=0-0=0
     * P2: CT=5,  TAT=5-1=4,   WT=4-4=0,   RT=1-1=0
     * P3: CT=26, TAT=26-2=24, WT=24-9=15, RT=17-2=15
     * P4: CT=10, TAT=10-3=7,  WT=7-5=2,   RT=5-3=2
     * 
     * Total WT = 9 + 0 + 15 + 2 = 26. Avg WT = 26 / 4 = 6.50
     * Total TAT = 17 + 4 + 24 + 7 = 52. Avg TAT = 52 / 4 = 13.00
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 8 },
      { pid: 'P2', arrivalTime: 1, burstTime: 4 },
      { pid: 'P3', arrivalTime: 2, burstTime: 9 },
      { pid: 'P4', arrivalTime: 3, burstTime: 5 },
    ];

    const result = solveSRTF(processes);

    expect(result.timeline).toEqual([
      { pid: 'P1', start: 0, end: 1, isIdle: false },
      { pid: 'P2', start: 1, end: 5, isIdle: false },
      { pid: 'P4', start: 5, end: 10, isIdle: false },
      { pid: 'P1', start: 10, end: 17, isIdle: false },
      { pid: 'P3', start: 17, end: 26, isIdle: false },
    ]);

    expect(result.processMetrics['P1'].completionTime).toBe(17);
    expect(result.processMetrics['P2'].completionTime).toBe(5);
    expect(result.processMetrics['P4'].completionTime).toBe(10);
    expect(result.processMetrics['P3'].completionTime).toBe(26);

    expect(result.processMetrics['P1'].waitingTime).toBe(9);
    expect(result.processMetrics['P2'].waitingTime).toBe(0);
    expect(result.processMetrics['P3'].waitingTime).toBe(15);
    expect(result.processMetrics['P4'].waitingTime).toBe(2);

    expect(result.aggregateMetrics.avgWaitingTime).toBe(6.5);
    expect(result.aggregateMetrics.avgTurnaroundTime).toBe(13.0);
  });

  it('does not preempt when arriving process has EQUAL remaining burst', () => {
    /**
     * P1 arrives at t=0 with burst 6.
     * At t=2, P1 remaining burst = 4.
     * P2 arrives at t=2 with burst 4.
     * Since 4 == 4 (not strictly shorter), P1 should continue without preemption.
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 6 },
      { pid: 'P2', arrivalTime: 2, burstTime: 4 },
    ];

    const result = solveSRTF(processes);

    // P1 runs [0, 6], then P2 runs [6, 10]
    expect(result.timeline).toEqual([
      { pid: 'P1', start: 0, end: 6, isIdle: false },
      { pid: 'P2', start: 6, end: 10, isIdle: false },
    ]);
  });
});
