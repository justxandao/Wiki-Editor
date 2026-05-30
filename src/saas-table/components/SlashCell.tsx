import React, { useState, useEffect, useRef } from 'react';
import { searchPokemon, getPokemonSpriteUrl } from '../../pokemon/pokemon-service';
import { wikiUrl } from '../utils/wikiGenerators';

export function useWikiFiles(query: string | null) {
  const [results, setResults] = useState<{title: string}[]>([]);
  useEffect(() => {
    if (!query || query.length < 9) { setResults([]); return; }
    if (!query.toLowerCase().startsWith('arquivo ')) return;
    const searchTerm = query.slice(8).trim();
    if (!searchTerm) { setResults([]); return; }
    let active = true;
    const url = `https://wiki.pokexgames.com/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(searchTerm)}&format=json&origin=*`;
    fetch(url).then(r => r.json()).then(d => {
      if (active && d.query?.search) setResults(d.query.search.map((s: any) => ({ title: s.title.replace(/^Arquivo:/i, '') })));
    }).catch(console.error);
    return () => { active = false; };
  }, [query]);
  return results;
}

export function SlashCell({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [editing, setEditing] = useState(false);
  const [local, setLocal] = useState(value);
  const [slash, setSlash] = useState<string | null>(null);
  const [formatCycle, setFormatCycle] = useState<number>(0);
  const [cycleData, setCycleData] = useState<{ file: string, name: string, baseText: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { setLocal(value); }, [value]);

  const wikiFiles = useWikiFiles(slash);
  const isArquivo = slash?.toLowerCase().startsWith('arquivo ') ?? false;
  const slashResults = (!isArquivo && slash !== null) ? searchPokemon(slash, 5) : [];

  const commit = () => { onChange(local); setEditing(false); setSlash(null); setFormatCycle(0); };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    setFormatCycle(0); // Reset cycle on typing
    const idx = v.lastIndexOf('/');
    if (idx !== -1) setSlash(v.slice(idx + 1));
    else setSlash(null);
  };

  const pick = (file: string, linkName: string) => {
    const idx = local.lastIndexOf('/');
    const baseText = idx !== -1 ? local.slice(0, idx) : local;
    const newVal = `${baseText}[[Arquivo:${file}|link=]]`;
    setLocal(newVal);
    setSlash(null);
    onChange(newVal);
    
    // Prepare for Enter cycle
    setCycleData({ file, name: linkName, baseText });
    setFormatCycle(1);
    
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (formatCycle === 1 && cycleData) {
        e.preventDefault();
        const newVal = `${cycleData.baseText}[[Arquivo:${cycleData.file}|link=${cycleData.name}]] [[${cycleData.name}]]`;
        setLocal(newVal);
        setFormatCycle(2);
        onChange(newVal);
      } else if (formatCycle === 2 && cycleData) {
        e.preventDefault();
        const newVal = `${cycleData.baseText}[[Arquivo:${cycleData.file}|link=${cycleData.name}]] '''[[${cycleData.name}]]'''`;
        setLocal(newVal);
        setFormatCycle(3); // Wait for final enter to commit
        onChange(newVal);
      } else {
        commit();
      }
    } else if (e.key === 'Escape') {
      setLocal(value); setEditing(false); setSlash(null); setFormatCycle(0);
    } else if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') {
      setFormatCycle(0);
    }
  };

  if (editing) {
    return (
      <div className="relative w-full">
        <input
          ref={inputRef} autoFocus
          className="w-full px-2.5 py-1.5 bg-[var(--bg-secondary)] text-[var(--text-primary)] text-sm border-2 border-[var(--accent-primary)] outline-none"
          value={local}
          onChange={handleChange}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        {slash !== null && (
          <div className="absolute left-0 top-full mt-0.5 w-72 bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-2xl z-[999] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
            {isArquivo ? (
              wikiFiles.length > 0 ? (
                wikiFiles.map((f, i) => (
                  <button key={i} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                    onMouseDown={e => { e.preventDefault(); pick(f.title, f.title.replace(/\.[^/.]+$/, '')); }}>
                    <img src={wikiUrl(f.title)} alt="File" className="w-7 h-7 object-contain" />
                    <span className="text-sm text-[var(--text-primary)] truncate">{f.title}</span>
                  </button>
                ))
              ) : slash.length > 9 ? (
                <div className="px-3 py-2 text-xs text-[var(--text-muted)]">Buscando arquivos na wiki...</div>
              ) : null
            ) : (
              slashResults.map(({ key, entry }) => (
                <button key={key} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
                  onMouseDown={e => { e.preventDefault(); pick(entry.image, entry.name); }}>
                  <img src={getPokemonSpriteUrl(entry)} alt={entry.name} className="w-7 h-7 object-contain" style={{ imageRendering: 'pixelated' }} />
                  <span className="text-sm text-[var(--text-primary)]">{entry.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full px-2.5 py-1.5 text-sm text-[var(--text-primary)] cursor-text overflow-hidden truncate"
      onClick={() => setEditing(true)}
      title={value || placeholder}>
      {value ? <span className="truncate">{value}</span> : <span className="text-[var(--text-muted)] italic">{placeholder ?? 'vazio'}</span>}
    </div>
  );
}
