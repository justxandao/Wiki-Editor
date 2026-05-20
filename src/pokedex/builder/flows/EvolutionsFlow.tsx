import React from 'react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { Plus, Trash2, ArrowDown } from 'lucide-react';
import { motion } from 'framer-motion';

export function EvolutionsFlow() {
  const { schema, addEvolution, updateEvolution, removeEvolution } = usePokedexStore();
  const { focusMode } = usePokedexUIStore();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`max-w-3xl mx-auto space-y-8 pb-20 ${focusMode ? 'opacity-50 blur-sm pointer-events-none' : ''}`}
    >
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-zinc-100">Evolution Chain</h2>
          <p className="text-sm text-zinc-500">Define the lineage and level requirements for this Pokemon's evolutions.</p>
        </div>
        <button
          onClick={addEvolution}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Add Stage
        </button>
      </div>

      <div className="space-y-4">
        {schema.evolutions.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <span className="text-xl">🧬</span>
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">No evolution stages</h3>
            <p className="text-xs text-zinc-500 mt-1 mb-6">Does this Pokemon evolve? Add the stages below.</p>
            <button
              onClick={addEvolution}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Add Evolution
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            {/* Visual Start Node */}
            <div className="w-full max-w-lg bg-zinc-900/40 p-4 border border-white/5 rounded-2xl text-center relative z-10 shadow-sm">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">Base Stage</span>
              <span className="text-lg font-semibold text-zinc-200">{schema.generalInfo.name || 'Current Pokemon'}</span>
            </div>

            {schema.evolutions.map((evo, i) => (
              <React.Fragment key={i}>
                {/* Arrow connecting stages */}
                <div className="h-10 border-l-2 border-dashed border-zinc-700 relative flex items-center justify-center -z-0">
                  <ArrowDown size={16} className="text-zinc-600 bg-[#06060c] absolute" />
                </div>
                
                {/* Evolution Card */}
                <div className="w-full max-w-lg bg-zinc-900/80 p-5 border border-white/10 rounded-2xl shadow-sm group relative z-10">
                  <span className="absolute -left-3 -top-3 w-6 h-6 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center text-[10px] font-bold text-zinc-400">
                    {i + 1}
                  </span>
                  
                  <div className="grid grid-cols-3 gap-4 items-end">
                    <div className="col-span-2">
                      <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Evolution Name</label>
                      <input 
                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                        value={evo.name}
                        onChange={e => updateEvolution(i, 'name', e.target.value)}
                        placeholder="e.g. Charmeleon"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-400 mb-1.5 block">Level Required</label>
                      <input 
                        className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                        value={evo.level}
                        onChange={e => updateEvolution(i, 'level', e.target.value)}
                        placeholder="e.g. 16"
                      />
                    </div>
                  </div>

                  <button 
                    onClick={() => removeEvolution(i)}
                    className="absolute -right-3 -top-3 w-7 h-7 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:border-red-500/50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer shadow-md"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
