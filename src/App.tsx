import React, { useState, useMemo, useEffect } from 'react';
import { Process } from './types/process';
import { PRESET_SCENARIOS } from './data/presets';
import { solveFCFS } from './algorithms/fcfs';
import { solveSJF } from './algorithms/sjf';
import { solveSRTF } from './algorithms/srtf';
import { solvePriority } from './algorithms/priority';
import { solveRoundRobin } from './algorithms/roundRobin';
import { solveMLFQ } from './algorithms/mlfq';
import { usePlayback } from './hooks/usePlayback';
import { useTheme } from './hooks/useTheme';
import { Navbar } from './components/layout/Navbar';
import { ProcessTable } from './components/input/ProcessTable';
import { PlaybackControls } from './components/visualization/PlaybackControls';
import { GanttChart } from './components/visualization/GanttChart';
import { LiveInspector } from './components/visualization/LiveInspector';
import { SummaryCards } from './components/analytics/SummaryCards';
import { ProcessMetricsTable } from './components/analytics/ProcessMetricsTable';
import { CompareAllView } from './components/analytics/CompareAllView';
import { StepExplanationPanel } from './components/learning/StepExplanationPanel';
import { TheoryCard } from './components/learning/TheoryCard';
import { PrintReportModal } from './components/export/PrintReportModal';
import { Settings2, Sliders, ArrowRightLeft } from 'lucide-react';

