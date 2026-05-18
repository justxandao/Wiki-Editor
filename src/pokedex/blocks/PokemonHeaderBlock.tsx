import React, { useState } from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { searchPokemon, getPokemonSpriteUrl } from '../../pokemon/pokemon-service';
import { Sparkles, Zap, Search } from 'lucide-react';

export function PokemonHeaderBlock() {
  const { schema, updateSchema, updateGeneral } = usePokedexStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = (q: string) => {
    setQuery(q);
    if (q.length > 1) {
      setResults(searchPokemon(q, 5));
    } else {
      setResults([]);
    }
  };

  const handleSelect = (entry: any) => {
    updateSchema({
      pokemon: entry.name,
      dex: entry.dex || 0,
      image: entry.image,
    });
    if (entry.types) {
      updateGeneral({ types: entry.types });
    }
    setQuery('');
    setResults([]);
  };

  return (
    <div id="block-general" className="relative overflow-hidden bg-[#121216]/90 border border-white/[0.08] rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row gap-6 items-start md:items-center animate-fade-in">
      {/* Visual Accent glow */}
      <div className="absolute -top-24 -left-24 w-48 h-48 bg-accent-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Visual Sprite / Pokemon Frame */}
      <div className="relative w-24 h-24 bg-black/40 border border-white/[0.06] rounded-2xl flex items-center justify-center flex-shrink-0 group shadow-inner">
        {schema.pokemon ? (
          <img 
            src={`https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(schema.image || `${schema.pokemon}.png`)}`} 
            alt={schema.pokemon} 
            className="w-20 h-20 object-contain image-rendering-pixelated drop-shadow-md group-hover:scale-110 transition duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://img.pokemondb.net/sprites/black-white/anim/normal/${schema.pokemon.toLowerCase().replace(/ /g, '-')}.gif`;
            }}
          />
        ) : (
          <Zap size={24} className="text-text-muted animate-pulse" />
        )}
      </div>

      {/* Main Form Fields */}
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 gap-4 z-10">
        {/* Search */}
        <div className="relative md:col-span-2">
          <label className="block text-[9px] font-extrabold text-accent-primary uppercase tracking-widest mb-1.5 flex items-center gap-1">
            <Search size={10} /> Buscar Pokémon (Preenchimento Automático)
          </label>
          <input
            type="text"
            value={query}
            onChange={e => handleSearch(e.target.value)}
            placeholder="Ex: Venusaur, Charizard, Blastoise..."
            className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white placeholder-text-muted/50 shadow-inner"
          />
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#16161C] border border-white/[0.08] rounded-xl shadow-2xl z-20 max-h-48 overflow-y-auto p-1 backdrop-blur-md">
              {results.map(r => (
                <div 
                  key={r.key} 
                  onClick={() => handleSelect(r.entry)} 
                  className="flex items-center gap-2.5 p-2 hover:bg-white/[0.05] rounded-lg cursor-pointer text-xs font-bold transition text-white"
                >
                  <img src={getPokemonSpriteUrl(r.entry)} alt="" className="w-7 h-7 object-contain" />
                  <span>{r.entry.name}</span>
                  <span className="text-[9px] text-text-muted font-extrabold ml-auto bg-black/40 px-2 py-0.5 rounded-md border border-white/[0.04]">#{r.entry.dex}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pokemon Name Input */}
        <div>
          <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">
            Nome do Pokémon
          </label>
          <input
            type="text"
            value={schema.pokemon}
            onChange={e => updateSchema({ pokemon: e.target.value })}
            className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
          />
        </div>

        {/* Row 2: Dex Number, Level, Elements */}
        <div className="grid grid-cols-3 gap-3 md:col-span-3">
          <div>
            <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">
              Número Dex
            </label>
            <input
              type="number"
              value={schema.dex}
              onChange={e => updateSchema({ dex: parseInt(e.target.value) || 0 })}
              className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">
              Base Level
            </label>
            <input
              type="number"
              value={schema.general.level}
              onChange={e => updateGeneral({ level: parseInt(e.target.value) || 0 })}
              className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">
              Tipos (ex: Fire, Rock)
            </label>
            <input
              type="text"
              value={schema.general.types.join(', ')}
              onChange={e => updateGeneral({ types: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}
              className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
            />
          </div>
        </div>

        {/* Row 3: Abilities, Boost, Materia */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:col-span-3">
          <div>
            <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">
              Habilidades (ex: dig, ride)
            </label>
            <input
              type="text"
              value={schema.general.abilities.join(', ')}
              onChange={e => updateGeneral({ abilities: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}
              className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">
              Pedra de Boost (ex: Crystal Stone)
            </label>
            <input
              type="text"
              value={schema.general.boost.join(', ')}
              onChange={e => updateGeneral({ boost: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}
              className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
            />
          </div>

          <div>
            <label className="block text-[9px] font-extrabold text-text-muted uppercase tracking-widest mb-1.5">
              Matéria / Clã recomendado
            </label>
            <input
              type="text"
              value={schema.general.materia.join(', ')}
              onChange={e => updateGeneral({ materia: e.target.value.split(',').map(s=>s.trim()).filter(Boolean) })}
              className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-2.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition font-medium text-white shadow-inner"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
