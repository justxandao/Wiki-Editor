import React from 'react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';

export function EffectivenessFlow() {
  const { schema, updateEffectiveness } = usePokedexStore();
  const { focusMode } = usePokedexUIStore();

  const EFFECTIVENESS_ROWS = [
    { field: 'veryEffective', label: 'Very Effective (2x)', colorClass: 'text-emerald-400', borderClass: 'focus:border-emerald-500/50' },
    { field: 'effective', label: 'Effective (1.75x)', colorClass: 'text-cyan-400', borderClass: 'focus:border-cyan-500/50' },
    { field: 'normal', label: 'Normal (1x)', colorClass: 'text-zinc-400', borderClass: 'focus:border-zinc-500/50' },
    { field: 'ineffective', label: 'Ineffective (0.75x)', colorClass: 'text-amber-400', borderClass: 'focus:border-amber-500/50' },
    { field: 'veryIneffective', label: 'Very Ineffective (0.5x)', colorClass: 'text-red-400', borderClass: 'focus:border-red-500/50' },
    { field: 'nulo', label: 'Null (0x / Immune)', colorClass: 'text-purple-400', borderClass: 'focus:border-purple-500/50' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`max-w-3xl mx-auto space-y-8 pb-20 ${focusMode ? 'opacity-50 blur-sm pointer-events-none' : ''}`}
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-zinc-100 flex items-center gap-2">
          Matchups & Weaknesses
        </h2>
        <p className="text-sm text-zinc-500">Manual overrides for type effectiveness calculation. Usually populated automatically.</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3">
        <Info className="text-blue-400 mt-0.5 flex-shrink-0" size={16} />
        <p className="text-xs text-blue-200 leading-relaxed">
          The effectiveness values are automatically calculated when you set the Pokemon's Elements in the Overview tab. You only need to edit these fields if this specific Pokemon has special immunities or abilities that alter its natural typing weaknesses.
        </p>
      </div>

      <div className="space-y-4">
        {EFFECTIVENESS_ROWS.map(row => {
          const val = schema.effectiveness[row.field as keyof typeof schema.effectiveness];
          return (
            <div key={row.field} className="bg-zinc-900/40 p-5 rounded-2xl border border-white/5 shadow-sm transition-colors hover:bg-zinc-900/60 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-48 flex-shrink-0">
                <span className={`text-xs font-bold uppercase tracking-widest ${row.colorClass}`}>
                  {row.label}
                </span>
              </div>
              <input
                className={`flex-1 bg-zinc-950 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-zinc-100 outline-none transition-colors ${row.borderClass}`}
                value={val}
                onChange={e => updateEffectiveness(row.field as any, e.target.value)}
                placeholder="e.g. Grass and Bug."
              />
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}
