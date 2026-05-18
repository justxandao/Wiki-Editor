import React, { useState } from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { TYPES } from '../constants';
import { Plus, X } from 'lucide-react';

type EffectivenessCategory = 'veryEffective' | 'effective' | 'normal' | 'ineffective' | 'veryIneffective' | 'immune';

const LABELS: Record<EffectivenessCategory, { label: string; color: string; desc: string }> = {
  veryEffective: { label: 'Muito Efetivo (x2)', color: 'text-green-400 bg-green-500/10 border-green-500/20', desc: 'Dano recebido massivo' },
  effective: { label: 'Efetivo (x1.25)', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', desc: 'Dano aumentado' },
  normal: { label: 'Dano Normal (x1)', color: 'text-neutral-400 bg-neutral-500/10 border-neutral-500/20', desc: 'Sem modificador' },
  ineffective: { label: 'Inefetivo (x0.75)', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', desc: 'Resistência fraca' },
  veryIneffective: { label: 'Muito Inefetivo (x0.5)', color: 'text-red-400 bg-red-500/10 border-red-500/20', desc: 'Resistência massiva' },
  immune: { label: 'Imune (x0)', color: 'text-purple-400 bg-purple-500/10 border-purple-500/20', desc: 'Sem dano recebido' }
};

export function EffectivenessBlock() {
  const { schema, updateEffectiveness } = usePokedexStore();
  const [activeCategory, setActiveCategory] = useState<EffectivenessCategory>('veryEffective');

  const addType = (type: string) => {
    const current = schema.effectiveness[activeCategory];
    if (current.includes(type)) return;

    // Remove from other categories first
    const updated = { ...schema.effectiveness };
    (Object.keys(updated) as EffectivenessCategory[]).forEach(cat => {
      updated[cat] = updated[cat].filter(t => t !== type);
    });

    updated[activeCategory] = [...updated[activeCategory], type];
    updateEffectiveness(updated);
  };

  const removeType = (category: EffectivenessCategory, type: string) => {
    const current = schema.effectiveness[category];
    updateEffectiveness({
      [category]: current.filter(t => t !== type)
    });
  };

  return (
    <div id="block-effectiveness" className="bg-[#121216]/90 border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-5 animate-fade-in">
      <div className="border-b border-white/[0.06] pb-3">
        <h3 className="text-xs font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <span>🛡️</span> Efetividades Contra Elementos
        </h3>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Type Selector Library */}
        <div className="w-full md:w-64 bg-black/35 border border-white/[0.06] p-4 rounded-xl flex flex-col gap-3">
          <div>
            <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest block mb-2">
              Modificador Ativo
            </span>
            <select
              value={activeCategory}
              onChange={e => setActiveCategory(e.target.value as EffectivenessCategory)}
              className="w-full bg-black/40 p-2 rounded-lg text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-bold text-white cursor-pointer"
            >
              {(Object.entries(LABELS) as [EffectivenessCategory, typeof LABELS['veryEffective']][]).map(([key, val]) => (
                <option key={key} value={key} className="bg-[#121216]">{val.label}</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest block mb-2">
              Clique para Adicionar
            </span>
            <div className="grid grid-cols-2 gap-1.5 max-h-[180px] overflow-y-auto pr-1">
              {TYPES.map(t => (
                <button
                  key={t}
                  onClick={() => addType(t)}
                  className="text-[10px] font-bold py-1.5 rounded-lg border border-white/[0.05] hover:border-accent-primary/50 hover:text-white bg-black/25 hover:bg-black/45 transition-all text-text-secondary"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Effectiveness Board */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(Object.entries(LABELS) as [EffectivenessCategory, typeof LABELS['veryEffective']][]).map(([key, val]) => {
            const list = schema.effectiveness[key] || [];
            return (
              <div key={key} className="bg-black/35 border border-white/[0.06] p-3.5 rounded-xl flex flex-col gap-2 relative hover:border-white/[0.1] transition duration-150">
                <div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded border ${val.color} uppercase tracking-widest inline-block`}>
                    {val.label}
                  </span>
                  <span className="block text-[9px] text-text-muted mt-0.5 font-medium">{val.desc}</span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {list.map(type => (
                    <span 
                      key={type} 
                      className="text-[10px] font-bold bg-black/40 text-white pl-2.5 pr-1 py-1 rounded-full border border-white/[0.05] flex items-center gap-1.5 group/chip shadow-sm"
                    >
                      {type}
                      <button 
                        onClick={() => removeType(key, type)} 
                        className="p-0.5 hover:bg-white/[0.08] rounded-full text-text-muted hover:text-red-400 group-hover/chip:text-white transition"
                      >
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {list.length === 0 && (
                    <span className="text-[10px] text-text-muted italic py-1">Nenhum tipo selecionado</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
