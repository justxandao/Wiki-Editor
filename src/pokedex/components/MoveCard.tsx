import React from 'react';
import { MoveEntry } from '../types/schema';
import { ChevronUp, ChevronDown, Trash2, Edit } from 'lucide-react';

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Normal': { bg: 'bg-neutral-100 dark:bg-neutral-800', text: 'text-neutral-700 dark:text-neutral-300', border: 'border-neutral-200 dark:border-neutral-700' },
  'Fire': { bg: 'bg-red-500/10 dark:bg-red-500/20', text: 'text-red-500', border: 'border-red-500/20 dark:border-red-500/30' },
  'Water': { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-500', border: 'border-blue-500/20 dark:border-blue-500/30' },
  'Grass': { bg: 'bg-green-500/10 dark:bg-green-500/20', text: 'text-green-500', border: 'border-green-500/20 dark:border-green-500/30' },
  'Electric': { bg: 'bg-yellow-500/10 dark:bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/20 dark:border-yellow-500/30' },
  'Ice': { bg: 'bg-cyan-500/10 dark:bg-cyan-500/20', text: 'text-cyan-500', border: 'border-cyan-500/20 dark:border-cyan-500/30' },
  'Fighting': { bg: 'bg-orange-600/10 dark:bg-orange-600/20', text: 'text-orange-500', border: 'border-orange-600/20 dark:border-orange-600/30' },
  'Poison': { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-500', border: 'border-purple-500/20 dark:border-purple-500/30' },
  'Ground': { bg: 'bg-amber-600/10 dark:bg-amber-600/20', text: 'text-amber-500', border: 'border-amber-600/20 dark:border-amber-600/30' },
  'Flying': { bg: 'bg-indigo-400/10 dark:bg-indigo-400/20', text: 'text-indigo-400', border: 'border-indigo-400/20 dark:border-indigo-400/30' },
  'Psychic': { bg: 'bg-pink-500/10 dark:bg-pink-500/20', text: 'text-pink-500', border: 'border-pink-500/20 dark:border-pink-500/30' },
  'Bug': { bg: 'bg-lime-500/10 dark:bg-lime-500/20', text: 'text-lime-500', border: 'border-lime-500/20 dark:border-lime-500/30' },
  'Rock': { bg: 'bg-yellow-600/10 dark:bg-yellow-600/20', text: 'text-yellow-600 dark:text-yellow-500', border: 'border-yellow-600/20 dark:border-yellow-600/30' },
  'Ghost': { bg: 'bg-indigo-900/10 dark:bg-indigo-900/20', text: 'text-indigo-400', border: 'border-indigo-900/20 dark:border-indigo-900/30' },
  'Dragon': { bg: 'bg-violet-600/10 dark:bg-violet-600/20', text: 'text-violet-500', border: 'border-violet-600/20 dark:border-violet-600/30' },
  'Dark': { bg: 'bg-neutral-800/50', text: 'text-neutral-400', border: 'border-neutral-700' },
  'Steel': { bg: 'bg-slate-400/10 dark:bg-slate-400/20', text: 'text-slate-400', border: 'border-slate-400/20 dark:border-slate-400/30' },
  'Fairy': { bg: 'bg-rose-400/10 dark:bg-rose-400/20', text: 'text-rose-400', border: 'border-rose-400/20 dark:border-rose-400/30' }
};

interface MoveCardProps {
  move: MoveEntry;
  index: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function MoveCard({ move, index, total, onEdit, onDelete, onMoveUp, onMoveDown }: MoveCardProps) {
  const typeStyle = TYPE_COLORS[move.type] || TYPE_COLORS['Normal'];
  const isP = move.slot === 'P';

  return (
    <div className="group relative bg-bg-secondary border border-border/80 hover:border-accent-primary/50 p-4 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden min-h-[140px]">
      {/* Background glass effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      
      {/* Top row: slot & actions */}
      <div className="flex items-center justify-between mb-2">
        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${isP ? 'bg-purple-500/10 text-purple-400 border-purple-500/25' : 'bg-accent-primary/10 text-accent-primary border-accent-primary/25'}`}>
          {move.slot}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button onClick={onMoveUp} disabled={index === 0} className="p-1 hover:bg-bg-overlay rounded text-text-muted hover:text-white disabled:opacity-20 transition">
            <ChevronUp size={14} />
          </button>
          <button onClick={onMoveDown} disabled={index === total - 1} className="p-1 hover:bg-bg-overlay rounded text-text-muted hover:text-white disabled:opacity-20 transition">
            <ChevronDown size={14} />
          </button>
          <button onClick={onEdit} className="p-1 hover:bg-bg-overlay rounded text-text-muted hover:text-white transition">
            <Edit size={14} />
          </button>
          <button onClick={onDelete} className="p-1 hover:bg-bg-overlay rounded text-red-400 hover:text-red-300 transition">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Main Info */}
      <div className="mb-3">
        <h4 className={`text-sm font-bold truncate ${move.isBold ? 'text-white font-black underline decoration-accent-primary/30 decoration-2 underline-offset-4' : 'text-text-secondary group-hover:text-white transition-colors'}`}>
          {move.name || 'Sem nome'}
        </h4>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
            {move.type || 'Normal'}
          </span>
          <span className="text-[10px] text-text-muted font-medium">
            Lvl {move.level}
          </span>
          {move.cooldown && (
            <span className="text-[10px] text-text-muted font-medium">
              • CD {move.cooldown}
            </span>
          )}
        </div>
      </div>

      {/* Categories / Tags */}
      <div className="flex flex-wrap gap-1 mt-auto">
        {move.categories.map(cat => (
          <span key={cat} className="text-[9px] font-semibold bg-bg-overlay text-text-secondary px-1.5 py-0.5 rounded border border-border/50">
            {cat}
          </span>
        ))}
        {move.categories.length === 0 && (
          <span className="text-[9px] text-text-muted italic">Sem categorias</span>
        )}
      </div>
    </div>
  );
}
