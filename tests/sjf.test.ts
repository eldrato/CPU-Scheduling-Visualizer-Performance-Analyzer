import { describe, it, expect } from 'vitest';
import { solveSJF } from '../src/algorithms/sjf';
import { Process } from '../src/types/process';

describe('Shortest Job First (SJF) - Non-Preemptive', () => {
  it('solves classic textbook example with staggered arrival times', () => {
    /**
     * Classic Textbook Problem:
     * Process  Arrival  Burst
     * P1       0        7
     * P2       2        4
     * P3       4        1
     * P4       5        4
     * 
     * Hand Execution Trace:
     * t=0: Only P1 is available. P1 starts execution.
     * t=7: P1 finishes [0, 7].
     *      At t=7, available ready processes are:
     *      P2 (BT=4, AT=2)
     *      P3 (BT=1, AT=4)
     *      P4 (BT=4, AT=5)
     *      Shortest burst is P3 (BT=1).
     *      P3 runs [7, 8].
     * t=8: P3 finishes. Available: P2 (BT=4), P4 (BT=4).
     *      Tie-breaker: P2 arrived at t=2 earlier than P4 (t=5).
     *      P2 runs [8, 12].
     * t=12: P2 finishes. Only P4 remains.
     *       P4 runs [12, 16].
     * 
     * Expected Metrics:
     * P1: CT=7,  TAT=7-0=7,   WT=7-7=0,   RT=0-0=0
     * P3: CT=8,  TAT=8-4=4,   WT=4-1=3,   RT=7-4=3
     * P2: CT=12, TAT=12-2=10, WT=10-4=6,  RT=8-2=6
     * P4: CT=16, TAT=16-5=11, WT=11-4=7,  RT=12-5=7
     * 
     * Total WT = 0 + 3 + 6 + 7 = 16. Avg WT = 16 / 4 = 4.00
     * Total TAT = 7 + 4 + 10 + 11 = 32. Avg TAT = 32 / 4 = 8.00
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 7 },
      { pid: 'P2', arrivalTime: 2, burstTime: 4 },
      { pid: 'P3', arrivalTime: 4, burstTime: 1 },
      { pid: 'P4', arrivalTime: 5, burstTime: 4 },
    ];

    const result = solveSJF(processes);

    expect(result.timeline).toEqual([
      { pid: 'P1', start: 0, end: 7, isIdle: false },
      { pid: 'P3', start: 7, end: 8, isIdle: false },
      { pid: 'P2', start: 8, end: 12, isIdle: false },
      { pid: 'P4', start: 12, end: 16, isIdle: false },
    ]);

    expect(result.processMetrics['P1'].completionTime).toBe(7);
    expect(result.processMetrics['P3'].completionTime).toBe(8);
    expect(result.processMetrics['P2'].completionTime).toBe(12);
    expect(result.processMetrics['P4'].completionTime).toBe(16);

    expect(result.processMetrics['P1'].waitingTime).toBe(0);
    expect(result.processMetrics['P3'].waitingTime).toBe(3);
    expect(result.processMetrics['P2'].waitingTime).toBe(6);
    expect(result.processMetrics['P4'].waitingTime).toBe(7);

    expect(result.aggregateMetrics.avgWaitingTime).toBe(4.0);
    expect(result.aggregateMetrics.avgTurnaroundTime).toBe(8.0);
  });

  it('handles idle gaps and simultaneous burst ties', () => {
    const processes: Process[] = [
      { pid: 'P2', arrivalTime: 5, burstTime: 3 },
      { pid: 'P1', arrivalTime: 5, burstTime: 3 },
    ];

    const result = solveSJF(processes);

    // Initial idle [0, 5], then P1 runs (tie-breaker by PID), then P2
    expect(result.timeline).toEqual([
      { pid: 'IDLE', start: 0, end: 5, isIdle: true },
      { pid: 'P1', start: 5, end: 8, isIdle: false },
      { pid: 'P2', start: 8, end: 11, isIdle: false },
    ]);
  });
});
