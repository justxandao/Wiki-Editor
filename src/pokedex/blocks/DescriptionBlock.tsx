import React from 'react';
import { usePokedexStore } from '../store/pokedexStore';

export function DescriptionBlock() {
  const { schema, updateSchema } = usePokedexStore();

  return (
    <div id="block-description" className="bg-[#121216]/90 border border-white/[0.08] rounded-2xl p-6 shadow-2xl animate-fade-in">
      <h3 className="text-xs font-bold text-accent-primary uppercase tracking-wider mb-3 flex items-center gap-1.5 font-outfit">
        <span>📝</span> Descrição do Pokémon
      </h3>
      <textarea
        value={schema.description}
        onChange={e => updateSchema({ description: e.target.value })}
        rows={3}
        placeholder="Descreva a história, as forças ou curiosidades do Pokémon..."
        className="w-full bg-black/35 hover:bg-black/50 focus:bg-black/65 p-3.5 rounded-xl text-xs border border-white/[0.06] focus:border-accent-primary/65 outline-none transition duration-150 font-medium resize-none leading-relaxed text-text-secondary focus:text-white placeholder-text-muted/50"
      />
    </div>
  );
}
