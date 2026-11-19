import { Process, ProcessMetric } from '../types/process';
import { getProcessColor } from './colorGenerator';

/**
 * Converts a list of processes into CSV string format.
 */
export function exportProcessesToCSV(processes: Process[]): string {
  const headers = ['PID', 'Arrival Time', 'Burst Time', 'Priority', 'Queue Level'];
  const rows = processes.map((p) => [
    p.pid,
    p.arrivalTime,
    p.burstTime,
    p.priority ?? 0,
    p.queueLevel ?? 0,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Converts process metrics into a detailed analysis CSV.
 */
export function exportMetricsToCSV(metrics: Record<string, ProcessMetric>): string {
  const headers = [
    'PID',
    'Arrival Time',
    'Burst Time',
    'Priority',
    'Start Time',
    'Completion Time',
    'Turnaround Time (TAT)',
    'Waiting Time (WT)',
    'Response Time (RT)',
  ];

  const rows = Object.values(metrics).map((m) => [
    m.pid,
    m.arrivalTime,
    m.burstTime,
    m.priority ?? 0,
    m.startTime,
    m.completionTime,
    m.turnaroundTime,
    m.waitingTime,
    m.responseTime,
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Triggers a client-side file download for CSV text.
 */
export function downloadCSV(filename: string, content: string): void {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Parses raw CSV string into an array of Processes.
 */
export function parseProcessesFromCSV(csvText: string): {
  success: boolean;
  processes: Process[];
  error?: string;
} {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  if (lines.length < 2) {
    return {
      success: false,
      processes: [],
      error: 'CSV must contain at least a header row and one process row.',
    };
  }

  const rawHeaders = lines[0].split(',').map((h) => h.trim().toLowerCase());

  // Find column indices
  const pidIdx = rawHeaders.findIndex((h) => h === 'pid' || h.includes('process'));
  const atIdx = rawHeaders.findIndex((h) => h === 'arrival' || h.includes('arrival') || h === 'at');
  const btIdx = rawHeaders.findIndex((h) => h === 'burst' || h.includes('burst') || h === 'bt');
  const prioIdx = rawHeaders.findIndex((h) => h === 'priority' || h.includes('prio'));
  const queueIdx = rawHeaders.findIndex((h) => h === 'queue' || h.includes('queue'));

  if (pidIdx === -1 || atIdx === -1 || btIdx === -1) {
    return {
      success: false,
      processes: [],
      error:
        'CSV must include at least "PID", "Arrival Time" (or AT), and "Burst Time" (or BT) headers.',
    };
  }

  const processes: Process[] = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',').map((p) => p.trim());
    if (parts.length <= Math.max(pidIdx, atIdx, btIdx)) continue;

    const pid = parts[pidIdx];
    const arrivalTime = parseInt(parts[atIdx], 10);
    const burstTime = parseInt(parts[btIdx], 10);
    const priority = prioIdx !== -1 && parts[prioIdx] ? parseInt(parts[prioIdx], 10) : 0;
    const queueLevel = queueIdx !== -1 && parts[queueIdx] ? parseInt(parts[queueIdx], 10) : 0;

    if (!pid || isNaN(arrivalTime) || isNaN(burstTime)) {
      return {
        success: false,
        processes: [],
        error: `Row ${i + 1} contains invalid numeric data for arrival or burst time.`,
      };
    }

    processes.push({
      pid,
      arrivalTime: Math.max(0, arrivalTime),
      burstTime: Math.max(1, burstTime),
      priority: isNaN(priority) ? 0 : priority,
      queueLevel: isNaN(queueLevel) ? 0 : queueLevel,
      color: getProcessColor(i - 1),
    });
  }

  return { success: true, processes };
}
