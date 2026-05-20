import React from 'react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { ELEMENT_COLORS } from '../utils/constants';
import { resolveWikiImageUrl } from '../utils/helpers';
import { Info, Zap, RefreshCw, AlertTriangle, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export function ContextualInspector() {
  const { activeTab, focusedItemIndex, previewMode, setPreviewMode } = usePokedexUIStore();
  const { schema } = usePokedexStore();

  const renderGeneralContext = () => {
    const elStr = schema.generalInfo.element || '';
    const elements = Object.keys(ELEMENT_COLORS).filter(el => new RegExp(`\\b${el}\\b`, 'i').test(elStr));
    
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
        <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 shadow-sm space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-zinc-400 font-mono">
                #{schema.generalInfo.number || '???'}
              </span>
              <h3 className="text-lg font-bold text-zinc-100 mt-1">{schema.generalInfo.name || 'Unnamed Pokemon'}</h3>
            </div>
            <div className="flex flex-wrap gap-1 justify-end max-w-[100px]">
              {elements.map(el => (
                <span key={el} style={{ backgroundColor: ELEMENT_COLORS[el] }} className="px-1.5 py-0.5 rounded text-[9px] font-bold text-white uppercase tracking-wider shadow-sm">
                  {el}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs border-t border-white/5 pt-3">
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Min Level</span>
              <span className="font-semibold text-zinc-300">{schema.generalInfo.level || '---'}</span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block">Clan / Materia</span>
              <span className="font-semibold text-zinc-300 truncate block">{schema.generalInfo.materia || '---'}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <Info size={12} /> Dex Entry
          </h4>
          <p className="text-xs text-zinc-400 italic bg-white/5 p-3 rounded-xl border border-white/5">
            "{schema.generalInfo.description || 'No description yet.'}"
          </p>
        </div>
      </motion.div>
    );
  };

  const renderMovesContext = () => {
    // If a move is focused, show its details. Otherwise, show a summary of all moves.
    if (focusedItemIndex !== null && schema.moves[focusedItemIndex]) {
      const m = schema.moves[focusedItemIndex];
      const elName = m.element === 'Normal1' ? 'Normal' : m.element;
      const col = ELEMENT_COLORS[elName] || '#9CA3AF';
      
      return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
          <div className="bg-zinc-900/50 rounded-xl p-4 border border-white/5 shadow-sm">
            <div className="flex items-center gap-3 border-b border-white/5 pb-3 mb-3">
              <img src={resolveWikiImageUrl(`${elName}.png`)} alt={elName} className="w-8 h-8 object-contain pixelated" onError={e => e.currentTarget.style.display='none'} />
              <div>
                <h3 className="text-sm font-bold text-zinc-100">{m.name || 'Unnamed Move'}</h3>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider font-semibold">Slot: {m.slot} • Lv. {m.level}</span>
              </div>
            </div>
            
            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                <span className="text-zinc-500 font-semibold">Cooldown (PvE)</span>
                <span className="text-emerald-400 font-bold">{m.cooldownPvE || '--'}</span>
              </div>
              {m.cooldownPvP && (
                <div className="flex justify-between items-center bg-white/5 p-2 rounded-lg">
                  <span className="text-zinc-500 font-semibold">Cooldown (PvP)</span>
                  <span className="text-amber-400 font-bold">{m.cooldownPvP}</span>
                </div>
              )}
            </div>
          </div>
          
          {m.icons.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
                <Zap size={12} /> Attributes
              </h4>
              <div className="flex flex-wrap gap-2">
                {m.icons.map(icon => (
                  <div key={icon} className="bg-white/5 border border-white/10 p-1.5 rounded-lg">
                    <img src={resolveWikiImageUrl(`${icon}.png`)} alt={icon} title={icon} className="w-5 h-5 object-contain pixelated" onError={e => e.currentTarget.style.display='none'} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      );
    }
    
    // Default moves view
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Move Roster ({schema.moves.length})</h4>
          <div className="flex bg-zinc-900 border border-white/5 rounded-lg p-0.5 text-[9px] font-bold uppercase tracking-wider">
            <button onClick={() => setPreviewMode(false)} className={`px-2 py-1 rounded-md transition ${!previewMode ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>PvE</button>
            <button onClick={() => setPreviewMode(true)} className={`px-2 py-1 rounded-md transition ${previewMode ? 'bg-zinc-700 text-white' : 'text-zinc-500'}`}>PvP</button>
          </div>
        </div>
        
        <div className="space-y-2">
          {schema.moves.length === 0 ? (
            <p className="text-xs text-zinc-600 text-center py-4">No moves added.</p>
          ) : (
            schema.moves.map(m => {
              const cd = previewMode ? m.cooldownPvP : m.cooldownPvE;
              return (
                <div key={m.id} className="flex items-center gap-2 text-xs p-2 rounded-lg hover:bg-white/5 border border-transparent hover:border-white/5 transition-colors">
                  <span className="w-5 text-center text-[9px] font-bold text-zinc-500">{m.slot}</span>
                  <span className="flex-1 font-semibold text-zinc-300 truncate">{m.name}</span>
                  <span className="text-[10px] text-zinc-500">{cd || '--'}</span>
                </div>
              );
            })
          )}
        </div>
      </motion.div>
    );
  };

  const renderEvolutionsContext = () => {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
         <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <RefreshCw size={12} /> Evolution Chain
          </h4>
          <div className="relative pl-3 border-l-2 border-zinc-800 space-y-6 py-2">
            {schema.evolutions.length === 0 ? (
               <p className="text-xs text-zinc-600">No evolutions specified.</p>
            ) : (
              schema.evolutions.map((evo, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[17px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-700 border-2 border-zinc-950" />
                  <div className="bg-zinc-900/50 p-3 rounded-xl border border-white/5">
                    <span className="block font-bold text-zinc-200 text-sm">{evo.name || 'Unknown'}</span>
                    <span className="text-[10px] font-semibold text-zinc-500">Level {evo.level || '--'} required</span>
                  </div>
                </div>
              ))
            )}
          </div>
      </motion.div>
    );
  };

  const renderEffectivenessContext = () => {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
         <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={12} /> Matchups
          </h4>
          <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Weak to (2x)</span>
              <p className="text-xs text-zinc-300">{schema.effectiveness.veryEffective || '--'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Resists (0.5x)</span>
              <p className="text-xs text-zinc-300">{schema.effectiveness.veryIneffective || '--'}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">Immune (0x)</span>
              <p className="text-xs text-zinc-300">{schema.effectiveness.nulo || '--'}</p>
            </div>
          </div>
      </motion.div>
    );
  };

  return (
    <aside className="w-[340px] bg-zinc-950 border-l border-white/5 flex flex-col flex-shrink-0 h-full relative z-10">
      <div className="p-4 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-20">
        <h2 className="text-xs font-bold text-zinc-100 uppercase tracking-widest flex items-center gap-2">
          <Eye size={14} className="text-zinc-500" /> Inspector
        </h2>
      </div>
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'general' && renderGeneralContext()}
          {activeTab === 'moves' && renderMovesContext()}
          {activeTab === 'evolutions' && renderEvolutionsContext()}
          {activeTab === 'effectiveness' && renderEffectivenessContext()}
          {activeTab === 'altVersions' && renderGeneralContext()}
          {activeTab === 'publishing' && renderGeneralContext()}
        </AnimatePresence>
      </div>
    </aside>
  );
}
