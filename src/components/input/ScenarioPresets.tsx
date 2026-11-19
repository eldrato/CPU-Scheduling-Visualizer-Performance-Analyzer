import React from 'react';
import { PRESET_SCENARIOS } from '../../data/presets';
import { Scenario } from '../../types/scenario';
import { BookOpen, ChevronDown } from 'lucide-react';

interface Props {
  selectedScenarioId?: string;
  onSelectScenario: (scenario: Scenario) => void;
}

export const ScenarioPresets: React.FC<Props> = ({
  selectedScenarioId,
  onSelectScenario,
}) => {
  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-2">
        <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Textbook & Educational Scenarios
        </span>
      </div>

      <div className="relative">
        <select
          value={selectedScenarioId || ''}
          onChange={(e) => {
            const found = PRESET_SCENARIOS.find((s) => s.id === e.target.value);
            if (found) onSelectScenario(found);
          }}
          className="w-full appearance-none px-3.5 py-2.5 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-800 dark:text-slate-100 shadow-sm focus:ring-2 focus:ring-blue-500 outline-none pr-10 cursor-pointer font-medium"
        >
          <option value="" disabled>
            -- Select a benchmark scenario --
          </option>
          {PRESET_SCENARIOS.map((sc) => (
            <option key={sc.id} value={sc.id}>
              [{sc.category}] {sc.name} ({sc.processes.length} procs)
            </option>
          ))}
        </select>
        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
      </div>

      {selectedScenarioId && (
        <div className="mt-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 leading-relaxed">
          {PRESET_SCENARIOS.find((s) => s.id === selectedScenarioId)?.description}
        </div>
      )}
    </div>
  );
};
