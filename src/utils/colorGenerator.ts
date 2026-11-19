/**
 * A curated palette of accessible, distinct colors for processes.
 * Tested for readability in light, dark, and high-contrast projector modes.
 */
export const PROCESS_PALETTE = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#6366f1', // Indigo
  '#84cc16', // Lime
  '#d946ef', // Fuchsia
  '#e11d48', // Rose
];

/**
 * Returns a stable, distinct color based on index or PID.
 */
export function getProcessColor(index: number): string {
  return PROCESS_PALETTE[index % PROCESS_PALETTE.length];
}
