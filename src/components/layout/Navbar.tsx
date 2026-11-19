import React from 'react';
import { Theme } from '../../hooks/useTheme';
import {
  Cpu,
  Layers,
  BarChart2,
  BookOpen,
  Printer,
  Sun,
  Moon,
  Projector,
} from 'lucide-react';

interface Props {
  activeTab: 'single' | 'compare' | 'theory';
  onChangeTab: (tab: 'single' | 'compare' | 'theory') => void;
  theme: Theme;
  onChangeTheme: (theme: Theme) => void;
  onOpenReport: () => void;
}

export const Navbar: React.FC<Props> = ({
  activeTab,
  onChangeTab,
  theme,
  onChangeTheme,
  onOpenReport,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base leading-tight">
              CPU Scheduling Visualizer
            </h1>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Performance Analyzer & OS Teaching Tool
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center bg-slate-100 dark:bg-slate-800/80 p-1 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
          <button
            onClick={() => onChangeTab('single')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'single'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Simulation</span>
          </button>

          <button
            onClick={() => onChangeTab('compare')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'compare'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Compare All</span>
          </button>

          <button
            onClick={() => onChangeTab('theory')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === 'theory'
                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-300 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Theory & Viva</span>
          </button>
        </nav>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Printable Report Trigger */}
          <button
            onClick={onOpenReport}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-300 border border-blue-200 dark:border-blue-900/50 hover:bg-blue-100 rounded-xl transition-all shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Print Report</span>
          </button>

          {/* Theme Switcher Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => onChangeTheme('light')}
              title="Light Mode"
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'light'
                  ? 'bg-white text-amber-500 shadow-xs'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Sun className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTheme('dark')}
              title="Dark Mode"
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'dark'
                  ? 'bg-slate-700 text-blue-400 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Moon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onChangeTheme('projector')}
              title="High-Contrast Projector Mode"
              className={`p-1.5 rounded-lg transition-colors ${
                theme === 'projector'
                  ? 'bg-amber-500 text-slate-950 shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Projector className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
