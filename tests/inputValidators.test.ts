import { describe, it, expect } from 'vitest';
import { validateProcessRow, validateProcessList } from '../src/utils/validators';
import { exportProcessesToCSV, parseProcessesFromCSV } from '../src/utils/csvHelper';
import { Process } from '../src/types/process';

describe('Process Input Validation & CSV System', () => {
  it('validates a correct process row without errors', () => {
    const validRow: Process = { pid: 'P1', arrivalTime: 0, burstTime: 5, priority: 1, queueLevel: 0 };
    const errors = validateProcessRow(validRow, ['P1']);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('rejects negative arrival times and zero burst times', () => {
    const invalidRow = { pid: 'P1', arrivalTime: -2, burstTime: 0 };
    const errors = validateProcessRow(invalidRow, ['P1']);
    expect(errors.arrivalTime).toBe('Arrival time cannot be negative');
    expect(errors.burstTime).toBe('Burst time must be > 0');
  });

  it('rejects non-integer decimal inputs', () => {
    const decimalRow = { pid: 'P1', arrivalTime: 1.5, burstTime: 3.2 };
    const errors = validateProcessRow(decimalRow, ['P1']);
    expect(errors.arrivalTime).toBe('Must be an integer');
    expect(errors.burstTime).toBe('Must be an integer');
  });

  it('detects duplicate PIDs in a process list', () => {
    const list: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 4 },
      { pid: 'P1', arrivalTime: 2, burstTime: 6 },
    ];
    const validation = validateProcessList(list);
    expect(validation.isValid).toBe(false);
    expect(validation.generalErrors.some((e) => e.includes('Duplicate PIDs'))).toBe(true);
  });

  it('correctly exports to CSV and roundtrip imports back', () => {
    const original: Process[] = [
      { pid: 'P1', arrivalTime: 0, burstTime: 10, priority: 2, queueLevel: 0 },
      { pid: 'P2', arrivalTime: 3, burstTime: 4, priority: 1, queueLevel: 1 },
    ];

    const csvText = exportProcessesToCSV(original);
    expect(csvText).toContain('PID,Arrival Time,Burst Time,Priority,Queue Level');
    expect(csvText).toContain('P1,0,10,2,0');
    expect(csvText).toContain('P2,3,4,1,1');

    const parsed = parseProcessesFromCSV(csvText);
    expect(parsed.success).toBe(true);
    expect(parsed.processes).toHaveLength(2);
    expect(parsed.processes[0].pid).toBe('P1');
    expect(parsed.processes[0].burstTime).toBe(10);
    expect(parsed.processes[1].pid).toBe('P2');
    expect(parsed.processes[1].arrivalTime).toBe(3);
  });
});
