# CPU Scheduling Visualizer & Performance Analyzer

An interactive web application that simulates classic CPU scheduling algorithms, animates them on a Gantt chart, and compares their performance side by side. Built as an Operating Systems course project.

![Screenshot: main dashboard](docs/screenshots/dashboard.png)

## Table of Contents

- [Features](#features)
- [Supported Algorithms](#supported-algorithms)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Formulas Used](#formulas-used)
- [Project Structure](#project-structure)
- [Edge Cases and Tie-Breaking Rules](#edge-cases-and-tie-breaking-rules)
- [Testing](#testing)
- [Screenshots](#screenshots)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

## Features

**Process input**
- Editable table with PID, Arrival Time, Burst Time, Priority and Queue (for MLFQ)
- Add, remove and edit rows; generate N random processes; load sample scenarios
- CSV import and export
- Inline validation (no negative values, burst > 0, integers only, unique PIDs)

**Visualization**
- Animated Gantt chart with play, pause, step forward, step back, reset and a speed slider
- Live view of the current time, running process, ready queue and remaining burst times
- Color-coded processes, hatched idle blocks and context-switch markers
- Tooltips showing start, end and duration for each block

**Performance analysis**
- Per-process Completion, Turnaround, Waiting and Response times
- Average WT, TAT and RT, CPU utilization, throughput, context switches and makespan
- **Compare All** mode: runs every algorithm on the same process set, shows a metrics table and bar charts, highlights the best algorithm per metric and generates a short written conclusion
- Starvation indicator for processes whose waiting time exceeds a configurable threshold

**Learning mode**
- Step-by-step explanation panel narrating each scheduling decision in plain English
- Theory card per algorithm: definition, preemptive or not, advantages, disadvantages, convoy effect and starvation notes

**Export**
- Gantt chart as PNG
- Metrics as CSV
- Printable report view

## Supported Algorithms

| Algorithm | Preemptive | Notes |
|---|---|---|
| First Come First Served (FCFS) | No | Simple; prone to the convoy effect |
| Shortest Job First (SJF) | No | Minimizes average waiting time among non-preemptive algorithms |
| Shortest Remaining Time First (SRTF) | Yes | Preemptive SJF; optimal average waiting time, risk of starvation |
| Priority Scheduling | Both | Toggle preemptive mode and "lower number = higher priority" |
| Round Robin (RR) | Yes | Configurable time quantum |
| Multilevel Queue / MLFQ (bonus) | Yes | Configurable queues, quanta and aging |

## Tech Stack

- React + Vite
- JavaScript / TypeScript
- CSS (or Tailwind)
- Recharts or Chart.js for charts
- Custom SVG/DOM Gantt chart
- Vitest for unit tests
- No backend; state is kept in the browser with `localStorage` for saved scenarios

Scheduling logic lives in pure functions under `src/algorithms`, fully separated from the UI so it can be unit tested.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm (or yarn / pnpm)

### Installation

```bash
git clone https://github.com/<your-username>/cpu-scheduling-visualizer.git
cd cpu-scheduling-visualizer
npm install
```

### Run in development

```bash
npm run dev
```

Open the URL printed in the terminal (usually http://localhost:5173).

### Build for production

```bash
npm run build
npm run preview
```

### Run tests

```bash
npm test
```

## Usage

1. **Enter processes** in the input panel, or click *Load Sample* / *Random Generate*.
2. **Pick an algorithm** (and set the time quantum or priority options if needed).
3. Click **Run** to compute the schedule, then use the playback controls to animate the Gantt chart.
4. Read the **metrics table** for per-process and average results.
5. Switch to the **Compare All** tab to see every algorithm on the same workload.
6. Open the **Theory** tab to review how each algorithm works.
7. **Export** your results as PNG, CSV or a printable report.

### Sample input

| PID | Arrival | Burst | Priority |
|---|---|---|---|
| P1 | 0 | 5 | 2 |
| P2 | 1 | 3 | 1 |
| P3 | 2 | 8 | 4 |
| P4 | 3 | 6 | 3 |

## Formulas Used

| Metric | Formula |
|---|---|
| Completion Time (CT) | Time at which the process finishes |
| Turnaround Time (TAT) | `CT - AT` |
| Waiting Time (WT) | `TAT - BT` |
| Response Time (RT) | `First CPU time - AT` |
| CPU Utilization | `(Total busy time / Makespan) x 100` |
| Throughput | `Number of processes / Makespan` |
| Average WT / TAT / RT | `Sum over all processes / Number of processes` |

AT = Arrival Time, BT = Burst Time.

## Project Structure

```
.
├── src/
│   ├── algorithms/     # FCFS, SJF, SRTF, Priority, Round Robin, MLFQ (pure functions)
│   ├── components/     # Input table, Gantt chart, metrics, charts, theory cards
│   ├── utils/          # Metrics, validators, CSV import/export
│   └── data/           # Sample scenarios
├── tests/              # Unit tests with hand-verified textbook examples
├── docs/
│   ├── REPORT.md       # Project report draft
│   └── screenshots/
├── README.md
└── package.json
```

Every algorithm returns the same result shape:

```js
{
  timeline: [{ pid, start, end }],   // execution segments
  idle: [{ start, end }],            // CPU idle gaps
  processes: [{ pid, ct, tat, wt, rt }],
  contextSwitches: Number
}
```

## Edge Cases and Tie-Breaking Rules

- **Idle gaps:** the CPU stays idle when no process has arrived and the gap is shown on the chart.
- **Ties:** broken by arrival time, then by PID.
- **Round Robin:** if a new process arrives exactly when a quantum expires, it is queued **before** the preempted process.
- **Preemptive Priority:** equal priorities do not cause preemption.
- Single-process input and very large burst times are supported.

## Testing

Unit tests cover every algorithm using well-known textbook examples. Each test includes comments showing the hand calculation of the expected values.

```bash
npm test
```

## Screenshots

| Gantt animation | Compare All |
|---|---|
| ![Gantt](docs/screenshots/gantt.png) | ![Compare](docs/screenshots/compare.png) |

| Learning mode | Dark mode |
|---|---|
| ![Learning](docs/screenshots/learning.png) | ![Dark](docs/screenshots/dark.png) |

## Roadmap

- [x] Algorithm engine with unit tests
- [x] Process input and validation
- [x] Animated Gantt chart
- [x] Metrics and Compare All mode
- [x] Learning mode and export
- [ ] Multilevel Feedback Queue with aging (bonus)
- [ ] Shareable scenario links
- [ ] I/O burst support

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m "Add my feature"`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Author

**Your Name**
Operating Systems Course Project
GitHub: [@your-username](https://github.com/your-username)
