import { describe, it, expect } from 'vitest';
import { solveFCFS } from '../src/algorithms/fcfs';
import { Process } from '../src/types/process';

describe('First-Come, First-Served (FCFS) Algorithm', () => {
  it('solves classic Silberschatz textbook example (equal arrivals)', () => {
    /**
     * Textbook Example (Silberschatz):
     * P1: AT=0, BT=24
     * P2: AT=0, BT=3
     * P3: AT=0, BT=3
     * 
     * Execution Order:
     * P1 runs [0, 24]  -> CT=24, TAT=24, WT=0,  RT=0
     * P2 runs [24, 27] -> CT=27, TAT=27, WT=24, RT=24
     * P3 runs [27, 30] -> CT=30, TAT=30, WT=27, RT=27
     * 
     * Total WT = 0 + 24 + 27 = 51. Avg WT = 51 / 3 = 17.00
     * Total TAT = 24 + 27 + 30 = 81. Avg TAT = 81 / 3 = 27.00
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 24 },
      { pid: 'P2', arrivalTime: 0, burstTime: 3 },
      { pid: 'P3', arrivalTime: 0, burstTime: 3 },
    ];

    const result = solveFCFS(processes);

    expect(result.timeline).toEqual([
      { pid: 'P1', start: 0, end: 24, isIdle: false },
      { pid: 'P2', start: 24, end: 27, isIdle: false },
      { pid: 'P3', start: 27, end: 30, isIdle: false },
    ]);

    expect(result.processMetrics['P1'].waitingTime).toBe(0);
    expect(result.processMetrics['P2'].waitingTime).toBe(24);
    expect(result.processMetrics['P3'].waitingTime).toBe(27);

    expect(result.aggregateMetrics.avgWaitingTime).toBe(17);
    expect(result.aggregateMetrics.avgTurnaroundTime).toBe(27);
    expect(result.aggregateMetrics.cpuUtilization).toBe(100);
    expect(result.aggregateMetrics.makespan).toBe(30);
  });

  it('handles CPU idle gaps when no process has arrived', () => {
    /**
     * Scenario:
     * P1 arrives at t=3, BT=4
     * P2 arrives at t=10, BT=2
     * 
     * Timeline:
     * [0, 3]  : IDLE (duration 3)
     * [3, 7]  : P1 (CT=7, TAT=4, WT=0, RT=0)
     * [7, 10] : IDLE (duration 3)
     * [10, 12]: P2 (CT=12, TAT=2, WT=0, RT=0)
     * 
     * Makespan = 12. Total Idle = 6.
     * CPU Utilization = ((12 - 6) / 12) * 100 = 50.00%
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 3, burstTime: 4 },
      { pid: 'P2', arrivalTime: 10, burstTime: 2 },
    ];

    const result = solveFCFS(processes);

    expect(result.timeline).toEqual([
      { pid: 'IDLE', start: 0, end: 3, isIdle: true },
      { pid: 'P1', start: 3, end: 7, isIdle: false },
      { pid: 'IDLE', start: 7, end: 10, isIdle: true },
      { pid: 'P2', start: 10, end: 12, isIdle: false },
    ]);

    expect(result.idleSegments).toEqual([
      { start: 0, end: 3, duration: 3 },
      { start: 7, end: 10, duration: 3 },
    ]);

    expect(result.aggregateMetrics.cpuUtilization).toBe(50);
    expect(result.aggregateMetrics.makespan).toBe(12);
  });

  it('breaks arrival ties deterministically using alphanumeric PID order', () => {
    const processes: Process[] = [
      { pid: 'P3', arrivalTime: 2, burstTime: 5 },
      { pid: 'P1', arrivalTime: 2, burstTime: 4 },
      { pid: 'P2', arrivalTime: 2, burstTime: 2 },
    ];

    const result = solveFCFS(processes);

    // P1 < P2 < P3
    expect(result.timeline.map((t) => t.pid)).toEqual(['IDLE', 'P1', 'P2', 'P3']);
    expect(result.timeline[1].pid).toBe('P1');
    expect(result.timeline[2].pid).toBe('P2');
    expect(result.timeline[3].pid).toBe('P3');
  });

  it('handles a single process with very large burst', () => {
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 5, burstTime: 500000 },
    ];

    const result = solveFCFS(processes);

    expect(result.timeline).toEqual([
      { pid: 'IDLE', start: 0, end: 5, isIdle: true },
      { pid: 'P1', start: 5, end: 500005, isIdle: false },
    ]);
    expect(result.processMetrics['P1'].completionTime).toBe(500005);
    expect(result.processMetrics['P1'].waitingTime).toBe(0);
    expect(result.aggregateMetrics.makespan).toBe(500005);
  });
});
