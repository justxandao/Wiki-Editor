import React, { useState } from 'react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { resolveWikiImageUrl } from '../utils/helpers';
import { ELEMENT_COLORS, FORM_ATTRIBUTES, ELEMENTS } from '../utils/constants';
import movePresetsData from '../../data/move-presets.json';
import { Plus, ChevronDown, ChevronUp, Trash2, Zap, Search } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function MovesFlow() {
  const { schema, addMove, updateMove, removeMove, toggleMoveIcon } = usePokedexStore();
  const { focusMode, setFocusedItem, focusedItemIndex } = usePokedexUIStore();

  const [expandedMoveIndex, setExpandedMoveIndex] = useState<number | null>(null);
  const [moveSearch, setMoveSearch] = useState('');
  const [showMoveSuggestions, setShowMoveSuggestions] = useState(false);

  const toggleMoveExpansion = (index: number) => {
    if (expandedMoveIndex === index) {
      setExpandedMoveIndex(null);
      setFocusedItem(null);
      setShowMoveSuggestions(false);
    } else {
      setExpandedMoveIndex(index);
      setFocusedItem(index);
      const move = schema.moves[index];
      setMoveSearch(move ? move.name : '');
      setShowMoveSuggestions(false);
    }
  };

  const handleApplyPreset = (idx: number, preset: any) => {
    updateMove(idx, 'name', preset.name);
    updateMove(idx, 'element', preset.type === 'Normal' ? 'Normal1' : preset.type);
    updateMove(idx, 'cooldownPvE', preset.cooldown);
    updateMove(idx, 'cooldownPvP', preset.cooldown);
    
    // Set level to Pokemon's base level, or keep existing if empty
    const pokemonLevel = schema.generalInfo.level;
    if (pokemonLevel) {
      updateMove(idx, 'level', pokemonLevel);
    }
    
    // Set attributes/icons based on categories
    if (preset.categories && Array.isArray(preset.categories)) {
       // Using the store's underlying logic to replace icons entirely,
       // but since toggleMoveIcon toggles, we should just update the field directly if we had a direct action.
       // However, the store has `updateMove`.
       updateMove(idx, 'icons', preset.categories);
    }
    
    setShowMoveSuggestions(false);
  };

  const filteredPresets = moveSearch.trim() 
    ? movePresetsData.filter(m => m.name.toLowerCase().includes(moveSearch.toLowerCase())).slice(0, 6)
    : [];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`max-w-3xl mx-auto space-y-8 pb-20 ${focusMode && focusedItemIndex === null ? 'opacity-50 blur-sm pointer-events-none' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-zinc-100">Combat & Abilities</h2>
          <p className="text-sm text-zinc-500">Configure moves, cooldowns, and combat attributes.</p>
        </div>
        <button
          onClick={() => {
            addMove();
            toggleMoveExpansion(schema.moves.length);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Add Move
        </button>
      </div>

      <div className="space-y-4">
        {schema.moves.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <Zap className="text-zinc-500" size={24} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">No combat moves added</h3>
            <p className="text-xs text-zinc-500 mt-1 mb-6">Start building the combat profile for this Pokemon.</p>
            <button
              onClick={() => { addMove(); toggleMoveExpansion(0); }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Add First Move
            </button>
          </div>
        ) : (
          schema.moves.map((move, idx) => {
            const isExpanded = expandedMoveIndex === idx;
            const elName = move.element === 'Normal1' ? 'Normal' : move.element;
            const col = ELEMENT_COLORS[elName] || '#9CA3AF';

            return (
              <motion.div 
                key={move.id}
                layout
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isExpanded 
                    ? 'border-zinc-700 bg-zinc-900/80 shadow-xl scale-[1.02] z-10 relative' 
                    : `border-white/5 bg-zinc-950 hover:bg-zinc-900/50 hover:border-white/10 cursor-pointer ${
                        expandedMoveIndex !== null ? 'opacity-40 blur-[1px] scale-95' : 'opacity-100'
                      }`
                }`}
              >
                {/* Collapsed / Header View */}
                <div 
                  onClick={() => !isExpanded && toggleMoveExpansion(idx)}
                  className="flex items-center gap-4 p-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/5 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-zinc-500">{move.slot}</span>
                  </div>
                  <img src={resolveWikiImageUrl(`${elName}.png`)} alt={elName} className="w-6 h-6 object-contain pixelated" onError={e => e.currentTarget.style.display='none'} />
                  <div className="flex-1 min-w-0">
                    <h4 className={`text-sm font-semibold truncate ${isExpanded ? 'text-zinc-100' : 'text-zinc-300'}`}>
                      {move.name || 'Unnamed Move'}
                    </h4>
                    {!isExpanded && (
                      <span className="text-xs text-zinc-500">
                        {move.cooldownPvE ? `${move.cooldownPvE} cooldown` : 'No cooldown set'}
                      </span>
                    )}
                  </div>
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); toggleMoveExpansion(idx); }}
                    className="p-2 text-zinc-500 hover:text-zinc-300 transition-colors"
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* Expanded Builder Flow (Progressive Disclosure) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-white/5 px-6 pb-6 pt-4 space-y-8"
                    >
                      {/* Step 1: Basic Info */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-300">1</span>
                          Basic Info
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Move Name</label>
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                              <input 
                                className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-9 pr-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                                value={move.name}
                                onChange={e => {
                                  updateMove(idx, 'name', e.target.value);
                                  setMoveSearch(e.target.value);
                                  setShowMoveSuggestions(true);
                                }}
                                onFocus={() => {
                                  setMoveSearch(move.name);
                                  setShowMoveSuggestions(true);
                                }}
                                placeholder="Search presets or type name..."
                              />
                            </div>
                            {showMoveSuggestions && filteredPresets.length > 0 && (
                              <div className="absolute z-50 left-0 right-0 top-full mt-2 bg-zinc-900 border border-white/10 rounded-xl shadow-xl overflow-hidden">
                                {filteredPresets.map((preset, i) => (
                                  <button 
                                    key={i} 
                                    onClick={() => handleApplyPreset(idx, preset)} 
                                    className="w-full px-4 py-2.5 text-left hover:bg-white/5 border-b border-white/5 last:border-b-0 flex flex-col cursor-pointer"
                                  >
                                    <span className="text-sm font-semibold text-zinc-200">{preset.name}</span>
                                    <span className="text-[10px] text-zinc-500">{preset.type} • {preset.cooldown} cooldown</span>
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Required Level</label>
                            <input 
                              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                              value={move.level}
                              onChange={e => updateMove(idx, 'level', e.target.value)}
                              placeholder="100"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 2: Combat Stats */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-300">2</span>
                          Cooldowns
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">PvE Cooldown</label>
                            <input 
                              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                              value={move.cooldownPvE}
                              onChange={e => updateMove(idx, 'cooldownPvE', e.target.value)}
                              placeholder="e.g. 15s"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">PvP Cooldown</label>
                            <input 
                              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                              value={move.cooldownPvP}
                              onChange={e => updateMove(idx, 'cooldownPvP', e.target.value)}
                              placeholder="e.g. 25s (leave blank if same)"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Step 3: Elements & Attributes */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                          <span className="w-4 h-4 rounded-full bg-zinc-800 flex items-center justify-center text-[9px] text-zinc-300">3</span>
                          Element & Effects
                        </div>
                        
                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-2 block">Element Type</label>
                          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                            {ELEMENTS.map(el => (
                              <button
                                key={el}
                                onClick={() => updateMove(idx, 'element', el)}
                                className={`p-1.5 rounded-lg border flex items-center justify-center transition-all ${
                                  move.element === el || (move.element === 'Normal1' && el === 'Normal')
                                    ? 'bg-zinc-800 border-zinc-500 shadow-sm'
                                    : 'border-transparent hover:bg-white/5 opacity-50 hover:opacity-100'
                                }`}
                                title={el}
                              >
                                <img src={resolveWikiImageUrl(`${el === 'Poison' ? 'Poison1' : el === 'Ghost' ? 'Ghost1' : el === 'Dark' ? 'Dark1' : el}.png`)} alt={el} className="w-5 h-5 object-contain pixelated" onError={e => e.currentTarget.style.display='none'} />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-zinc-400 mb-2 mt-4 block">Status Effects & Tags</label>
                          <div className="flex flex-wrap gap-2">
                            {FORM_ATTRIBUTES.map(attr => {
                              const active = move.icons.includes(attr.id);
                              return (
                                <button
                                  key={attr.id}
                                  onClick={() => toggleMoveIcon(idx, attr.id)}
                                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                                    active 
                                      ? 'bg-zinc-800 border-zinc-600 text-zinc-100' 
                                      : 'bg-zinc-950 border-white/5 text-zinc-500 hover:text-zinc-300 hover:border-white/10'
                                  }`}
                                >
                                  <img src={resolveWikiImageUrl(attr.file)} alt="" className="w-4 h-4 object-contain pixelated" />
                                  {attr.label}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-6">
                        <button 
                          onClick={() => { removeMove(idx); setExpandedMoveIndex(null); setFocusedItem(null); }}
                          className="flex items-center gap-1.5 text-xs font-semibold text-red-500/70 hover:text-red-400 transition-colors cursor-pointer"
                        >
                          <Trash2 size={14} /> Remove Move
                        </button>
                        <button
                          onClick={() => toggleMoveExpansion(idx)}
                          className="px-4 py-2 bg-zinc-100 text-zinc-900 text-xs font-bold rounded-lg hover:bg-white transition-colors cursor-pointer shadow-sm"
                        >
                          Done
                        </button>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })
        )}
      </div>
    </motion.div>
  );
}
