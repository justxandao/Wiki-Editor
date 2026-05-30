import React, { useState } from 'react';
import { Check, Trash2 } from 'lucide-react';
import { pokemonIndex, getPokemonSpriteUrl } from '../../pokemon/pokemon-service';
import { NpcPokemon } from '../utils/types';
import { typeFile, wikiUrl, npcToWiki } from '../utils/wikiGenerators';
import { NpcImageInput } from './NpcImageInput';
import { PokemonSearch } from './PokemonSearch';

export function NpcDuelBuilder({ onGenerate }: { onGenerate: (wikitext: string) => void }) {
  const [npcName, setNpcName] = useState('');
  const [npcImage, setNpcImage] = useState('');
  const [npcWidth, setNpcWidth] = useState('55%');
  const [pokemon, setPokemon] = useState<NpcPokemon[]>([]);

  const remove = (id: string) => setPokemon(prev => prev.filter(p => p.id !== id));
  const move = (id: string, dir: -1 | 1) => {
    setPokemon(prev => {
      const i = prev.findIndex(p => p.id === id);
      if ((dir === -1 && i === 0) || (dir === 1 && i === prev.length - 1)) return prev;
      const arr = [...prev];
      [arr[i], arr[i + dir]] = [arr[i + dir], arr[i]];
      return arr;
    });
  };

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* NPC config */}
      <div className="flex flex-wrap items-end gap-5 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex-shrink-0">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Nome do NPC</label>
          <input className="pxg-input" style={{ width: 200 }}
            placeholder="Ex: Iron-Masked Marauder" value={npcName} onChange={e => setNpcName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Card do NPC</label>
          <NpcImageInput value={npcImage} onChange={setNpcImage} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Largura</label>
          <input className="pxg-input" style={{ width: 90 }}
            value={npcWidth} onChange={e => setNpcWidth(e.target.value)} />
        </div>
        {npcImage && (
          <div className="flex flex-col items-center gap-1">
            <img src={wikiUrl(npcImage)} alt="NPC card preview" className="h-14 w-14 object-contain rounded-lg border border-[var(--border-default)] bg-[var(--bg-tertiary)]" />
            <span className="text-[9px] text-[var(--text-muted)]">preview</span>
          </div>
        )}
      </div>

      {/* Pokémon search */}
      <div className="px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] flex-shrink-0">
        <PokemonSearch onAdd={p => setPokemon(prev => [...prev, p])} />
      </div>

      {/* Pokémon list preview */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {pokemon.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--text-muted)]">
            <div style={{ fontSize: 52, opacity: 0.5 }}>⚔️</div>
            <div className="text-sm">Busque e adicione Pokémon acima</div>
          </div>
        ) : (
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b border-[var(--border-subtle)]">
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider">Pokémon</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Fraco contra</th>
                <th className="px-4 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {pokemon.map((p, i) => {
                const entry = pokemonIndex[p.name.toLowerCase()] ?? pokemonIndex[p.name.toLowerCase().replace(/\s+/g, '')] ?? null;
                return (
                  <tr key={p.id} className="border-b border-[var(--border-subtle)] hover:bg-[var(--bg-overlay)] transition-colors group">
                    <td className="px-4 py-2 text-[var(--text-muted)] text-xs">{i + 1}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {entry ? (
                          <img src={getPokemonSpriteUrl(entry)} alt={p.name} className="w-9 h-9 object-contain flex-shrink-0" style={{ imageRendering: 'pixelated' }} />
                        ) : (
                          <div className="w-9 h-9 rounded bg-[var(--bg-tertiary)] flex-shrink-0" />
                        )}
                        <span className="text-[var(--text-primary)] font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.types.length > 0 ? p.types.map(t => (
                          <img key={t} src={wikiUrl(typeFile(t))} alt={t} className="h-5 object-contain" title={t} />
                        )) : <span className="text-[var(--text-muted)] text-xs italic">sem tipo</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.weaknesses.length > 0 ? p.weaknesses.map(t => (
                          <img key={t} src={wikiUrl(typeFile(t))} alt={t} className="h-5 object-contain" title={t} />
                        )) : <span className="text-[var(--text-muted)] text-xs italic">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => move(p.id, -1)} title="Mover para cima">↑</button>
                        <button className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]" onClick={() => move(p.id, 1)} title="Mover para baixo">↓</button>
                        <button className="p-1 text-[#ef4444] hover:text-[#f87171]" onClick={() => remove(p.id)} title="Remover">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Generate button */}
      <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex-shrink-0 flex items-center justify-between">
        <span className="text-xs text-[var(--text-muted)]">
          {pokemon.length > 0 ? `${pokemon.length} Pokémon adicionado${pokemon.length > 1 ? 's' : ''}` : 'Nenhum Pokémon adicionado'}
        </span>
        <button
          disabled={!pokemon.length}
          onClick={() => onGenerate(npcToWiki(npcName || 'NPC', npcImage, npcWidth, pokemon))}
          className="pxg-btn-primary flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ padding: '10px 22px' }}
        >
          <Check size={16} />
          Inserir no Editor
        </button>
      </div>
    </div>
  );
}
