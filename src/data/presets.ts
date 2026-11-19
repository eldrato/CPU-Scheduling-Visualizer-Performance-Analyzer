import { Scenario } from '../types/scenario';
import { getProcessColor } from '../utils/colorGenerator';

export const PRESET_SCENARIOS: Scenario[] = [
  {
    id: 'silberschatz-convoy',
    name: 'Convoy Effect (Silberschatz)',
    category: 'Phenomenon',
    description:
      'Demonstrates the Convoy Effect in FCFS: a CPU-bound process (P1) monopolizes the processor, forcing subsequent short processes (P2, P3) to suffer excessive waiting times.',
    defaultAlgorithm: 'fcfs',
    processes: [
      { pid: 'P1', arrivalTime: 0, burstTime: 24, priority: 3, queueLevel: 0, color: getProcessColor(0) },
      { pid: 'P2', arrivalTime: 0, burstTime: 3, priority: 1, queueLevel: 0, color: getProcessColor(1) },
      { pid: 'P3', arrivalTime: 0, burstTime: 3, priority: 2, queueLevel: 0, color: getProcessColor(2) },
    ],
  },
  {
    id: 'srtf-preemption-benchmark',
    name: 'SJF vs SRTF Preemption Benchmark',
    category: 'Textbook',
    description:
      'Classic textbook exercise highlighting how preemption in SRTF significantly lowers average turnaround and waiting times compared to non-preemptive SJF when shorter jobs arrive late.',
    defaultAlgorithm: 'srtf',
    processes: [
      { pid: 'P1', arrivalTime: 0, burstTime: 8, priority: 3, queueLevel: 0, color: getProcessColor(0) },
      { pid: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, queueLevel: 0, color: getProcessColor(1) },
      { pid: 'P3', arrivalTime: 2, burstTime: 9, priority: 4, queueLevel: 0, color: getProcessColor(2) },
      { pid: 'P4', arrivalTime: 3, burstTime: 5, priority: 2, queueLevel: 0, color: getProcessColor(3) },
    ],
  },
  {
    id: 'round-robin-quantum-edge',
    name: 'Round Robin Quantum Boundary Case',
    category: 'Edge Case',
    description:
      'Tests the exact boundary condition where a new process (P2) arrives at the exact moment P1’s quantum expires (t=4). Demonstrates that P2 is prioritized into the queue before P1 is re-enqueued.',
    defaultAlgorithm: 'rr',
    defaultQuantum: 4,
    processes: [
      { pid: 'P1', arrivalTime: 0, burstTime: 6, priority: 1, queueLevel: 0, color: getProcessColor(0) },
      { pid: 'P2', arrivalTime: 4, burstTime: 3, priority: 1, queueLevel: 0, color: getProcessColor(1) },
      { pid: 'P3', arrivalTime: 5, burstTime: 2, priority: 2, queueLevel: 0, color: getProcessColor(2) },
    ],
  },
  {
    id: 'starvation-priority-aging',
    name: 'Priority Starvation & Aging Case',
    category: 'Phenomenon',
    description:
      'High-priority stream of short processes enters continuously, starving a low-priority job (P1). Shows why operating systems implement aging to guarantee bounded wait time.',
    defaultAlgorithm: 'priority-p',
    processes: [
      { pid: 'P1', arrivalTime: 0, burstTime: 12, priority: 5, queueLevel: 2, color: getProcessColor(0) },
      { pid: 'P2', arrivalTime: 1, burstTime: 3, priority: 1, queueLevel: 0, color: getProcessColor(1) },
      { pid: 'P3', arrivalTime: 3, burstTime: 2, priority: 1, queueLevel: 0, color: getProcessColor(2) },
      { pid: 'P4', arrivalTime: 5, burstTime: 3, priority: 2, queueLevel: 0, color: getProcessColor(3) },
      { pid: 'P5', arrivalTime: 7, burstTime: 2, priority: 1, queueLevel: 0, color: getProcessColor(4) },
    ],
  },
  {
    id: 'idle-gaps-sporadic',
    name: 'Sporadic Arrivals with CPU Idle Gaps',
    category: 'Edge Case',
    description:
      'Evaluates CPU idle time handling, hatched idle visualization, and accurate CPU utilization percentage across distinct bursts with arrival gaps.',
    defaultAlgorithm: 'fcfs',
    processes: [
      { pid: 'P1', arrivalTime: 2, burstTime: 4, priority: 2, queueLevel: 0, color: getProcessColor(0) },
      { pid: 'P2', arrivalTime: 10, burstTime: 5, priority: 1, queueLevel: 0, color: getProcessColor(1) },
      { pid: 'P3', arrivalTime: 18, burstTime: 3, priority: 3, queueLevel: 0, color: getProcessColor(2) },
    ],
  },
  {
    id: 'mlfq-interactive-mix',
    name: 'MLFQ Interactive vs Batch Mix',
    category: 'Textbook',
    description:
      'Mixed workload of I/O-bound quick processes (which stay in Q0) and long CPU-intensive batch jobs (which demote through Q1 down to Q2).',
    defaultAlgorithm: 'mlfq',
    processes: [
      { pid: 'P1 (Batch)', arrivalTime: 0, burstTime: 14, priority: 3, queueLevel: 0, color: getProcessColor(0) },
      { pid: 'P2 (UI Event)', arrivalTime: 2, burstTime: 2, priority: 1, queueLevel: 0, color: getProcessColor(1) },
      { pid: 'P3 (Web Req)', arrivalTime: 5, burstTime: 3, priority: 2, queueLevel: 0, color: getProcessColor(2) },
      { pid: 'P4 (Render)', arrivalTime: 8, burstTime: 8, priority: 2, queueLevel: 0, color: getProcessColor(3) },
    ],
  },
];
