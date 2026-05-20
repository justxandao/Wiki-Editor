import React, { useState } from 'react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { calculateEffectiveness, resolveWikiImageUrl } from '../utils/helpers';
import { TIER_LEVELS, CLAN_MATERIA_MAP, ELEMENTS, MAP_ABILITIES_LIST } from '../utils/constants';
import pokemonMovesData from '../../data/pokemon-moves.json';
import { Search } from 'lucide-react';
import { motion } from 'framer-motion';

export function GeneralFlow() {
  const { schema, updateGeneralInfo, setEffectiveness, setMoves } = usePokedexStore();
  const { focusMode } = usePokedexUIStore();

  const [pokemonSearch, setPokemonSearch] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = pokemonSearch.trim() ? (pokemonMovesData as any[]).filter(p => p.name?.toLowerCase().includes(pokemonSearch.toLowerCase())).slice(0, 5) : [];

  const handleSelectPokemon = (p: any) => {
    updateGeneralInfo('name', p.name || '');
    updateGeneralInfo('number', p.number || '');
    updateGeneralInfo('level', p.level || '');
    updateGeneralInfo('element', p.element || '');
    updateGeneralInfo('abilities', p.abilities || '');
    updateGeneralInfo('boost', p.boost || '');
    updateGeneralInfo('materia', p.materia || '');
    
    if (p.moves) {
      setMoves(p.moves);
    }
    
    const detected = ELEMENTS.filter(el => new RegExp(`\\b${el}\\b`, 'i').test(p.element || ''));
    if (detected.length > 0) setEffectiveness(calculateEffectiveness(detected));
    setShowSuggestions(false);
  };

  const handleTierSelect = (tier: string) => {
    const level = TIER_LEVELS[tier] || '100';
    updateGeneralInfo('level', level);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`max-w-3xl mx-auto space-y-10 pb-20 ${focusMode ? 'opacity-50 blur-sm pointer-events-none transition-all' : 'transition-all'}`}
    >
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-zinc-100">Base Data Overview</h2>
        <p className="text-sm text-zinc-500">Configure the primary attributes and metadata for this Pokemon.</p>
      </div>

      <div className="space-y-6 bg-zinc-900/40 p-6 sm:p-8 rounded-2xl border border-white/5 shadow-sm">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 relative">
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">Species Name</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input 
                className="w-full bg-zinc-950 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
                value={schema.generalInfo.name}
                onChange={e => {
                  updateGeneralInfo('name', e.target.value);
                  setPokemonSearch(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                placeholder="e.g. Charizard"
              />
            </div>
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                {filteredSuggestions.map((p, i) => (
                  <button key={i} onClick={() => handleSelectPokemon(p)} className="w-full px-4 py-3 text-left hover:bg-white/5 border-b border-white/5 last:border-b-0 cursor-pointer">
                    <span className="text-sm font-semibold text-zinc-200">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">Pokedex Number</label>
            <input 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
              value={schema.generalInfo.number}
              onChange={e => updateGeneralInfo('number', e.target.value)}
              placeholder="e.g. 006"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="text-xs font-semibold text-zinc-400 block">Tier Category</label>
          <div className="flex flex-wrap gap-2">
            {(['T4', 'T3', 'T2', 'T1', 'Lendario']).map(tier => (
              <button
                key={tier}
                onClick={() => handleTierSelect(tier)}
                className="px-4 py-2 rounded-lg text-xs font-semibold bg-zinc-950 border border-white/10 hover:border-white/20 text-zinc-300 transition-colors cursor-pointer"
              >
                {tier}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">Elements / Typing</label>
            <input 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
              value={schema.generalInfo.element}
              onChange={e => updateGeneralInfo('element', e.target.value)}
              placeholder="e.g. Fire and Flying"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-zinc-400 mb-2 block">Base Level</label>
            <input 
              className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors"
              value={schema.generalInfo.level}
              onChange={e => updateGeneralInfo('level', e.target.value)}
              placeholder="e.g. 100"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-400 mb-2 block">Pokedex Entry Description</label>
          <textarea 
            className="w-full bg-zinc-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-100 outline-none focus:border-zinc-500 transition-colors h-32 resize-none custom-scrollbar"
            value={schema.generalInfo.description}
            onChange={e => updateGeneralInfo('description', e.target.value)}
            placeholder="Write the official Pokedex description..."
          />
        </div>

      </div>
    </motion.div>
  );
}
