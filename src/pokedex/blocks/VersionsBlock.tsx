import React from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { Plus, X } from 'lucide-react';

export function VersionsBlock() {
  const { schema, addVersion, updateVersion, removeVersion } = usePokedexStore();

  const handleAdd = () => {
    addVersion({
      id: Date.now().toString(),
      pokemon: ''
    });
  };

  return (
    <div id="block-versions" className="bg-[#121216]/90 border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col gap-4 animate-fade-in">
      <div className="flex justify-between items-center pb-3 border-b border-white/[0.06]">
        <h3 className="text-xs font-bold text-accent-primary uppercase tracking-wider flex items-center gap-1.5 font-outfit">
          <span>👥</span> Outras Versões (Shiny, Mega, etc.)
        </h3>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-accent-primary/10 hover:bg-accent-primary/25 border border-accent-primary/25 hover:border-accent-primary/50 text-accent-primary rounded-xl text-xs font-extrabold transition shadow-sm"
        >
          <Plus size={13} />
          Adicionar Versão
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {schema.versions.map((ver, idx) => {
          const safeName = ver.pokemon.replace(/ /g, '_');
          return (
            <div key={ver.id} className="relative bg-black/35 border border-white/[0.06] p-4 rounded-xl hover:border-accent-primary/20 transition flex items-center gap-4 group">
              {/* Fallback visual avatar */}
              <div className="w-12 h-12 bg-black/30 border border-white/[0.05] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                {ver.pokemon ? (
                  <img
                    src={`https://wiki.pokexgames.com/index.php?title=Special:FilePath/000-${safeName}.png`}
                    alt=""
                    className="w-10 h-10 object-contain image-rendering-pixelated"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://img.pokemondb.net/sprites/black-white/normal/${ver.pokemon.toLowerCase().replace(/ /g, '-')}.png`;
                    }}
                  />
                ) : (
                  <span className="text-xs">❓</span>
                )}
              </div>

              {/* Form fields */}
              <div className="flex-1 min-w-0">
                <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">Nome do Pokémon</label>
                <input
                  type="text"
                  value={ver.pokemon}
                  placeholder="Ex: Mega Venusaur..."
                  onChange={e => updateVersion(ver.id, { pokemon: e.target.value })}
                  className="w-full bg-black/25 hover:bg-black/40 focus:bg-black/55 p-2 rounded-lg text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
                />
              </div>

              {/* Delete button */}
              <button
                onClick={() => removeVersion(ver.id)}
                className="p-1.5 hover:bg-white/[0.06] rounded-lg text-text-muted hover:text-red-400 opacity-0 group-hover:opacity-100 transition absolute top-2 right-2"
              >
                <X size={14} />
              </button>
            </div>
          );
        })}

        {schema.versions.length === 0 && (
          <div className="col-span-full text-center py-6 text-xs text-text-muted italic border border-dashed border-white/[0.06] rounded-xl bg-black/10">
            Nenhuma outra versão associada cadastrada.
          </div>
        )}
      </div>
    </div>
  );
}
