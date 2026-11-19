import { ProcessMetric, AggregateMetrics } from '../types/process';

/**
 * A contiguous block of CPU execution time.
 */
export interface TimelineSegment {
  /** Identifier of the running process, or "IDLE" */
  pid: string;
  /** Start time of this slice */
  start: number;
  /** End time of this slice */
  end: number;
  /** Whether the CPU was idle during this segment */
  isIdle: boolean;
}

/**
 * An idle period when no process is ready in the CPU.
 */
export interface IdleSegment {
  start: number;
  end: number;
  duration: number;
}

/**
 * Granular step-by-step narrative event for the Learning Mode.
 */
export interface StepLog {
  time: number;
  event: 'ARRIVAL' | 'SCHEDULE' | 'PREEMPT' | 'COMPLETE' | 'IDLE' | 'AGING';
  description: string;
  runningProcess: string | null;
  readyQueue: string[];
  remainingBursts: Record<string, number>;
}

/**
 * Standardized result returned by every CPU scheduling algorithm.
 */
export interface AlgorithmResult {
  algorithmId: string;
  algorithmName: string;
  timeline: TimelineSegment[];
  idleSegments: IdleSegment[];
  processMetrics: Record<string, ProcessMetric>;
  aggregateMetrics: AggregateMetrics;
  stepLogs: StepLog[];
  contextSwitches: number;
}

/**
 * Options for Priority Scheduling.
 */
export interface PriorityOptions {
  /** If true, 1 is higher priority than 2. If false, higher number = higher priority. */
  lowerNumberIsHigherPriority: boolean;
}

/**
 * Options for Round Robin Scheduling.
 */
export interface RoundRobinOptions {
  /** Time slice allocated to each process */
  quantum: number;
  /** Optional context switch overhead time (default: 0) */
  contextSwitchOverhead?: number;
}

/**
 * Configuration for each queue level in MLFQ.
 */
export interface MLFQQueueConfig {
  queueIndex: number;
  algorithm: 'RR' | 'FCFS';
  quantum?: number;
}

/**
 * Options for Multilevel Feedback Queue (MLFQ).
 */
export interface MLFQOptions {
  queues: MLFQQueueConfig[];
  /** Threshold waiting time in lower queues before being boosted to prevent starvation */
  agingThreshold: number;
}