export const App: React.FC = () => {
  const { theme, setTheme } = useTheme();

  // Read URL query params if present for deep linking & automated test verification
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialTab = (searchParams?.get('tab') as 'single' | 'compare' | 'theory') || 'single';
  const initialAlgo = searchParams?.get('algo') || 'fcfs';
  const initialReport = searchParams?.get('report') === 'true';

  useEffect(() => {
    const urlTheme = searchParams?.get('theme');
    if (urlTheme === 'dark' || urlTheme === 'projector' || urlTheme === 'light') {
      setTheme(urlTheme as any);
    }
  }, []);

  // LocalStorage persistence for user's processes
  const [processes, setProcesses] = useState<Process[]>(() => {
    try {
      const saved = localStorage.getItem('cpu_visualizer_processes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      // fallback
    }
    return PRESET_SCENARIOS[0].processes;
  });

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string>(initialAlgo);
  const [quantum, setQuantum] = useState<number>(2);
  const [lowerNumberIsHigherPriority, setLowerNumberIsHigherPriority] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'single' | 'compare' | 'theory'>(initialTab);
  const [isReportOpen, setIsReportOpen] = useState<boolean>(initialReport);

  // Sync processes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cpu_visualizer_processes', JSON.stringify(processes));
    } catch (e) {
      // quota or local storage error
    }
  }, [processes]);

  // Execute selected algorithm pure function
  const algorithmResult = useMemo(() => {
    if (processes.length === 0) return null;

    switch (selectedAlgorithm) {
      case 'fcfs':
        return solveFCFS(processes);
      case 'sjf':
        return solveSJF(processes);
      case 'srtf':
        return solveSRTF(processes);
      case 'priority-np':
        return solvePriority(processes, false, { lowerNumberIsHigherPriority });
      case 'priority-p':
        return solvePriority(processes, true, { lowerNumberIsHigherPriority });
      case 'rr':
        return solveRoundRobin(processes, { quantum });
      case 'mlfq':
        return solveMLFQ(processes);
      default:
        return solveFCFS(processes);
    }
  }, [processes, selectedAlgorithm, quantum, lowerNumberIsHigherPriority]);

  // Playback engine
  const playback = usePlayback({
    algorithmResult,
    processes,
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        theme={theme}
        onChangeTheme={setTheme}
        onOpenReport={() => setIsReportOpen(true)}
      />

      {/* Main Workspace Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Input Table & Algorithm Configuration */}
            <div className="lg:col-span-5 space-y-4">
              {/* Algorithm Selector Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
                    <Settings2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>Scheduling Algorithm</span>
                  </div>
                </div>

                <select
                  value={selectedAlgorithm}
                  onChange={(e) => setSelectedAlgorithm(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm font-medium bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="fcfs">First-Come, First-Served (FCFS)</option>
                  <option value="sjf">Shortest Job First (SJF - Non-Preemptive)</option>
                  <option value="srtf">Shortest Remaining Time First (SRTF - Preemptive)</option>
                  <option value="priority-np">Priority (Non-Preemptive)</option>
                  <option value="priority-p">Priority (Preemptive)</option>
                  <option value="rr">Round Robin (RR)</option>
                  <option value="mlfq">Multilevel Feedback Queue (MLFQ)</option>
                </select>

                {/* Additional Algorithm-Specific Options */}
                {selectedAlgorithm === 'rr' && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-blue-500" />
                      Time Quantum (q): <strong className="font-mono text-blue-600">{quantum}</strong>
                    </span>
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={quantum}
                      onChange={(e) => setQuantum(Number(e.target.value))}
                      className="w-32 accent-blue-600 cursor-pointer"
                    />
                  </div>
                )}

                {selectedAlgorithm.startsWith('priority') && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">Priority Convention:</span>
                    <button
                      onClick={() => setLowerNumberIsHigherPriority(!lowerNumberIsHigherPriority)}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>{lowerNumberIsHigherPriority ? '1 = Highest' : 'Higher = Highest'}</span>
                    </button>
                  </div>
                )}

                {selectedAlgorithm === 'mlfq' && (
                  <div className="p-2.5 bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/40 rounded-xl text-[11px] text-slate-600 dark:text-slate-400 space-y-1">
                    <p className="font-semibold text-blue-700 dark:text-blue-300">
                      MLFQ Configuration:
                    </p>
                    <p>&bull; Q0: Round Robin (q=2) - Top Priority</p>
                    <p>&bull; Q1: Round Robin (q=4) - Medium Priority</p>
                    <p>&bull; Q2: FCFS - Lowest Priority with Aging Boost (T=12)</p>
                  </div>
                )}
              </div>

              {/* Reactive Process Table */}
              <ProcessTable
                processes={processes}
                onChangeProcesses={setProcesses}
                selectedAlgorithm={selectedAlgorithm}
              />
            </div>

            {/* Right Column: Visualization & Performance Analytics */}
            <div className="lg:col-span-7 space-y-5">
              {/* Playback Controls */}
              <PlaybackControls
                currentTime={playback.currentTime}
                makespan={playback.makespan}
                isPlaying={playback.isPlaying}
                speed={playback.speed}
                onTogglePlay={playback.togglePlay}
                onStepForward={playback.stepForward}
                onStepBack={playback.stepBack}
                onReset={playback.reset}
                onSeek={playback.seekTo}
                onChangeSpeed={playback.setSpeed}
              />

              {/* Custom SVG Gantt Chart */}
              <GanttChart
                timeline={algorithmResult?.timeline ?? []}
                processes={processes}
                currentTime={playback.currentTime}
                makespan={playback.makespan}
                onSeek={playback.seekTo}
              />

              {/* Live State Inspector (CPU, Ready Queue, Remaining Bursts) */}
              <LiveInspector
                currentTime={playback.currentTime}
                activePid={playback.activePid}
                readyQueue={playback.readyQueue}
                remainingBursts={playback.remainingBursts}
                processes={processes}
              />

              {/* Aggregate Performance Cards */}
              {algorithmResult && (
                <SummaryCards metrics={algorithmResult.aggregateMetrics} />
              )}

              {/* Per-Process Metrics Table with Starvation Flags */}
              {algorithmResult && (
                <ProcessMetricsTable
                  metrics={algorithmResult.processMetrics}
                  showPriority={selectedAlgorithm.startsWith('priority')}
                />
              )}

              {/* Step Explanation Narrator */}
              {algorithmResult && (
                <StepExplanationPanel
                  stepLogs={algorithmResult.stepLogs}
                  currentTime={playback.currentTime}
                  onSeek={playback.seekTo}
                />
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Compare All Mode */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <CompareAllView
              processes={processes}
              quantum={quantum}
              lowerNumberIsHigherPriority={lowerNumberIsHigherPriority}
            />
          </div>
        )}

        {/* Tab 3: Theory & Viva Guide */}
        {activeTab === 'theory' && (
          <div className="max-w-5xl mx-auto">
            <TheoryCard selectedAlgorithmId={selectedAlgorithm} />
          </div>
        )}
      </main>

      {/* Printable Report View Modal */}
      <PrintReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        result={algorithmResult}
        processes={processes}
      />
    </div>
  );
};

export default App;
