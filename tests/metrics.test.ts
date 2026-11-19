import { describe, it, expect } from 'vitest';
import { calculateMetrics } from '../src/utils/metrics';
import { Process } from '../src/types/process';
import { TimelineSegment } from '../src/algorithms/types';

describe('Metrics Calculation Engine', () => {
  it('satisfies basic OS turnaround and waiting time invariant: TAT = CT - AT and WT = TAT - BT', () => {
    const processes: Process[] = [
      { pid: 'P1', arrivalTime: 2, burstTime: 6 },
    ];

    const timeline: TimelineSegment[] = [
      { pid: 'IDLE', start: 0, end: 2, isIdle: true },
      { pid: 'P1', start: 2, end: 8, isIdle: false },
    ];

    const { processMetrics, aggregateMetrics, idleSegments } = calculateMetrics(
      processes,
      timeline,
      0
    );

    const m = processMetrics['P1'];
    expect(m.completionTime).toBe(8);
    expect(m.turnaroundTime).toBe(6); // 8 - 2
    expect(m.waitingTime).toBe(0);    // 6 - 6
    expect(m.responseTime).toBe(0);   // 2 - 2

    expect(idleSegments).toHaveLength(1);
    expect(idleSegments[0]).toEqual({ start: 0, end: 2, duration: 2 });

    expect(aggregateMetrics.makespan).toBe(8);
    expect(aggregateMetrics.cpuUtilization).toBe(75); // (8 - 2) / 8 * 100 = 75%
  });
});
