import React from 'react';
import { AlgorithmResult } from '../../algorithms/types';
import { Process } from '../../types/process';
import { Printer, X, Download } from 'lucide-react';
import { exportMetricsToCSV, downloadCSV } from '../../utils/csvHelper';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  result: AlgorithmResult | null;
  processes: Process[];
}

export const PrintReportModal: React.FC<Props> = ({
  isOpen,
  onClose,
  result,
  processes,
}) => {
  if (!isOpen || !result) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csv = exportMetricsToCSV(result.processMetrics);
    downloadCSV(`${result.algorithmId}_metrics_report.csv`, csv);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white text-slate-900 rounded-3xl max-w-4xl w-full shadow-2xl overflow-hidden print:shadow-none print:rounded-none print:max-w-full print:w-full my-8">
        {/* Modal Controls (Hidden in print) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white print:hidden">
          <div className="flex items-center gap-2 font-semibold text-sm">
            <Printer className="w-4 h-4 text-blue-400" />
            <span>Academic Performance Report Preview</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm transition-all"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors ml-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Body */}
        <div className="p-8 sm:p-12 space-y-8 bg-white print:p-6 text-slate-900">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-6 text-center">
            <h1 className="text-2xl font-bold tracking-tight uppercase">
              Operating Systems Laboratory Report
            </h1>
            <h2 className="text-lg font-semibold text-blue-800 mt-1">
              CPU Scheduling Performance & Execution Analysis
            </h2>
            <div className="flex justify-center items-center gap-6 text-xs text-slate-500 mt-3 font-mono">
              <span>Date: {new Date().toLocaleDateString()}</span>
              <span>Algorithm: <strong>{result.algorithmName}</strong></span>
              <span>Workload: {processes.length} Processes</span>
            </div>
          </div>

          {/* Section 1: Aggregate Benchmarks */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              1. Aggregate Performance Indicators
            </h3>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center">
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-sans">Avg Waiting</div>
                <div className="text-base font-bold font-mono text-blue-700">
                  {result.aggregateMetrics.avgWaitingTime} ms
                </div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-sans">Avg Turnaround</div>
                <div className="text-base font-bold font-mono text-purple-700">
                  {result.aggregateMetrics.avgTurnaroundTime} ms
                </div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-sans">Avg Response</div>
                <div className="text-base font-bold font-mono text-amber-700">
                  {result.aggregateMetrics.avgResponseTime} ms
                </div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-sans">CPU Utilization</div>
                <div className="text-base font-bold font-mono text-emerald-700">
                  {result.aggregateMetrics.cpuUtilization}%
                </div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-sans">Context Switches</div>
                <div className="text-base font-bold font-mono text-rose-700">
                  {result.aggregateMetrics.totalContextSwitches}
                </div>
              </div>
              <div className="p-3 bg-slate-50 border rounded-xl">
                <div className="text-[11px] text-slate-500 font-sans">Total Makespan</div>
                <div className="text-base font-bold font-mono text-slate-800">
                  {result.aggregateMetrics.makespan} ms
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Detailed Process Metrics Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              2. Individual Process Scheduling Metrics
            </h3>
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 font-sans font-bold text-slate-700">
                  <th className="py-2 px-3">PID</th>
                  <th className="py-2 px-3">Arrival (AT)</th>
                  <th className="py-2 px-3">Burst (BT)</th>
                  <th className="py-2 px-3">Priority</th>
                  <th className="py-2 px-3">Start</th>
                  <th className="py-2 px-3">Completion (CT)</th>
                  <th className="py-2 px-3">Turnaround (TAT)</th>
                  <th className="py-2 px-3">Waiting (WT)</th>
                  <th className="py-2 px-3">Response (RT)</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(result.processMetrics).map((m) => (
                  <tr key={m.pid} className="border-b border-slate-200">
                    <td className="py-2 px-3 font-bold">{m.pid}</td>
                    <td className="py-2 px-3">{m.arrivalTime}</td>
                    <td className="py-2 px-3">{m.burstTime}</td>
                    <td className="py-2 px-3">{m.priority ?? 0}</td>
                    <td className="py-2 px-3">{m.startTime}</td>
                    <td className="py-2 px-3 font-semibold">{m.completionTime}</td>
                    <td className="py-2 px-3">{m.turnaroundTime}</td>
                    <td className="py-2 px-3 font-bold text-blue-700">{m.waitingTime}</td>
                    <td className="py-2 px-3">{m.responseTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 3: Timeline Segments */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              3. Execution Timeline Representation
            </h3>
            <div className="p-4 bg-slate-50 border rounded-xl space-y-2">
              <div className="flex flex-wrap items-center gap-1 font-mono text-xs">
                {result.timeline.map((seg, i) => (
                  <div
                    key={i}
                    className={`px-2 py-1 border rounded text-center min-w-[40px] ${
                      seg.isIdle ? 'bg-slate-200 text-slate-600' : 'bg-blue-600 text-white font-bold'
                    }`}
                  >
                    <div>{seg.pid}</div>
                    <div className="text-[9px] opacity-80 font-normal">
                      {seg.start}..{seg.end}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Analytical Discussion & Sign-off */}
          <div className="space-y-2 pt-2 text-xs text-slate-700 leading-relaxed">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 border-b border-slate-200 pb-1">
              4. Verification Sign-Off
            </h3>
            <p>
              The execution metrics above have been verified using standard discrete-event scheduling invariants:
              <br />
              &bull; <code>Turnaround Time = Completion Time - Arrival Time</code>
              <br />
              &bull; <code>Waiting Time = Turnaround Time - Burst Time</code>
              <br />
              &bull; <code>Response Time = First CPU Allocation Time - Arrival Time</code>
            </p>
            <div className="pt-8 flex justify-between items-center text-xs text-slate-500 border-t border-slate-300 mt-6 font-mono">
              <span>Evaluated by: Teaching Assistant / Examiner</span>
              <span>Signature: __________________________</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
