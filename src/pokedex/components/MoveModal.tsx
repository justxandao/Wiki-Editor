import React, { useState, useEffect } from 'react';
import { MoveEntry } from '../types/schema';
import { CATEGORIES, TYPES } from '../constants';
import { MoveCard } from './MoveCard';
import { X, Sparkles, BookOpen } from 'lucide-react';
import movePresets from '../data/move-presets.json';

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (move: MoveEntry) => void;
  initialMove?: MoveEntry;
  mode: 'PvP' | 'PvE';
}

const DEFAULT_MOVE = (mode: 'PvP' | 'PvE'): MoveEntry => ({
  id: '',
  slot: 'M1',
  name: '',
  cooldown: '10s',
  level: 100,
  categories: ['Damage'],
  type: 'Normal',
  mode
} as any);

export function MoveModal({ isOpen, onClose, onSave, initialMove, mode }: MoveModalProps) {
  const [move, setMove] = useState<MoveEntry>(() => initialMove || DEFAULT_MOVE(mode));
  const [presetSearch, setPresetSearch] = useState('');

  useEffect(() => {
    if (initialMove) {
      setMove(initialMove);
    } else {
      setMove(DEFAULT_MOVE(mode));
    }
    setPresetSearch('');
  }, [initialMove, isOpen, mode]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!move.name.trim()) return;
    onSave({
      ...move,
      id: move.id || Date.now().toString()
    });
    onClose();
  };

  const toggleCategory = (cat: string) => {
    setMove(m => ({
      ...m,
      categories: m.categories.includes(cat)
        ? m.categories.filter(c => c !== cat)
        : [...m.categories, cat]
    }));
  };

  const handleSelectPreset = (preset: typeof movePresets[0]) => {
    setMove(m => ({
      ...m,
      name: preset.name,
      type: preset.type,
      cooldown: preset.cooldown,
      level: preset.level,
      categories: preset.categories
    }));
    setPresetSearch('');
  };

  const filteredPresets = presetSearch.trim()
    ? movePresets.filter(p => p.name.toLowerCase().includes(presetSearch.toLowerCase()))
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div className="bg-[#0F0F12] border border-white/[0.08] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh] text-text-primary animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/[0.08] flex justify-between items-center bg-[#141419]/90">
          <div>
            <h3 className="text-xs font-bold font-outfit uppercase tracking-wider text-accent-primary flex items-center gap-1.5">
              <Sparkles size={13} /> {initialMove ? 'Editar Movimento' : 'Novo Movimento'} ({mode})
            </h3>
            <span className="text-[10px] text-text-muted mt-0.5 block font-medium">Configure slots, tipos elementais e categorias</span>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/[0.06] rounded-xl text-text-muted hover:text-white transition duration-150">
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex gap-6 flex-col md:flex-row bg-[#0A0A0C]">
          {/* Inputs */}
          <div className="flex-1 flex flex-col gap-5">
            {/* Presets Autocomplete Bar */}
            <div className="relative bg-[#131317]/40 border border-white/[0.06] p-3 rounded-xl">
              <label className="block text-[9px] font-extrabold text-accent-primary uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <BookOpen size={11} /> 💡 Golpes Pré-setados (Autocompletar)
              </label>
              <input 
                type="text"
                placeholder="Busque ex: Water Ball, Razor Leaf..." 
                value={presetSearch} 
                onChange={e => setPresetSearch(e.target.value)}
                className="w-full bg-black/40 hover:bg-black/60 focus:bg-black/80 p-2 rounded-lg text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition placeholder-text-muted/60 text-white font-medium"
              />
              {filteredPresets.length > 0 && (
                <div className="absolute top-full left-3 right-3 mt-1 bg-[#16161C] border border-white/[0.08] rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto p-1 backdrop-blur-md">
                  {filteredPresets.map(preset => (
                    <div 
                      key={preset.name} 
                      onClick={() => handleSelectPreset(preset)} 
                      className="flex items-center justify-between p-2 hover:bg-white/[0.06] rounded-lg cursor-pointer text-xs font-bold transition group"
                    >
                      <span className="text-white group-hover:text-accent-primary transition">{preset.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] text-text-muted bg-black/40 px-2 py-0.5 rounded-full border border-white/[0.04]">{preset.type}</span>
                        <span className="text-[9px] text-text-muted">{preset.cooldown}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Nome do Movimento</label>
              <input 
                type="text"
                placeholder="Ex: Razor Leaf, Play Rough..." 
                value={move.name} 
                onChange={e => setMove(m => ({ ...m, name: e.target.value }))}
                className="w-full bg-black/30 hover:bg-black/45 focus:bg-black/60 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white placeholder-text-muted/50"
              />
            </div>

            {/* Slot (Segmented control) */}
            <div>
              <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Slot</label>
              <div className="flex flex-wrap gap-1 bg-black/35 p-1 rounded-xl border border-white/[0.05]">
                {Array.from({ length: 10 }).map((_, i) => {
                  const s = `M${i + 1}`;
                  const active = move.slot === s;
                  return (
                    <button
                      key={s}
                      onClick={() => setMove(m => ({ ...m, slot: s }))}
                      className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all ${active ? 'bg-accent-primary text-white shadow-lg shadow-accent-primary/15' : 'text-text-muted hover:text-white'}`}
                    >
                      {s}
                    </button>
                  );
                })}
                <button
                  onClick={() => setMove(m => ({ ...m, slot: 'P' }))}
                  className={`text-[10px] font-extrabold px-2.5 py-1.5 rounded-lg transition-all ${move.slot === 'P' ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/15' : 'text-text-muted hover:text-white'}`}
                >
                  P
                </button>
              </div>
            </div>

            {/* Type & Cooldown & Level */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Elemento</label>
                <select 
                  value={move.type} 
                  onChange={e => setMove(m => ({ ...m, type: e.target.value }))}
                  className="w-full bg-black/30 p-2 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-semibold text-white cursor-pointer"
                >
                  {TYPES.map(t => <option key={t} value={t} className="bg-[#0F0F12] text-white font-semibold">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Cooldown</label>
                <input 
                  type="text" 
                  value={move.cooldown} 
                  onChange={e => setMove(m => ({ ...m, cooldown: e.target.value }))}
                  className="w-full bg-black/30 p-2 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-semibold text-white"
                />
              </div>
              <div>
                <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Level Mín.</label>
                <input 
                  type="number" 
                  value={move.level} 
                  onChange={e => setMove(m => ({ ...m, level: parseInt(e.target.value) || 0 }))}
                  className="w-full bg-black/30 p-2 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-semibold text-white"
                />
              </div>
            </div>

            {/* Categories */}
            <div>
              <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Categorias</label>
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => {
                  const active = move.categories.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className={`text-[9px] font-extrabold px-2.5 py-1.5 rounded-full border transition-all ${active ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/30 shadow-md shadow-accent-primary/5' : 'bg-black/30 text-text-muted border-white/[0.05] hover:text-white'}`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>
            </div>

            {mode === 'PvE' && (
              <label className="text-[11px] flex items-center gap-2 cursor-pointer text-text-secondary hover:text-white select-none mt-2 font-bold transition">
                <input 
                  type="checkbox" 
                  checked={!!move.isBold} 
                  onChange={e => setMove(m => ({ ...m, isBold: e.target.checked }))}
                  className="rounded border-white/[0.08] bg-black/30 text-accent-primary focus:ring-accent-primary/50"
                />
                Marcar como Dano Negrito (Dano Alterado PvE)
              </label>
            )}
          </div>

          {/* Real Card Preview */}
          <div className="w-full md:w-64 flex flex-col justify-center items-center p-4 border-t md:border-t-0 md:border-l border-white/[0.06] bg-[#121216]/20 rounded-2xl">
            <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-4">Pré-visualização do Card</span>
            <div className="w-full max-w-[220px]">
              <MoveCard 
                move={move} 
                index={0} 
                total={1} 
                onEdit={() => {}} 
                onDelete={() => {}} 
                onMoveUp={() => {}} 
                onMoveDown={() => {}} 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/[0.08] flex justify-end gap-2 bg-[#141419]/90">
          <button 
            onClick={onClose} 
            className="px-4 py-2 border border-white/[0.06] text-text-secondary hover:text-white rounded-xl text-xs font-bold hover:bg-white/[0.05] transition duration-150"
          >
            Cancelar
          </button>
          <button 
            onClick={handleSave} 
            disabled={!move.name.trim()}
            className="px-4 py-2 bg-gradient-to-r from-accent-primary to-orange-500 text-white rounded-xl text-xs font-black hover:opacity-95 shadow-xl shadow-accent-primary/10 transition duration-150 disabled:opacity-30 disabled:shadow-none"
          >
            Salvar Alterações
          </button>
        </div>
      </div>
    </div>
  );
}
