/**
 * Definition of a Process in the CPU Scheduling Visualizer.
 */
export interface Process {
  /** Unique process identifier, e.g. "P1", "P2" */
  pid: string;
  /** Arrival time in CPU clock cycles (integer >= 0) */
  arrivalTime: number;
  /** Total CPU burst duration needed (integer > 0) */
  burstTime: number;
  /** Priority integer (optional; default 0) */
  priority?: number;
  /** Initial queue level for Multilevel Feedback Queue (optional; default 0) */
  queueLevel?: number;
  /** Visual color assigned to the process */
  color?: string;
}

/**
 * Standard performance metrics calculated for an individual process.
 */
export interface ProcessMetric {
  pid: string;
  arrivalTime: number;
  burstTime: number;
  priority?: number;
  /** Time of first CPU allocation (used for Response Time) */
  startTime: number;
  /** Time when process finishes all execution */
  completionTime: number;
  /** Turnaround Time = Completion Time - Arrival Time */
  turnaroundTime: number;
  /** Waiting Time = Turnaround Time - Burst Time */
  waitingTime: number;
  /** Response Time = First CPU Start Time - Arrival Time */
  responseTime: number;
}

/**
 * Aggregate system-wide scheduling performance metrics.
 */
export interface AggregateMetrics {
  /** Mean waiting time across all processes */
  avgWaitingTime: number;
  /** Mean turnaround time across all processes */
  avgTurnaroundTime: number;
  /** Mean response time across all processes */
  avgResponseTime: number;
  /** Percentage of makespan where CPU was actively executing processes */
  cpuUtilization: number;
  /** Throughput: number of completed processes per unit time */
  throughput: number;
  /** Total number of involuntary and voluntary context switches */
  totalContextSwitches: number;
  /** Total makespan (completion time of the last process or simulation end) */
  makespan: number;
}
