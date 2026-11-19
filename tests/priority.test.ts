import { describe, it, expect } from 'vitest';
import { solvePriority } from '../src/algorithms/priority';
import { Process } from '../src/types/process';

describe('Priority Scheduling (Non-Preemptive & Preemptive)', () => {
  it('solves classic Silberschatz non-preemptive priority example', () => {
    /**
     * Silberschatz OS Concepts 9th/10th Ed:
     * Process  Burst  Priority (lower integer = higher priority)
     * P1       10     3
     * P2       1      1
     * P3       2      4
     * P4       1      5
     * P5       5      2
     * All arriving at t=0.
     * 
     * Priority order:
     * 1st: P2 (Prio 1) -> runs [0, 1]
     * 2nd: P5 (Prio 2) -> runs [1, 6]
     * 3rd: P1 (Prio 3) -> runs [6, 16]
     * 4th: P3 (Prio 4) -> runs [16, 18]
     * 5th: P4 (Prio 5) -> runs [18, 19]
     * 
     * Waiting times:
     * P2: 0
     * P5: 1
     * P1: 6
     * P3: 16
     * P4: 18
     * Total WT = 0 + 1 + 6 + 16 + 18 = 41. Avg WT = 41 / 5 = 8.20
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 10, priority: 3 },
      { pid: 'P2', arrivalTime: 0, burstTime: 1, priority: 1 },
      { pid: 'P3', arrivalTime: 0, burstTime: 2, priority: 4 },
      { pid: 'P4', arrivalTime: 0, burstTime: 1, priority: 5 },
      { pid: 'P5', arrivalTime: 0, burstTime: 5, priority: 2 },
    ];

    const result = solvePriority(processes, false, { lowerNumberIsHigherPriority: true });

    expect(result.timeline.map((s) => s.pid)).toEqual(['P2', 'P5', 'P1', 'P3', 'P4']);
    expect(result.processMetrics['P2'].waitingTime).toBe(0);
    expect(result.processMetrics['P5'].waitingTime).toBe(1);
    expect(result.processMetrics['P1'].waitingTime).toBe(6);
    expect(result.processMetrics['P3'].waitingTime).toBe(16);
    expect(result.processMetrics['P4'].waitingTime).toBe(18);

    expect(result.aggregateMetrics.avgWaitingTime).toBe(8.2);
  });

  it('handles preemptive priority with higher priority arrivals', () => {
    /**
     * P1 arrives at t=0, BT=10, Prio=3
     * P2 arrives at t=2, BT=4,  Prio=1 (higher priority!)
     * 
     * Timeline:
     * [0, 2]  : P1 executes (remaining 8). Preempted by P2!
     * [2, 6]  : P2 executes and completes.
     * [6, 14] : P1 resumes and completes.
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 10, priority: 3 },
      { pid: 'P2', arrivalTime: 2, burstTime: 4, priority: 1 },
    ];

    const result = solvePriority(processes, true, { lowerNumberIsHigherPriority: true });

    expect(result.timeline).toEqual([
      { pid: 'P1', start: 0, end: 2, isIdle: false },
      { pid: 'P2', start: 2, end: 6, isIdle: false },
      { pid: 'P1', start: 6, end: 14, isIdle: false },
    ]);

    expect(result.processMetrics['P2'].completionTime).toBe(6);
    expect(result.processMetrics['P1'].completionTime).toBe(14);
    expect(result.contextSwitches).toBe(2);
  });

  it('handles preemptive priority with EQUAL priorities without preempting', () => {
    /**
     * Edge case: Preemptive priority with equal priorities.
     * P1 arrives at t=0, BT=6, Prio=2.
     * P2 arrives at t=2, BT=4, Prio=2 (Equal priority).
     * P1 must NOT be preempted because priority is not strictly higher.
     */
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 2 },
      { pid: 'P2', arrivalTime: 2, burstTime: 4, priority: 2 },
    ];

    const result = solvePriority(processes, true, { lowerNumberIsHigherPriority: true });

    expect(result.timeline).toEqual([
      { pid: 'P1', start: 0, end: 6, isIdle: false },
      { pid: 'P2', start: 6, end: 10, isIdle: false },
    ]);
  });

  it('supports toggle for higher number = higher priority', () => {
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1 },
      { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 10 },
    ];

    // Priority 10 is higher than 1
    const result = solvePriority(processes, false, { lowerNumberIsHigherPriority: false });

    expect(result.timeline.map((s) => s.pid)).toEqual(['P2', 'P1']);
    expect(result.processMetrics['P2'].waitingTime).toBe(0);
    expect(result.processMetrics['P1'].waitingTime).toBe(3);
  });
});
