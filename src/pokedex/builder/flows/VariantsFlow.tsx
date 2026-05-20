import React from 'react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { Plus, Trash2, ImageIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export function VariantsFlow() {
  const { schema, addAltVersion, updateAltVersion, removeAltVersion } = usePokedexStore();
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
          <h2 className="text-2xl font-semibold text-zinc-100">Alternate Forms</h2>
          <p className="text-sm text-zinc-500">Configure regional variants, shiny forms, or mega evolutions.</p>
        </div>
        <button
          onClick={addAltVersion}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-100 hover:bg-white text-zinc-900 text-sm font-bold rounded-lg transition-colors cursor-pointer shadow-sm"
        >
          <Plus size={16} /> Add Variant
        </button>
      </div>

      <div className="space-y-4">
        {schema.altVersions.length === 0 ? (
          <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl bg-zinc-900/20">
            <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
              <ImageIcon className="text-zinc-500" size={24} />
            </div>
            <h3 className="text-sm font-semibold text-zinc-300">No alternate forms</h3>
            <p className="text-xs text-zinc-500 mt-1 mb-6">Does this Pokemon have a Shiny or Alolan form?</p>
            <button
              onClick={addAltVersion}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
            >
              Add First Variant
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {schema.altVersions.map((alt, i) => (
              <div key={i} className="flex items-center gap-4 bg-zinc-900/50 border border-white/5 rounded-2xl p-5 hover:bg-zinc-900/80 hover:border-white/10 transition-colors">
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 block">Variant Name</label>
                  <input
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                    placeholder="e.g. Shiny Charizard"
                    value={alt.name}
                    onChange={e => updateAltVersion(i, 'name', e.target.value)}
                  />
                </div>
                <div className="flex-1 space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-400 block">Image Prefix</label>
                  <input
                    className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                    placeholder="e.g. 006"
                    value={alt.imagePrefix}
                    onChange={e => updateAltVersion(i, 'imagePrefix', e.target.value)}
                  />
                </div>
                <button
                  onClick={() => removeAltVersion(i)}
                  className="p-3 mt-5 bg-zinc-950 border border-white/5 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 rounded-xl transition-colors cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
