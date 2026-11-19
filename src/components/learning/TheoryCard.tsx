import React, { useState } from 'react';
import { ALGORITHM_THEORY } from '../../data/theoryData';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface Props {
  selectedAlgorithmId?: string;
}

export const TheoryCard: React.FC<Props> = ({ selectedAlgorithmId = 'fcfs' }) => {
  const [activeAlgo, setActiveAlgo] = useState<string>(
    selectedAlgorithmId === 'compare' ? 'fcfs' : selectedAlgorithmId
  );
  const [openViva, setOpenViva] = useState<number | null>(0);

  const theory = ALGORITHM_THEORY[activeAlgo] || ALGORITHM_THEORY['fcfs'];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden space-y-5 p-6">
      {/* Algorithm Tabs Header */}
      <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-base">
            Operating Systems Algorithm Theory & Viva Notes
          </h3>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {Object.values(ALGORITHM_THEORY).map((algo) => (
            <button
              key={algo.id}
              onClick={() => setActiveAlgo(algo.id)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                activeAlgo === algo.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {algo.name.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Main Algorithm Card Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            {theory.name}
          </h2>
          <span
            className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider ${
              theory.classification === 'Preemptive'
                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                : theory.classification === 'Non-preemptive'
                ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            {theory.classification}
          </span>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Criterion: <strong>{theory.criterion}</strong>
          </span>
        </div>

        <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
          {theory.definition}
        </p>
      </div>

      {/* Advantages & Disadvantages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Advantages */}
        <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wider mb-2.5">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Advantages</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-snug">
            {theory.advantages.map((adv, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-emerald-500 font-bold">&bull;</span>
                <span>{adv}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Disadvantages */}
        <div className="bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/80 dark:border-rose-900/40 rounded-2xl p-4">
          <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-300 font-semibold text-xs uppercase tracking-wider mb-2.5">
            <XCircle className="w-4 h-4" />
            <span>Disadvantages & Trade-offs</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-700 dark:text-slate-300 leading-snug">
            {theory.disadvantages.map((dis, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">&bull;</span>
                <span>{dis}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Convoy Effect & Starvation Callout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
          <AlertTriangle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              theory.convoyEffect ? 'text-amber-500' : 'text-slate-400'
            }`}
          />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Convoy Effect Risk:{' '}
              <span className={theory.convoyEffect ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600'}>
                {theory.convoyEffect ? 'Vulnerable' : 'Immune'}
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {theory.convoyEffect
                ? 'Monopolization by heavy burst processes blocks smaller jobs.'
                : 'Jobs with shorter bursts or time slices prevent indefinite monopolization.'}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-start gap-3">
          <AlertTriangle
            className={`w-5 h-5 shrink-0 mt-0.5 ${
              theory.starvationRisk ? 'text-rose-500' : 'text-slate-400'
            }`}
          />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Starvation Risk:{' '}
              <span className={theory.starvationRisk ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'}>
                {theory.starvationRisk ? 'High Risk' : 'Starvation-Free'}
              </span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Mitigation: <strong>{theory.mitigation}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Frequently Asked Viva Questions */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">
          <HelpCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span>Examiner Viva Questions & Concept Checkers</span>
        </div>

        <div className="space-y-2">
          {theory.vivaQuestions.map((vq, idx) => {
            const isOpen = openViva === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenViva(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between p-3.5 text-left bg-slate-50/70 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200"
                >
                  <span>Q: {vq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>
                {isOpen && (
                  <div className="p-3.5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 leading-relaxed animate-in fade-in">
                    <strong className="text-blue-600 dark:text-blue-400">Answer:</strong> {vq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
