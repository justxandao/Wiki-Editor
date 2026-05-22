import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useEditorStore } from '../../state/editorStore';
import { searchPokemon, getPokemonSpriteUrl, pokemonIndex } from '../../pokemon/pokemon-service';
import { getWeaknesses } from '../utils/typeUtils';
import { resolveWikiImageUrl } from '../../pokedex/builder/utils/helpers';
import { X, Check, PlusCircle, Trash2, Search } from 'lucide-react';
import { nanoid } from 'nanoid';
import '../../pokedex/builder/PokedexBuilder.css';

// ─── Type mapping ────────────────────────────────────────────────────────────
const TYPE_FILE: Record<string, string> = {
  Normal: 'Normal1.png',
  Poison: 'Poison1.png',
  Ghost: 'Ghost1.png',
  Dark: 'Dark1.png',
};
function typeFile(t: string) { return TYPE_FILE[t] ?? `${t}.png`; }
function typeIcon(t: string) { return `[[Arquivo:${typeFile(t)}|link=]]`; }
function typesToIcons(types: string[]) { return types.map(typeIcon).join(' '); }
function wikiUrl(file: string) { return resolveWikiImageUrl(file); }

const POKEAPI_TYPE_MAP: Record<string, string> = {
  normal: 'Normal', fire: 'Fire', water: 'Water', grass: 'Grass', electric: 'Electric',
  ice: 'Ice', fighting: 'Fighting', poison: 'Poison', ground: 'Ground', flying: 'Flying',
  psychic: 'Psychic', bug: 'Bug', rock: 'Rock', ghost: 'Ghost', dragon: 'Dragon',
  dark: 'Dark', steel: 'Steel', fairy: 'Fairy'
};

const VALID_ELEMENTS = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'];

async function fetchPokemonTypes(name: string): Promise<string[]> {
  try {
    // 1. Try fetching directly from the PokeXGames Wiki to get accurate custom elements (like Pure Steel Shiny Mawile)
    const url = `https://wiki.pokexgames.com/api.php?action=query&prop=revisions&titles=${encodeURIComponent(name)}&rvprop=content&rvslots=main&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId !== '-1') {
        const text = pages[pageId].revisions?.[0]?.slots?.main?.['*'];
        if (text) {
          const match = text.match(/'''Elementos?:'''(.*?)(?:<br|\n)/i);
          if (match && match[1]) {
            const typesString = match[1];
            const foundTypes: string[] = [];
            VALID_ELEMENTS.forEach(el => {
              const regex = new RegExp(`\\b${el}\\b`, 'i');
              if (regex.test(typesString)) foundTypes.push(el);
            });
            if (foundTypes.length > 0) return foundTypes;
          }
        }
      }
    }
  } catch (e) {
    console.error("Wiki fetch failed, falling back to PokeAPI", e);
  }

  // 2. Fallback to PokeAPI (with Shiny and Mega prefixes stripped)
  return fetchPokeApiTypes(name);
}

async function fetchPokeApiTypes(name: string): Promise<string[]> {
  try {
    let apiName = name.toLowerCase()
      .replace(/^shiny\s+/i, '')
      .replace(/^mega\s+(.*)/i, '$1-mega') // Try official mega first
      .replace(/\s*\(mega\)\s*/i, '-mega')
      .replace(/\s*\(alola\)\s*/i, '-alola')
      .replace(/[^a-z0-9-]/g, '');
      
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
    if (!res.ok) {
      if (apiName.includes('-')) {
        const baseName = apiName.split('-')[0];
        const resBase = await fetch(`https://pokeapi.co/api/v2/pokemon/${baseName}`);
        if (resBase.ok) {
          const data = await resBase.json();
          return data.types.map((t: any) => POKEAPI_TYPE_MAP[t.type.name] || t.type.name);
        }
      }
      
      if (name.toLowerCase().startsWith('mega ')) {
        const pureBase = name.toLowerCase().replace(/^mega\s+/i, '').replace(/[^a-z0-9-]/g, '');
        const resPure = await fetch(`https://pokeapi.co/api/v2/pokemon/${pureBase}`);
        if (resPure.ok) {
          const data = await resPure.json();
          return data.types.map((t: any) => POKEAPI_TYPE_MAP[t.type.name] || t.type.name);
        }
      }
      return [];
    }
    const data = await res.json();
    return data.types.map((t: any) => POKEAPI_TYPE_MAP[t.type.name] || t.type.name);
  } catch {
    return [];
  }
}

