import React from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { Plus, ArrowRight, X } from 'lucide-react';

export function EvolutionsBlock() {
  const { schema, addEvolution, updateEvolution, removeEvolution } = usePokedexStore();

  const handleAdd = () => {
    addEvolution({
      id: Date.now().toString(),
      pokemon: '',
      requirement: 'Level 30'
    });
  };

  return (
    <div id="block-evolutions" className="bg-[#121216]/90 border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
        <h3 className="text-xs font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <span>🧬</span> Linha Evolutiva
        </h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary/10 hover:bg-accent-primary/25 border border-accent-primary/25 hover:border-accent-primary/50 text-accent-primary rounded-xl text-xs font-extrabold transition shadow-sm"
        >
          <Plus size={13} />
          Adicionar Evolução
        </button>
      </div>

      {/* Visual Sequence Grid */}
      <div className="flex flex-col gap-4">
        {schema.evolutions.map((evo, idx) => {
          const isLast = idx === schema.evolutions.length - 1;
          return (
            <div key={evo.id} className="flex flex-col md:flex-row md:items-center gap-4 bg-black/35 border border-white/[0.06] p-4 rounded-xl relative hover:border-accent-primary/20 transition group">
              {/* Index Number */}
              <div className="absolute top-2 left-2 text-[9px] font-extrabold text-text-muted bg-[#121216] w-5 h-5 rounded-full flex items-center justify-center border border-white/[0.06]">
                {idx + 1}
              </div>

              {/* Form Input fields */}
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 pt-3 md:pt-0">
                <div>
                  <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Pokémon</label>
                  <input
                    type="text"
                    value={evo.pokemon}
                    placeholder="Ex: Ivysaur..."
                    onChange={e => updateEvolution(evo.id, { pokemon: e.target.value })}
                    className="w-full bg-black/25 hover:bg-black/40 focus:bg-black/55 p-2 rounded-lg text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Requisito</label>
                  <input
                    type="text"
                    value={evo.requirement}
                    placeholder="Ex: Level 40 ou Pedra..."
                    onChange={e => updateEvolution(evo.id, { requirement: e.target.value })}
                    className="w-full bg-black/25 hover:bg-black/40 focus:bg-black/55 p-2 rounded-lg text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
                  />
                </div>
              </div>

              {/* Delete button */}
              <button 
                onClick={() => removeEvolution(evo.id)} 
                className="p-1.5 hover:bg-white/[0.06] rounded-lg text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition self-end md:self-center"
              >
                <X size={15} />
              </button>

              {/* Interconnecting flow arrow */}
              {!isLast && (
                <div className="hidden md:flex absolute -bottom-5 left-1/2 -translate-x-1/2 z-10 bg-[#121216] p-1 rounded-full border border-white/[0.06] text-accent-primary shadow-lg">
                  <ArrowRight size={12} className="rotate-90" />
                </div>
              )}
            </div>
          );
        })}

        {schema.evolutions.length === 0 && (
          <div className="text-center py-6 text-xs text-text-muted italic border border-dashed border-white/[0.06] rounded-xl bg-black/10">
            Nenhuma evolução configurada para este Pokémon.
          </div>
        )}
      </div>
    </div>
  );
}
