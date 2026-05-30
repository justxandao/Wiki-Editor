import React, { useState, useEffect } from 'react';
import { wikiUrl } from '../utils/wikiGenerators';

export function NpcImageInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [q, setQ] = useState(value);
  const [results, setResults] = useState<{title: string}[]>([]);
  const [show, setShow] = useState(false);

  useEffect(() => { setQ(value); }, [value]);

  useEffect(() => {
    if (!q || q.length < 3) { setResults([]); return; }
    let active = true;
    const url = `https://wiki.pokexgames.com/api.php?action=query&list=search&srnamespace=6&srsearch=${encodeURIComponent(q)}&format=json&origin=*`;
    fetch(url).then(r => r.json()).then(d => {
      if (active && d.query?.search) setResults(d.query.search.map((s: any) => ({ title: s.title.replace(/^Arquivo:/i, '') })));
    }).catch(console.error);
    return () => { active = false; };
  }, [q]);

  const pick = (file: string) => {
    onChange(file);
    setQ(file);
    setShow(false);
  };

  return (
    <div className="relative">
      <input className="pxg-input w-64"
        placeholder="Ex: Voidmania_npc_card_azul.png"
        value={q}
        onChange={e => { setQ(e.target.value); onChange(e.target.value); setShow(true); }}
        onFocus={() => setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
      />
      {show && results.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-full bg-[var(--bg-tertiary)] border border-[var(--border-default)] rounded-lg shadow-2xl z-[999] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
          {results.map((f, i) => (
            <button key={i} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[var(--bg-tertiary)] transition-colors text-left"
              onMouseDown={e => { e.preventDefault(); pick(f.title); }}>
              <img src={wikiUrl(f.title)} alt="File" className="w-7 h-7 object-contain" />
              <span className="text-sm text-[var(--text-primary)] truncate">{f.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
