import React from 'react';
import { MoveEntry } from '../types/schema';

import { CATEGORIES as CONST_CATEGORIES, TYPES as CONST_TYPES } from '../constants';
export const CATEGORIES = CONST_CATEGORIES;
export const TYPES = CONST_TYPES;

interface MoveFormProps {
  move: MoveEntry;
  onChange: (updates: Partial<MoveEntry>) => void;
  onDelete: () => void;
}

export function MoveForm({ move, onChange, onDelete }: MoveFormProps) {
  const toggleCategory = (cat: string) => {
    if (move.categories.includes(cat)) {
      onChange({ categories: move.categories.filter(c => c !== cat) });
    } else {
      onChange({ categories: [...move.categories, cat] });
    }
  };

  return (
    <div className="border border-border p-3 rounded-md mb-2 bg-bg-primary">
      <div className="flex gap-2 mb-2 items-center">
        <select value={move.slot} onChange={e => onChange({ slot: e.target.value })} className="bg-bg-secondary p-1 rounded text-sm w-20 border border-border">
          {Array.from({length: 10}).map((_, i) => <option key={i} value={`M${i+1}`}>M{i+1}</option>)}
          <option value="P">P</option>
        </select>
        <input placeholder="Move Name" value={move.name} onChange={e => onChange({ name: e.target.value })} className="flex-1 bg-bg-secondary p-1 rounded text-sm border border-border" />
        <input placeholder="Cooldown (e.g. 10s)" value={move.cooldown} onChange={e => onChange({ cooldown: e.target.value })} className="w-24 bg-bg-secondary p-1 rounded text-sm border border-border" />
        <input type="number" placeholder="Level" value={move.level} onChange={e => onChange({ level: parseInt(e.target.value)||0 })} className="w-16 bg-bg-secondary p-1 rounded text-sm border border-border" />
        <select value={move.type} onChange={e => onChange({ type: e.target.value })} className="bg-bg-secondary p-1 rounded text-sm w-24 border border-border">
          <option value="">Type</option>
          {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <button onClick={onDelete} className="text-red-400 px-2 font-bold hover:text-red-300">X</button>
      </div>
      <div className="flex flex-wrap gap-1">
        {CATEGORIES.map(cat => (
          <button 
            key={cat} 
            onClick={() => toggleCategory(cat)}
            className={`text-xs px-2 py-1 rounded transition-colors ${move.categories.includes(cat) ? 'bg-accent-primary text-white' : 'bg-bg-secondary border border-border text-text-muted hover:bg-bg-overlay'}`}
          >
            {cat}
          </button>
        ))}
        {move.mode === 'PvE' && (
          <label className="text-xs flex items-center gap-1 ml-4 cursor-pointer text-text-secondary hover:text-white">
            <input type="checkbox" checked={!!move.isBold} onChange={e => onChange({ isBold: e.target.checked })} />
            Bold (Dano Alterado)
          </label>
        )}
      </div>
    </div>
  );
}
