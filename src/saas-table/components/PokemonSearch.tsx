import React, { useState, useEffect } from 'react';
import { Search, PlusCircle } from 'lucide-react';
import { searchPokemon, getPokemonSpriteUrl } from '../../pokemon/pokemon-service';
import { fetchPokemonTypes } from '../utils/api';
import { getWeaknesses } from '../utils/typeUtils';
import { typeFile, wikiUrl } from '../utils/wikiGenerators';
import { NpcPokemon } from '../utils/types';
import { nanoid } from 'nanoid';

export function PokemonSearchItem({ entry, onAdd }: { entry: any, onAdd: (key: string, entry: any) => void }) {
  const [types, setTypes] = useState<string[]>(entry.types ?? []);
  useEffect(() => {
    if (types.length === 0) {
      fetchPokemonTypes(entry.name).then(t => {
        if (t.length > 0) {
          entry.types = t;
          setTypes(t);
        }
      });
    }
  }, [entry.name]);

  const weaknesses = getWeaknesses(types);

  return (
    <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
      onMouseDown={e => { e.preventDefault(); onAdd(entry.name, entry); }}>
      <img src={getPokemonSpriteUrl(entry)} alt={entry.name} className="w-9 h-9 object-contain flex-shrink-0" style={{ imageRendering: 'pixelated' }} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[var(--text-primary)]">{entry.name}</div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {types.length > 0 ? types.map(t => (
            <img key={t} src={wikiUrl(typeFile(t))} alt={t} className="h-4 object-contain" title={t} />
          )) : <span className="text-[10px] italic text-[var(--text-muted)]">buscando...</span>}
          {weaknesses.length > 0 && (
            <>
              <span className="text-[10px] text-[var(--text-muted)] mx-0.5">→ fraco contra:</span>
              {weaknesses.slice(0, 4).map(t => (
                <img key={t} src={wikiUrl(typeFile(t))} alt={t} className="h-4 object-contain" title={t} />
              ))}
              {weaknesses.length > 4 && <span className="text-[10px] text-[var(--text-muted)]">+{weaknesses.length - 4}</span>}
            </>
          )}
        </div>
      </div>
      <PlusCircle size={14} className="text-[var(--accent-primary)] flex-shrink-0" />
    </button>
  );
}

export function PokemonSearch({ onAdd }: { onAdd: (pokemon: NpcPokemon) => void }) {
  const [q, setQ] = useState('');
  const results = q.trim() ? searchPokemon(q, 8) : [];

  const handleAdd = async (key: string, entry: any) => {
    let types: string[] = entry.types ?? [];
    if (types.length === 0) {
      types = await fetchPokemonTypes(entry.name);
      entry.types = types;
    }
    const weaknesses = getWeaknesses(types);
    onAdd({ id: nanoid(4), image: entry.image, name: entry.name, types, weaknesses });
    setQ('');
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg focus-within:border-[var(--accent-primary)] transition-colors">
        <Search size={13} className="text-[var(--text-muted)] flex-shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm text-[var(--text-primary)] outline-none placeholder-[var(--text-muted)]"
          placeholder="Buscar Pokémon para adicionar..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      {results.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-2xl z-[999] overflow-hidden">
          {results.map(({ key, entry }) => (
            <PokemonSearchItem key={key} entry={entry} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
}
