# CPU Scheduling Visualizer & Performance Analyzer

An interactive educational platform, simulation engine, and benchmarking suite designed for Operating Systems courses. Demonstrates CPU scheduling algorithms, edge-case tie-breaking, process state transitions, starvation risks, and comparative performance trade-offs.

---

## 🚀 Key Features

### 1. Pure Algorithm Engine (`/src/algorithms`)
- **First-Come, First-Served (FCFS)**: Non-preemptive scheduling with FIFO queue and Convoy Effect demonstration.
- **Shortest Job First (SJF)**: Provably optimal non-preemptive algorithm for minimizing average waiting time.
- **Shortest Remaining Time First (SRTF)**: Preemptive counterpart of SJF, prioritizing jobs with the lowest remaining burst.
- **Priority Scheduling (Non-Preemptive & Preemptive)**: Flexible priority assignment with configurable conventions (*Lower number = Higher priority* or *Higher number = Higher priority*).
- **Round Robin (RR)**: Time-sharing algorithm with user-configurable quantum $q$ and strict handling of simultaneous arrival boundary conditions.
- **Multilevel Feedback Queue (MLFQ)**: 3-tier feedback queue ($Q_0: \text{RR } q=2$, $Q_1: \text{RR } q=4$, $Q_2: \text{FCFS}$) featuring dynamic process demotion and starvation prevention via aging.

### 2. Interactive Animated Gantt Visualization
- Contiguous timeline segments with color-coded processes and hatched diagonal stripes for CPU idle periods.
- Full playback control suite: **Play / Pause**, **Step Forward**, **Step Backward**, **Reset**, and variable speed multiplier ($0.5\times$ to $4\times$).
- Real-time scrubber line tracking active clock tick $t$.
- Hover tooltips showing exact start time, completion time, duration, and percentage makespan.

### 3. Live State Inspector
- **Active CPU State**: Identifies currently dispatched process, remaining burst, and idle state.
- **Ready Queue Pipeline**: Visual FIFO queue showing processes waiting in dispatch order.
- **Process Status & Progress**: Real-time progress bars tracking executed vs. remaining bursts for every process.

### 4. Comprehensive Performance Analysis
- Per-process performance matrix: Completion Time ($CT$), Turnaround Time ($TAT = CT - AT$), Waiting Time ($WT = TAT - BT$), and Response Time ($RT = \text{First CPU} - AT$).
- Aggregate system metrics: Mean $WT$, Mean $TAT$, Mean $RT$, CPU Utilization $\%$, Throughput (processes/unit time), Context Switches, and Makespan.
- Configurable **Starvation Detection** highlighting processes exceeding waiting thresholds.
- **"Compare All" Benchmarking**: Side-by-side execution of all 6 algorithms on identical workloads, Recharts comparative bar charts, and auto-generated analytical verdicts.

### 5. Learning Mode & Academic Export
- **Step-by-Step Narrator**: Plain-English narration explaining every scheduling decision (dispatches, preemptions, quantum expirations, aging triggers).
- **Theory & Viva Cards**: Comprehensive definitions, classifications, pros & cons, convoy effect & starvation analysis, and examiner viva Q&A.
- **Export Capabilities**: CSV export for metrics and process tables, and academic Printable Report view (`@media print` formatted).

---

## 📐 Mathematical Formulas

$$\text{Turnaround Time (TAT)} = \text{Completion Time (CT)} - \text{Arrival Time (AT)}$$

$$\text{Waiting Time (WT)} = \text{Turnaround Time (TAT)} - \text{Burst Time (BT)}$$

$$\text{Response Time (RT)} = \text{First CPU Dispatch Time} - \text{Arrival Time (AT)}$$

$$\text{CPU Utilization (\%)} = \frac{\text{Total Makespan} - \text{Total Idle Time}}{\text{Total Makespan}} \times 100$$

$$\text{Throughput} = \frac{\text{Total Completed Processes}}{\text{Total Makespan}}$$

---

## 🛠️ Technology Stack
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + custom theme tokens (Light, Dark, and High-Contrast Projector Mode)
- **Charts**: Recharts (Responsive bar charts) & Custom SVG/divs (Gantt timeline)
- **Icons**: Lucide React
- **Testing**: Vitest with hand-calculated textbook benchmarks

---

## 💻 Getting Started

### Prerequisites
- Node.js (v18+)
- npm

### Installation & Run
```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Run automated Vitest test suite
npm test

# Build for production
npm run build
```

---

## 🧪 Edge Cases Grounded in OS Theory
1. **CPU Idle Gaps**: Accurately tracks periods where no process has arrived, rendering hatched blocks and computing exact CPU utilization.
2. **Deterministic Tie-Breaking**: When processes tie in arrival, burst, or priority, order is resolved deterministically by Arrival Time, then Alphanumeric PID order (`P1` before `P2`).
3. **Round Robin Simultaneous Arrival Edge Case**: If process $P_{running}$ exhausts its quantum at time $t$ while process $P_{new}$ arrives at time $t$, $P_{new}$ enters the ready queue **BEFORE** $P_{running}$ is re-enqueued.
4. **Preemptive Priority Equal Priority**: Arriving processes with priority equal to the running process do not trigger preemption, preventing unnecessary context switches.