function NpcImageInput({ value, onChange }: { value: string, onChange: (v: string) => void }) {
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
        <div className="absolute left-0 top-full mt-1 w-full bg-[#16161f] border border-[#2a2a3e] rounded-lg shadow-2xl z-[999] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
          {results.map((f, i) => (
            <button key={i} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#2d2048] transition-colors text-left"
              onMouseDown={e => { e.preventDefault(); pick(f.title); }}>
              <img src={wikiUrl(f.title)} alt="File" className="w-7 h-7 object-contain" />
              <span className="text-sm text-[#e2e2e8] truncate">{f.title}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function PokemonSearchItem({ entry, onAdd }: { entry: any, onAdd: (key: string, entry: any) => void }) {
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
    <button className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[#2d2048] transition-colors text-left"
      onMouseDown={e => { e.preventDefault(); onAdd(entry.name, entry); }}>
      <img src={getPokemonSpriteUrl(entry)} alt={entry.name} className="w-9 h-9 object-contain flex-shrink-0" style={{ imageRendering: 'pixelated' }} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-[#e2e2e8]">{entry.name}</div>
        <div className="flex items-center gap-1 mt-0.5 flex-wrap">
          {types.length > 0 ? types.map(t => (
            <img key={t} src={wikiUrl(typeFile(t))} alt={t} className="h-4 object-contain" title={t} />
          )) : <span className="text-[10px] italic text-[#6b6b80]">buscando...</span>}
          {weaknesses.length > 0 && (
            <>
              <span className="text-[10px] text-[#6b6b80] mx-0.5">→ fraco contra:</span>
              {weaknesses.slice(0, 4).map(t => (
                <img key={t} src={wikiUrl(typeFile(t))} alt={t} className="h-4 object-contain" title={t} />
              ))}
              {weaknesses.length > 4 && <span className="text-[10px] text-[#6b6b80]">+{weaknesses.length - 4}</span>}
            </>
          )}
        </div>
      </div>
      <PlusCircle size={14} className="text-[#7c3aed] flex-shrink-0" />
    </button>
  );
}

interface Col { id: string; name: string; width: number; }
interface GridRow { id: string; cells: Record<string, string>; isXpRow?: boolean; }

// ─── NPC Duel Types ──────────────────────────────────────────────────────────
interface NpcPokemon {
  id: string;
  image: string;   // wiki image file e.g. "430-Shiny_Honchkrow.png"
  name: string;    // wiki link name
  types: string[];
  weaknesses: string[];
}

// ─── Wikitext generators ─────────────────────────────────────────────────────
function gridToWiki(cols: Col[], rows: GridRow[]): string {
  let out = '{| class="wikitable" style="text-align:center;"\n|-\n';
  out += '! ' + cols.map(c => c.name).join(' !! ') + '\n';
  rows.forEach(row => {
    out += '|-\n| ' + cols.map(c => row.cells[c.id] ?? '').join(' || ') + '\n';
  });
  return out + '|}';
}

function npcToWiki(npcName: string, npcImage: string, npcWidth: string, pokemon: NpcPokemon[]): string {
  if (!pokemon.length) return '';
  const n = pokemon.length;
  let out = '<center>\n';
  out += '{| class="wikitable" width="55%" style="text-align:center;"\n';
  out += '|-\n';
  out += `! width="10%" | ${npcName}\n`;
  out += `! colspan="2" width="20%" | Pokémon\n`;
  out += `! width="15%" | Elemento\n`;
  out += `! width="25%" | Efetivo Contra\n`;
  out += '|-\n';
  // NPC card image with rowspan on first row
  if (npcImage) {
    out += `| rowspan="${n}" style="vertical-align:middle;" |\n[[Arquivo:${npcImage}|64px|link=]]\n`;
  } else {
    out += `| rowspan="${n}" style="vertical-align:middle;" |\n`;
  }
  // First Pokémon on same row
  const p0 = pokemon[0];
  out += `| [[Arquivo:${p0.image}|link=${p0.name}]]\n`;
  out += `| [[${p0.name}]]\n`;
  out += `| ${typesToIcons(p0.types)}\n`;
  out += `| ${typesToIcons(p0.weaknesses)}\n`;
  // Rest of Pokémon
  for (let i = 1; i < pokemon.length; i++) {
    const p = pokemon[i];
    out += '|-\n';
    out += `| [[Arquivo:${p.image}|link=${p.name}]]\n`;
    out += `| [[${p.name}]]\n`;
    out += `| ${typesToIcons(p.types)}\n`;
    out += `| ${typesToIcons(p.weaknesses)}\n`;
  }
  out += '|}\n</center>';
  return out;
}

function rewardsToWiki(rows: GridRow[], xpText: string): string {
  let out = '<center>\n{| class="wikitable" style="text-align: center;"\n';
  out += '! colspan="2" | Recompensas\n';
  rows.forEach(row => {
    if (row.isXpRow) {
      out += `|-\n! colspan="2" | [[Arquivo:Exp_icon.png|30px|link=]] ${row.cells['item'] ?? ''}\n`;
    } else {
      out += `|-\n| ${row.cells['item'] ?? ''} || ${row.cells['qty'] ?? ''}\n`;
    }
  });
  if (xpText.trim()) {
    out += `|-\n! colspan="2" | [[Arquivo:Exp_icon.png|30px|link=]] ${xpText}\n`;
  }
  out += '|}\n</center>';
  return out;
}

// ─── Cell with slash command ──────────────────────────────────────────────────
function useWikiFiles(query: string | null) {
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

function SlashCell({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
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
          className="w-full px-2.5 py-1.5 bg-[#0d0d14] text-[#e2e2e8] text-sm border-2 border-[#7c3aed] outline-none"
          value={local}
          onChange={handleChange}
          onBlur={commit}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
        />
        {slash !== null && (
          <div className="absolute left-0 top-full mt-0.5 w-72 bg-[#16161f] border border-[#2a2a3e] rounded-lg shadow-2xl z-[999] overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
            {isArquivo ? (
              wikiFiles.length > 0 ? (
                wikiFiles.map((f, i) => (
                  <button key={i} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#2d2048] transition-colors text-left"
                    onMouseDown={e => { e.preventDefault(); pick(f.title, f.title.replace(/\.[^/.]+$/, '')); }}>
                    <img src={wikiUrl(f.title)} alt="File" className="w-7 h-7 object-contain" />
                    <span className="text-sm text-[#e2e2e8] truncate">{f.title}</span>
                  </button>
                ))
              ) : slash.length > 9 ? (
                <div className="px-3 py-2 text-xs text-[#6b6b80]">Buscando arquivos na wiki...</div>
              ) : null
            ) : (
              slashResults.map(({ key, entry }) => (
                <button key={key} className="flex items-center gap-2 w-full px-3 py-2 hover:bg-[#2d2048] transition-colors text-left"
                  onMouseDown={e => { e.preventDefault(); pick(entry.image, entry.name); }}>
                  <img src={getPokemonSpriteUrl(entry)} alt={entry.name} className="w-7 h-7 object-contain" style={{ imageRendering: 'pixelated' }} />
                  <span className="text-sm text-[#e2e2e8]">{entry.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="w-full px-2.5 py-1.5 text-sm text-[#e2e2e8] cursor-text overflow-hidden truncate"
      onClick={() => setEditing(true)}
      title={value || placeholder}>
      {value ? <span className="truncate">{value}</span> : <span className="text-[#3a3a52] italic">{placeholder ?? 'vazio'}</span>}
    </div>
  );
}

// ─── NPC Pokémon Search ───────────────────────────────────────────────────────
function PokemonSearch({ onAdd }: { onAdd: (pokemon: NpcPokemon) => void }) {
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
      <div className="flex items-center gap-2 px-3 py-1.5 bg-[#16161f] border border-[#2a2a3e] rounded-lg focus-within:border-[#7c3aed] transition-colors">
        <Search size={13} className="text-[#6b6b80] flex-shrink-0" />
        <input
          className="flex-1 bg-transparent text-sm text-[#e2e2e8] outline-none placeholder-[#3a3a52]"
          placeholder="Buscar Pokémon para adicionar..."
          value={q}
          onChange={e => setQ(e.target.value)}
        />
      </div>
      {results.length > 0 && (
        <div className="absolute left-0 top-full mt-1 w-full bg-[#16161f] border border-[#2a2a3e] rounded-lg shadow-2xl z-[999] overflow-hidden">
          {results.map(({ key, entry }) => (
            <PokemonSearchItem key={key} entry={entry} onAdd={handleAdd} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Free Grid ────────────────────────────────────────────────────────────────
function FreeGrid({ cols, rows, onColsChange, onRowsChange }: {
  cols: Col[]; rows: GridRow[];
  onColsChange: (c: Col[]) => void;
  onRowsChange: (r: GridRow[]) => void;
}) {
  const resizeRef = useRef<{ id: string; startX: number; startW: number } | null>(null);

  const startResize = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const col = cols.find(c => c.id === id)!;
    resizeRef.current = { id, startX: e.clientX, startW: col.width };
    const move = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const w = Math.max(80, resizeRef.current.startW + ev.clientX - resizeRef.current.startX);
      onColsChange(cols.map(c => c.id === resizeRef.current!.id ? { ...c, width: w } : c));
    };
    const up = () => { resizeRef.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [cols, onColsChange]);

  const addRow = () => onRowsChange([...rows, { id: nanoid(4), cells: Object.fromEntries(cols.map(c => [c.id, ''])) }]);
  const addCol = () => { const id = nanoid(4); onColsChange([...cols, { id, name: `Col ${cols.length + 1}`, width: 180 }]); onRowsChange(rows.map(r => ({ ...r, cells: { ...r.cells, [id]: '' } }))); };
  const delRow = (id: string) => onRowsChange(rows.filter(r => r.id !== id));
  const delCol = (id: string) => { if (cols.length <= 1) return; onColsChange(cols.filter(c => c.id !== id)); onRowsChange(rows.map(r => { const cells = { ...r.cells }; delete cells[id]; return { ...r, cells }; })); };
  const setCell = (rowId: string, colId: string, v: string) => onRowsChange(rows.map(r => r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: v } } : r));
  const setColName = (id: string, name: string) => onColsChange(cols.map(c => c.id === id ? { ...c, name } : c));

  return (
    <div className="flex-1 overflow-auto bg-[#0d0d14] custom-scrollbar" style={{ minHeight: 0 }}>
      <div style={{ minWidth: cols.reduce((a, c) => a + c.width, 0) + 60, width: 'max-content' }} className="pb-8">
        {/* Header (Sticky) */}
        <div className="flex sticky top-0 z-20 bg-[#0d0d14] border-b-2 border-[#2a2a3e] shadow-sm">
          {cols.map(col => (
            <div key={col.id} className="relative flex items-center border-r border-[#1e1e2e] group"
              style={{ width: col.width, height: 40, flexShrink: 0 }}>
              <input className="flex-1 px-3 text-[11px] font-bold text-[#a78bfa] uppercase tracking-wider bg-transparent outline-none"
                value={col.name} onChange={e => setColName(col.id, e.target.value)} />
              <button className="absolute top-1.5 right-4 opacity-0 group-hover:opacity-100 text-[#ef4444] p-1 bg-[#0d0d14] rounded-md transition-opacity"
                onClick={() => delCol(col.id)} title="Excluir Coluna"><X size={12} /></button>
              <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-[#7c3aed]"
                onMouseDown={e => startResize(e, col.id)} />
            </div>
          ))}
          {/* Falsa Coluna (Adicionar Coluna) */}
          <button onClick={addCol} className="w-12 flex items-center justify-center text-[#3a3a52] bg-[#16161f]/20 hover:bg-[#2d2048]/40 hover:text-[#a78bfa] border-r border-[#1e1e2e] flex-shrink-0 transition-all group" title="Adicionar Coluna">
            <PlusCircle size={16} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        {/* Rows */}
        {rows.map(row => (
          <div key={row.id} className="flex border-b border-[#1e1e2e] hover:bg-[#16161f]/30 group transition-colors" style={{ minHeight: 40 }}>
            {cols.map(col => (
              <div key={col.id} className="border-r border-[#1e1e2e] flex items-stretch"
                style={{ width: col.width, flexShrink: 0, minHeight: 40 }}>
                <SlashCell value={row.cells[col.id] ?? ''} onChange={v => setCell(row.id, col.id, v)} />
              </div>
            ))}
            <div className="w-12 flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 border-r border-[#1e1e2e] transition-opacity bg-transparent">
              <button className="p-1.5 rounded-md text-[#6b6b80] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all" onClick={() => delRow(row.id)} title="Excluir Linha"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {/* Adicionar Linha (Barra Tracejada) */}
        <div className="flex mt-3 px-3" style={{ width: cols.reduce((a, c) => a + c.width, 0) }}>
          <button onClick={addRow} className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg border-2 border-dashed border-[#2a2a3e] text-sm font-semibold text-[#6b6b80] bg-[#16161f]/10 hover:bg-[#2d2048]/20 hover:text-[#a78bfa] hover:border-[#7c3aed]/50 transition-all">
            <PlusCircle size={16} /> Adicionar Nova Linha
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── NPC Duel Builder ─────────────────────────────────────────────────────────
function NpcDuelBuilder({ onGenerate }: { onGenerate: (wikitext: string) => void }) {
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
      <div className="flex flex-wrap items-end gap-5 px-6 py-4 border-b border-[#1e1e2e] bg-[#0d0d14]/50 flex-shrink-0">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#5a5a72] uppercase tracking-widest">Nome do NPC</label>
          <input className="pxg-input" style={{ width: 200 }}
            placeholder="Ex: Iron-Masked Marauder" value={npcName} onChange={e => setNpcName(e.target.value)} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#5a5a72] uppercase tracking-widest">Card do NPC</label>
          <NpcImageInput value={npcImage} onChange={setNpcImage} />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#5a5a72] uppercase tracking-widest">Largura</label>
          <input className="pxg-input" style={{ width: 90 }}
            value={npcWidth} onChange={e => setNpcWidth(e.target.value)} />
        </div>
        {npcImage && (
          <div className="flex flex-col items-center gap-1">
            <img src={wikiUrl(npcImage)} alt="NPC card preview" className="h-14 w-14 object-contain rounded-lg border border-[#2a2a3e] bg-[#16161f]" />
            <span className="text-[9px] text-[#3a3a52]">preview</span>
          </div>
        )}
      </div>

      {/* Pokémon search */}
      <div className="px-6 py-3 border-b border-[#1e1e2e] bg-[#0d0d14]/20 flex-shrink-0">
        <PokemonSearch onAdd={p => setPokemon(prev => [...prev, p])} />
      </div>

      {/* Pokémon list preview */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {pokemon.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4" style={{ color: '#2a2a3e' }}>
            <div style={{ fontSize: 52, opacity: 0.5 }}>⚔️</div>
            <div className="text-sm text-[#3a3a52]">Busque e adicione Pokémon acima</div>
          </div>
        ) : (
          <table className="w-full text-sm" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr className="border-b border-[#2a2a3e]">
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#6b6b80] uppercase tracking-wider w-10">#</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#a78bfa] uppercase tracking-wider">Pokémon</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#6b6b80] uppercase tracking-wider">Tipo</th>
                <th className="px-4 py-2.5 text-left text-[11px] font-bold text-[#6b6b80] uppercase tracking-wider">Fraco contra</th>
                <th className="px-4 py-2.5 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {pokemon.map((p, i) => {
                const entry = pokemonIndex[p.name.toLowerCase()] ?? pokemonIndex[p.name.toLowerCase().replace(/\s+/g, '')] ?? null;
                return (
                  <tr key={p.id} className="border-b border-[#1e1e2e] hover:bg-[#16161f]/40 transition-colors group">
                    <td className="px-4 py-2 text-[#6b6b80] text-xs">{i + 1}</td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2">
                        {entry ? (
                          <img src={getPokemonSpriteUrl(entry)} alt={p.name} className="w-9 h-9 object-contain flex-shrink-0" style={{ imageRendering: 'pixelated' }} />
                        ) : (
                          <div className="w-9 h-9 rounded bg-[#1e1e2e] flex-shrink-0" />
                        )}
                        <span className="text-[#e2e2e8] font-medium">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.types.length > 0 ? p.types.map(t => (
                          <img key={t} src={wikiUrl(typeFile(t))} alt={t} className="h-5 object-contain" title={t} />
                        )) : <span className="text-[#3a3a52] text-xs italic">sem tipo</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1 flex-wrap">
                        {p.weaknesses.length > 0 ? p.weaknesses.map(t => (
                          <img key={t} src={wikiUrl(typeFile(t))} alt={t} className="h-5 object-contain" title={t} />
                        )) : <span className="text-[#3a3a52] text-xs italic">—</span>}
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1 text-[#6b6b80] hover:text-[#e2e2e8]" onClick={() => move(p.id, -1)} title="Mover para cima">↑</button>
                        <button className="p-1 text-[#6b6b80] hover:text-[#e2e2e8]" onClick={() => move(p.id, 1)} title="Mover para baixo">↓</button>
                        <button className="p-1 text-[#ef4444] hover:text-red-300" onClick={() => remove(p.id)} title="Remover">
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
      <div className="px-6 py-4 border-t border-[#1e1e2e] bg-[#0d0d14]/60 flex-shrink-0 flex items-center justify-between">
        <span className="text-xs text-[#3a3a52]">
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

// ─── Rewards Builder ─────────────────────────────────────────────────────────
const REWARD_COLS: Col[] = [
  { id: 'item', name: 'Item / Arquivo', width: 140 },
  { id: 'qty', name: 'Quantidade / Nome', width: 320 },
];
const DEFAULT_REWARD_ROWS = (): GridRow[] => [
  { id: nanoid(4), cells: { item: '', qty: '' } },
];

// ─── Main Modal ───────────────────────────────────────────────────────────────
export const TableBuilderModal: React.FC = () => {
  const isOpen = useEditorStore(s => s.isTableBuilderOpen);
  const setOpen = useEditorStore(s => s.setTableBuilderOpen);
  const activeTabId = useEditorStore(s => s.activeTabId);
  const updateTabContent = useEditorStore(s => s.updateTabContent);
  const tabs = useEditorStore(s => s.tabs);

  type Mode = 'blank' | 'npc' | 'rewards';
  const [mode, setMode] = useState<Mode>('blank');
  const [gridCols, setGridCols] = useState<Col[]>([
    { id: 'c1', name: 'Coluna 1', width: 200 },
    { id: 'c2', name: 'Coluna 2', width: 200 },
    { id: 'c3', name: 'Coluna 3', width: 200 },
  ]);
  const [gridRows, setGridRows] = useState<GridRow[]>([
    { id: 'r1', cells: { c1: '', c2: '', c3: '' } },
    { id: 'r2', cells: { c1: '', c2: '', c3: '' } },
    { id: 'r3', cells: { c1: '', c2: '', c3: '' } },
  ]);
  const [rewardRows, setRewardRows] = useState<GridRow[]>(DEFAULT_REWARD_ROWS);
  const [xpText, setXpText] = useState('');
  const [hasXpRow, setHasXpRow] = useState(false);

  const activeContent = tabs.find(t => t.id === activeTabId)?.content ?? '';

  const insert = (wikitext: string) => {
    const view = (window as any).activeEditorView;
    if (view) {
      const { from, to } = view.state.selection.main;
      view.dispatch({ changes: { from, to, insert: wikitext }, selection: { anchor: from + wikitext.length } });
      view.focus();
    } else if (activeTabId) {
      updateTabContent(activeTabId, activeContent + '\n' + wikitext);
    }
    setOpen(false);
  };

  const handleGridInsert = () => insert(gridToWiki(gridCols, gridRows));
  const handleRewardsInsert = () => insert(rewardsToWiki(rewardRows, hasXpRow ? xpText : ''));

  if (!isOpen) return null;

  const TABS: { id: Mode; label: string; icon: string }[] = [
    { id: 'blank', label: 'Grade Livre', icon: '📐' },
    { id: 'npc', label: 'Duelo NPC', icon: '⚔️' },
    { id: 'rewards', label: 'Recompensas', icon: '🎁' },
  ];

  return (
    <div className="pxg-modal-overlay" style={{ zIndex: 9999 }}>
      <div
        className="pxg-modal"
        style={{ width: '92vw', maxWidth: '1400px', height: '88vh', fontFamily: 'Inter, Segoe UI, sans-serif' }}
      >
        {/* Header */}
        <div className="pxg-modal-header" style={{ padding: '18px 28px' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, #6d28d9, #4c1d95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
              boxShadow: '0 4px 12px rgba(109,40,217,0.4)'
            }}>📊</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#e2e2e8', lineHeight: 1.2 }}>Construtor de Tabelas Wiki</div>
              <p className="text-xs text-[#6b6b80] mt-0.5">
                Clique em qualquer célula para editar. Digite <kbd className="bg-[#1e1e2e] px-1 rounded text-[#a78bfa] font-mono text-[10px]">/</kbd> para buscar um Pokémon ou arquivo.
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="pxg-modal-close"><X size={16} /></button>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[#1e1e2e] bg-[#111118] flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-t-lg border-b-[3px] transition-all duration-200 ease-in-out ${
                mode === tab.id
                  ? 'text-[#e2e2e8] border-[#7c3aed] bg-[#0d0d14]'
                  : 'text-[#5a5a72] border-transparent hover:text-[#a78bfa] hover:bg-[#16161f]/60'
              }`}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {mode === tab.id && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></span>}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {mode === 'blank' && (
            <>
              <div className="flex items-center justify-between px-6 py-2 border-b border-[#1e1e2e] bg-[#0d0d14]/40 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></div>
                  <span className="text-xs text-[#5a5a72] font-medium">{gridRows.length} linhas × {gridCols.length} colunas</span>
                </div>
              </div>
              <FreeGrid cols={gridCols} rows={gridRows} onColsChange={setGridCols} onRowsChange={setGridRows} />
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1e1e2e] bg-[#0d0d14] flex-shrink-0">
                <button onClick={() => setOpen(false)} className="pxg-btn-secondary" style={{ padding: '10px 20px' }}>Cancelar</button>
                <button onClick={handleGridInsert} className="pxg-btn-primary flex items-center gap-2" style={{ padding: '10px 22px' }}>
                  <Check size={16} /> Inserir no Editor
                </button>
              </div>
            </>
          )}

          {mode === 'npc' && (
            <NpcDuelBuilder onGenerate={insert} />
          )}

          {mode === 'rewards' && (
            <>
              {/* Rewards toolbar */}
              <div className="flex items-center justify-between px-6 py-2.5 border-b border-[#1e1e2e] bg-[#0d0d14]/40 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></div>
                    <span className="text-xs text-[#5a5a72] font-medium">Tabela de Recompensas • {rewardRows.length} {rewardRows.length === 1 ? 'item' : 'itens'}</span>
                  </div>
                </div>
                {/* XP Row toggle */}
                <button
                  onClick={() => setHasXpRow(v => !v)}
                  className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                    hasXpRow
                      ? 'bg-[#4a0080]/30 border-[#7c3aed]/60 text-[#c084fc]'
                      : 'bg-[#16161f] border-[#2a2a3e] text-[#5a5a72] hover:border-[#7c3aed]/40 hover:text-[#a78bfa]'
                  }`}
                >
                  <span style={{ fontSize: 14 }}>⭐</span>
                  {hasXpRow ? 'Linha de XP Ativa' : 'Adicionar Linha de XP'}
                </button>
              </div>

              {/* XP row editor (visible when toggled) */}
              {hasXpRow && (
                <div className="flex items-center gap-3 px-6 py-3 border-b border-[#1e1e2e] bg-[#4a0080]/10 flex-shrink-0">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <img
                      src={wikiUrl('Exp_icon.png')}
                      alt="EXP"
                      className="w-7 h-7 object-contain"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="text-[11px] font-bold text-[#c084fc] uppercase tracking-wider">XP</span>
                  </div>
                  <input
                    className="flex-1 bg-[#1a0030] border border-[#7c3aed]/50 rounded-lg px-4 py-2 text-sm font-bold text-[#c084fc] outline-none focus:border-[#a78bfa] placeholder-[#5a3a72] transition-colors"
                    placeholder="Ex: Experiência: 8.000"
                    value={xpText}
                    onChange={e => setXpText(e.target.value)}
                  />
                  <div className="text-xs text-[#5a5a72] flex-shrink-0">↳ última linha</div>
                </div>
              )}

              <FreeGrid cols={REWARD_COLS} rows={rewardRows} onColsChange={() => {}} onRowsChange={setRewardRows} />
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#1e1e2e] bg-[#0d0d14] flex-shrink-0">
                <button onClick={() => setOpen(false)} className="pxg-btn-secondary" style={{ padding: '10px 20px' }}>Cancelar</button>
                <button onClick={handleRewardsInsert} className="pxg-btn-primary flex items-center gap-2" style={{ padding: '10px 22px' }}>
                  <Check size={16} /> Inserir no Editor
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
