import { Process } from '../types/process';

export interface ValidationError {
  field: 'pid' | 'arrivalTime' | 'burstTime' | 'priority' | 'queueLevel' | 'general';
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errorsByPid: Record<string, Record<string, string>>;
  generalErrors: string[];
}

/**
 * Validates a single process input row.
 */
export function validateProcessRow(
  process: Partial<Process>,
  existingPids: string[] = []
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Validate PID
  if (!process.pid || process.pid.trim() === '') {
    errors.pid = 'PID is required';
  } else if (existingPids.filter((p) => p === process.pid).length > 1) {
    errors.pid = 'PID must be unique';
  }

  // Validate Arrival Time
  if (process.arrivalTime === undefined || process.arrivalTime === null || isNaN(Number(process.arrivalTime))) {
    errors.arrivalTime = 'Arrival time is required';
  } else if (!Number.isInteger(Number(process.arrivalTime))) {
    errors.arrivalTime = 'Must be an integer';
  } else if (Number(process.arrivalTime) < 0) {
    errors.arrivalTime = 'Arrival time cannot be negative';
  }

  // Validate Burst Time
  if (process.burstTime === undefined || process.burstTime === null || isNaN(Number(process.burstTime))) {
    errors.burstTime = 'Burst time is required';
  } else if (!Number.isInteger(Number(process.burstTime))) {
    errors.burstTime = 'Must be an integer';
  } else if (Number(process.burstTime) <= 0) {
    errors.burstTime = 'Burst time must be > 0';
  }

  // Validate Priority (if provided)
  if (process.priority !== undefined && process.priority !== null && process.priority !== 0) {
    if (!Number.isInteger(Number(process.priority))) {
      errors.priority = 'Priority must be an integer';
    }
  }

  // Validate Queue Level (for MLFQ)
  if (process.queueLevel !== undefined && process.queueLevel !== null) {
    if (!Number.isInteger(Number(process.queueLevel)) || Number(process.queueLevel) < 0) {
      errors.queueLevel = 'Queue level must be 0, 1, or 2';
    }
  }

  return errors;
}

/**
 * Validates an entire process set.
 */
export function validateProcessList(processes: Process[]): ValidationResult {
  const errorsByPid: Record<string, Record<string, string>> = {};
  const generalErrors: string[] = [];

  if (processes.length === 0) {
    generalErrors.push('Please add at least one process to simulate.');
    return { isValid: false, errorsByPid, generalErrors };
  }

  const pids = processes.map((p) => p.pid);
  const seenPids = new Set<string>();
  const duplicatePids = new Set<string>();

  for (const pid of pids) {
    if (seenPids.has(pid)) {
      duplicatePids.add(pid);
    }
    seenPids.add(pid);
  }

  if (duplicatePids.size > 0) {
    generalErrors.push(`Duplicate PIDs detected: ${Array.from(duplicatePids).join(', ')}. Each process must have a unique identifier.`);
  }

  for (const p of processes) {
    const rowErrors = validateProcessRow(p, pids);
    if (Object.keys(rowErrors).length > 0) {
      errorsByPid[p.pid] = rowErrors;
    }
  }

  const isValid = generalErrors.length === 0 && Object.keys(errorsByPid).length === 0;
  return { isValid, errorsByPid, generalErrors };
}
