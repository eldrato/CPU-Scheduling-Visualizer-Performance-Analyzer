export interface AlgorithmTheory {
  id: string;
  name: string;
  classification: 'Preemptive' | 'Non-preemptive' | 'Hybrid';
  criterion: string;
  definition: string;
  advantages: string[];
  disadvantages: string[];
  convoyEffect: boolean;
  starvationRisk: boolean;
  mitigation: string;
  vivaQuestions: { q: string; a: string }[];
}

export const ALGORITHM_THEORY: Record<string, AlgorithmTheory> = {
  fcfs: {
    id: 'fcfs',
    name: 'First-Come, First-Served (FCFS)',
    classification: 'Non-preemptive',
    criterion: 'Arrival Time',
    definition:
      'The simplest scheduling algorithm. Processes are dispatched strictly in the order they enter the ready queue (FIFO queue). Once assigned the CPU, a process holds it until completion or voluntary yield.',
    advantages: [
      'Extremely simple to implement with minimal algorithmic overhead.',
      'Fair in terms of request order: no process can jump ahead in the ready queue.',
      'Completely free from starvation; every process is guaranteed to run eventually.',
    ],
    disadvantages: [
      'High average waiting time, heavily dependent on process arrival order.',
      'Subject to the severe Convoy Effect: short processes get blocked behind a large CPU-bound process.',
      'Poor response time for interactive and real-time systems.',
    ],
    convoyEffect: true,
    starvationRisk: false,
    mitigation: 'Use preemption or SJF/Round Robin to prevent long processes from hogging the CPU.',
    vivaQuestions: [
      {
        q: 'What is the Convoy Effect in FCFS?',
        a: 'The Convoy Effect occurs when a CPU-intensive process holds the processor for a long duration, causing all subsequent short or I/O-bound processes to queue behind it, resulting in low CPU and device utilization.',
      },
      {
        q: 'Can FCFS ever suffer from starvation?',
        a: 'No, because the ready queue operates strictly as a FIFO queue with bounded arrival order.',
      },
    ],
  },
  sjf: {
    id: 'sjf',
    name: 'Shortest Job First (SJF)',
    classification: 'Non-preemptive',
    criterion: 'CPU Burst Duration',
    definition:
      'Schedules the available ready process with the smallest CPU burst time. Once assigned to the CPU, it runs uninterrupted until completion.',
    advantages: [
      'Provably optimal among non-preemptive algorithms for minimizing average waiting time for a given set of processes.',
      'High throughput for systems dominated by short jobs.',
    ],
    disadvantages: [
      'Impossible to know the exact length of the next CPU burst in advance in general-purpose OS (must be predicted using exponential averaging).',
      'Can cause indefinite starvation for long-burst jobs if short jobs arrive continually.',
    ],
    convoyEffect: false,
    starvationRisk: true,
    mitigation: 'Implement Aging: gradually increase the priority of long-waiting jobs.',
    vivaQuestions: [
      {
        q: 'Why is SJF optimal?',
        a: 'By executing shorter jobs first, their turnaround and waiting times are minimized rapidly, reducing the cumulative queue waiting time faster than any other non-preemptive ordering.',
      },
      {
        q: 'How does an OS estimate burst times in practice?',
        a: 'Using exponential smoothing: τ_{n+1} = α * t_n + (1 - α) * τ_n, where t_n is the most recent burst and α is a weighting factor (typically 0.5).',
      },
    ],
  },
  srtf: {
    id: 'srtf',
    name: 'Shortest Remaining Time First (SRTF)',
    classification: 'Preemptive',
    criterion: 'Remaining CPU Burst Duration',
    definition:
      'The preemptive counterpart of SJF. When a new process arrives, if its burst time is strictly less than the remaining execution time of the currently running process, the current process is preempted.',
    advantages: [
      'Provably optimal algorithm with respect to minimum average waiting time across all scheduling algorithms.',
      'Provides rapid turnaround for short interactive requests.',
    ],
    disadvantages: [
      'Higher context switching overhead compared to non-preemptive SJF.',
      'Severe starvation risk for long processes under heavy workloads.',
      'Requires continuous tracking and prediction of remaining burst times.',
    ],
    convoyEffect: false,
    starvationRisk: true,
    mitigation: 'Aging or dynamic quantum thresholds.',
    vivaQuestions: [
      {
        q: 'What is the tie-breaker rule when an arriving job has equal remaining burst to the running job?',
        a: 'The CPU keeps executing the currently running process to eliminate an unnecessary context switch.',
      },
    ],
  },
  'priority-np': {
    id: 'priority-np',
    name: 'Priority Scheduling (Non-Preemptive)',
    classification: 'Non-preemptive',
    criterion: 'Priority Integer',
    definition:
      'CPU is allocated to the ready process with the highest priority. In non-preemptive mode, a running process retains the CPU until completion even if a higher-priority process arrives.',
    advantages: [
      'Directly reflects process importance, deadlines, and quality-of-service tiers.',
      'Simple queue sorting upon completion.',
    ],
    disadvantages: [
      'Indefinite blocking (starvation) of low-priority processes.',
      'Priority inversion risks where high priority jobs wait on resources held by low priority jobs.',
    ],
    convoyEffect: false,
    starvationRisk: true,
    mitigation: 'Aging: dynamically increment process priority by 1 for every unit time spent waiting.',
    vivaQuestions: [
      {
        q: 'What is priority inversion and how is it resolved?',
        a: 'Priority inversion happens when a lower-priority task holds a shared lock required by a high-priority task. It is solved via Priority Inheritance Protocol.',
      },
    ],
  },
  'priority-p': {
    id: 'priority-p',
    name: 'Priority Scheduling (Preemptive)',
    classification: 'Preemptive',
    criterion: 'Priority Integer',
    definition:
      'Preemptive priority scheduling immediately suspends the currently running process whenever a process with strictly higher priority enters the ready queue.',
    advantages: [
      'Instantaneous response for critical real-time tasks and system-level interrupts.',
      'Guarantees highest priority processes always occupy the processor.',
    ],
    disadvantages: [
      'Context switch thrashing if priorities fluctuate frequently.',
      'Complete starvation of lower priority background tasks under load.',
    ],
    convoyEffect: false,
    starvationRisk: true,
    mitigation: 'Aging and Multilevel Feedback Queues.',
    vivaQuestions: [
      {
        q: 'Why should equal priority NOT trigger preemption?',
        a: 'Preempting for an equal priority introduces context switch overhead without any priority benefit, degrading overall CPU throughput.',
      },
    ],
  },
  rr: {
    id: 'rr',
    name: 'Round Robin (RR)',
    classification: 'Preemptive',
    criterion: 'Time Quantum (Time-sharing)',
    definition:
      'Designed specifically for time-sharing systems. Each ready process is allocated a fixed slice of time called a Time Quantum (q). If the process is still running when its quantum expires, it is preempted and put at the rear of the ready queue.',
    advantages: [
      'Fair, starvation-free scheduling with guaranteed upper bound on response time: (n - 1) * q.',
      'Ideal for interactive, multi-user systems.',
    ],
    disadvantages: [
      'Performance heavily depends on the chosen quantum length: too large degrades to FCFS, too small causes context switch thrashing.',
      'Average waiting time is often higher than SJF/SRTF.',
    ],
    convoyEffect: false,
    starvationRisk: false,
    mitigation: 'Rule of thumb: 80% of CPU bursts should be shorter than the time quantum.',
    vivaQuestions: [
      {
        q: 'What happens if the time quantum is extremely large versus extremely small?',
        a: 'If q is infinite, RR behaves exactly like FCFS. If q is very small (near context switch cost), processor sharing overhead destroys CPU efficiency.',
      },
      {
        q: 'What is the tie-breaking convention when a quantum expires simultaneously with a new arrival?',
        a: 'The newly arriving process enters the ready queue BEFORE the preempted process is re-enqueued.',
      },
    ],
  },
  mlfq: {
    id: 'mlfq',
    name: 'Multilevel Feedback Queue (MLFQ)',
    classification: 'Hybrid',
    criterion: 'Feedback-driven Priority & Quantum',
    definition:
      'Maintains multiple priority queues with distinct quanta (e.g. Q0 with q=2, Q1 with q=4, Q2 FCFS). Processes dynamically move between queues based on their observed CPU burst behavior.',
    advantages: [
      'Approximates SJF without requiring prior knowledge of burst lengths.',
      'Favors interactive I/O-bound jobs while accommodating compute-bound batch jobs.',
      'Aging prevents indefinite starvation in lower queues.',
    ],
    disadvantages: [
      'Most complex scheduler to configure (number of queues, scheduling algorithm per queue, promotion and demotion rules).',
    ],
    convoyEffect: false,
    starvationRisk: true,
    mitigation: 'Aging threshold: boost processes that wait too long in lower tiers up to top queues.',
    vivaQuestions: [
      {
        q: 'How does MLFQ distinguish between interactive and batch processes?',
        a: 'Interactive jobs yield CPU before their quantum expires and stay in high-priority queues; batch jobs consume full quanta and are demoted down.',
      },
    ],
  },
};
