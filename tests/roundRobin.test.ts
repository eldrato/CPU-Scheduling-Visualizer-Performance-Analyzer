import { describe, it, expect } from 'vitest';
import { solveRoundRobin } from '../src/algorithms/roundRobin';
import { Process } from '../src/types/process';

describe('Round Robin (RR) Algorithm', () => {
  it('solves classic Silberschatz textbook RR example (quantum = 4)', () => {
    /**
     * Textbook Example (Silberschatz):
     * P1: AT=0, BT=24
     * P2: AT=0, BT=3
     * P3: AT=0, BT=3
     * Quantum = 4
     * 
     * Hand Execution Trace:
     * t=0: Queue: [P1, P2, P3]
     * t=0..4: P1 runs 4 units (rem: 20). Preempted. Queue: [P2, P3, P1]
     * t=4..7: P2 runs 3 units (rem: 0). Finishes! CT(P2)=7. Queue: [P3, P1]
     * t=7..10: P3 runs 3 units (rem: 0). Finishes! CT(P3)=10. Queue: [P1]
     * t=10..14: P1 runs 4 (rem: 16)
     * t=14..18: P1 runs 4 (rem: 12)
     * t=18..22: P1 runs 4 (rem: 8)
     * t=22..26: P1 runs 4 (rem: 4)
     * t=26..30: P1 runs 4 (rem: 0). Finishes! CT(P1)=30.
     * 
     * Waiting Times:
     * P1: 30 - 0 - 24 = 6
     * P2: 7 - 0 - 3 = 4
     * P3: 10 - 0 - 3 = 7
     * Total WT = 6 + 4 + 7 = 17. Avg WT = 17 / 3 = 5.67
     * 
     * Turnaround Times:
     * P1: 30
     * P2: 7
     * P3: 10
     * Avg TAT = (30 + 7 + 10) / 3 = 47 / 3 = 15.67
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 24 },
      { pid: 'P2', arrivalTime: 0, burstTime: 3 },
      { pid: 'P3', arrivalTime: 0, burstTime: 3 },
    ];

    const result = solveRoundRobin(processes, { quantum: 4 });

    expect(result.processMetrics['P1'].completionTime).toBe(30);
    expect(result.processMetrics['P2'].completionTime).toBe(7);
    expect(result.processMetrics['P3'].completionTime).toBe(10);

    expect(result.processMetrics['P1'].waitingTime).toBe(6);
    expect(result.processMetrics['P2'].waitingTime).toBe(4);
    expect(result.processMetrics['P3'].waitingTime).toBe(7);

    expect(result.aggregateMetrics.avgWaitingTime).toBe(5.67);
    expect(result.aggregateMetrics.avgTurnaroundTime).toBe(15.67);
  });

  it('CRITICAL EDGE CASE: process arriving exactly when quantum expires is queued BEFORE preempted process', () => {
    /**
     * Requirement:
     * "A process arriving exactly when the quantum expires in Round Robin
     * (the new arrival is queued BEFORE the preempted process)."
     * 
     * Scenario:
     * Quantum = 4
     * P1: AT=0, BT=6
     * P2: AT=4, BT=3
     * 
     * At t=0: P1 starts running.
     * At t=4: P1 completes its quantum of 4 units (remaining burst = 2).
     * EXACTLY at t=4, P2 arrives.
     * 
     * Correct behavior:
     * P2 enters the ready queue BEFORE P1 is re-enqueued.
     * Queue at t=4: [P2, P1]
     * Therefore, P2 MUST run next from t=4 to t=7!
     * Then P1 runs from t=7 to t=9.
     * 
     * Incorrect behavior (if P1 was re-enqueued first):
     * P1 would run [4, 6] and P2 would run [6, 9].
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 6 },
      { pid: 'P2', arrivalTime: 4, burstTime: 3 },
    ];

    const result = solveRoundRobin(processes, { quantum: 4 });

    expect(result.timeline).toEqual([
      { pid: 'P1', start: 0, end: 4, isIdle: false },
      { pid: 'P2', start: 4, end: 7, isIdle: false },
      { pid: 'P1', start: 7, end: 9, isIdle: false },
    ]);

    expect(result.processMetrics['P2'].startTime).toBe(4);
    expect(result.processMetrics['P2'].completionTime).toBe(7);
    expect(result.processMetrics['P1'].completionTime).toBe(9);
  });
});
