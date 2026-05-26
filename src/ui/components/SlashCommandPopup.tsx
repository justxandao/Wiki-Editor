import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { searchPokemon, buildPokemonWikiText, getPokemonSpriteUrl, PokemonEntry } from '../../pokemon/pokemon-service';
import { searchBerries, buildBerryWikiText, getBerrySpriteUrl, BerryEntry } from '../../pokemon/berry-service';
import { BUILTIN_COMMANDS, SlashCommand, replaceSlashCommand } from '../../editor/slash-commands/slash-commands';
import Fuse from 'fuse.js';

interface SlashItem {
  id: string;
  label: string;
  description: string;
  icon?: string;
  spriteUrl?: string;
  dex?: number;
  category: 'pokemon' | 'berry' | 'template' | 'structure' | 'format' | 'file';
  onSelect: () => void;
}

interface SlashCommandPopupProps {
  view: EditorView;
  query: string;
  from: number;
  to: number;
  position: { x: number; y: number };
  onClose: () => void;
}

const fuse = new Fuse(BUILTIN_COMMANDS, {
  keys: ['label', 'keywords', 'description'],
  threshold: 0.4,
});

const CATEGORY_LABELS: Record<string, string> = {
  pokemon: '⚡ Pokémon',
  berry: '🍓 Berries',
  template: '📋 Templates',
  structure: '🏗️ Estruturas',
  format: '✏️ Formatação',
  file: '🖼️ Banner da Wiki',
};

function getRelevanceScore(label: string, query: string): number {
  const normLabel = label.toLowerCase();
  const normQuery = query.toLowerCase();

  // 1. Exact match
  if (normLabel === normQuery) return 0;
  
  // 2. Starts with query (prefix match)
  if (normLabel.startsWith(normQuery)) return 1;

  // 3. One of the words in the label starts with query
  const words = normLabel.split(/\s+/);
  if (words.some(w => w.startsWith(normQuery))) return 2;

  // 4. Contains query
  if (normLabel.includes(normQuery)) return 3;

  // 5. Fallback fuzzy
  return 4;
}

export function SlashCommandPopup({ view, query, from, to, position, onClose }: SlashCommandPopupProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const [fileResults, setFileResults] = useState<string[]>([]);
  const [isSearchingFiles, setIsSearchingFiles] = useState(false);

  // Live File Search
  useEffect(() => {
    const q = query.toLowerCase();
    let isFileSearch = false;
    let searchQuery = '';

    if (q.startsWith('banner ')) {
      isFileSearch = true;
      searchQuery = 'banner ' + query.substring(7).trim();
    } else if (q.startsWith('arquivo ')) {
      isFileSearch = true;
      searchQuery = query.substring(8).trim();
    } else if (q.startsWith('file ')) {
      isFileSearch = true;
      searchQuery = query.substring(5).trim();
    }

    if (isFileSearch) {
      if (searchQuery.length >= 1) {
        setIsSearchingFiles(true);
        // Use a broader search: append * for prefix/wildcard matching
        const apiTerm = searchQuery.length < 3 ? searchQuery + '*' : searchQuery;
        const url = `https://wiki.pokexgames.com/api.php?action=query&list=search&srsearch=${encodeURIComponent(apiTerm)}&srnamespace=6&srlimit=12&format=json&origin=*`;
        fetch(url)
          .then(r => r.json())
          .then(data => {
            if (data.query?.search) {
              setFileResults(data.query.search.map((s: any) => s.title));
            } else {
              setFileResults([]);
            }
          })
          .catch(() => setFileResults([]))
          .finally(() => setIsSearchingFiles(false));
      } else {
        setFileResults([]);
      }
    } else {
      setFileResults([]);
    }
  }, [query]);

  // Build item list
  const items: SlashItem[] = React.useMemo(() => {
    const pokemonItems: SlashItem[] = [];
    const commandItems: SlashItem[] = [];
    const fileItems: SlashItem[] = [];

    // Async File Results
    for (const title of fileResults) {
      const filename = title.replace(/^(Arquivo|File):/i, '').trim();
      fileItems.push({
        id: `file-${filename}`,
        label: filename,
        description: `Importar arquivo da wiki`,
        spriteUrl: `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(filename)}`,
        category: 'file',
        onSelect: () => {
          replaceSlashCommand(view, from, to, `[[Arquivo:${filename}]]`);
          onClose();
        },
      });
    }

    // Pokemon results (always search)
    const pokeResults = searchPokemon(query, 8);
    for (const { key, entry } of pokeResults) {
      pokemonItems.push({
        id: `poke-${key}`,
        label: entry.name,
        description: entry.dex ? `#${String(entry.dex).padStart(3, '0')} · ${entry.types.join('/')}` : 'Ícone / Elemento',
        spriteUrl: getPokemonSpriteUrl(entry),
        dex: entry.dex,
        category: 'pokemon',
        onSelect: () => {
          replaceSlashCommand(view, from, to, buildPokemonWikiText(entry));
          onClose();
        },
      });
    }

    // Berry results (always search)
    const berryItems: SlashItem[] = [];
    const berryResults = searchBerries(query, 8);
    for (const entry of berryResults) {
      berryItems.push({
        id: `berry-${entry.name}`,
        label: entry.name,
        description: `${entry.category} · ${entry.description}`,
        spriteUrl: getBerrySpriteUrl(entry),
        category: 'berry',
        onSelect: () => {
          replaceSlashCommand(view, from, to, buildBerryWikiText(entry));
          onClose();
        },
      });
    }

    // Built-in commands - filter by query
    let cmds: SlashCommand[];
    if (!query.trim()) {
      cmds = BUILTIN_COMMANDS;
    } else {
      cmds = fuse.search(query).map(r => r.item);
    }

    for (const cmd of cmds) {
      commandItems.push({
        id: cmd.id,
        label: cmd.label,
        description: cmd.description,
        icon: cmd.icon,
        category: cmd.category,
        onSelect: () => {
          // Replace the slash command trigger text first
          view.dispatch({ changes: { from, to, insert: '' } });
          cmd.execute(view, query);
          onClose();
        },
      });
    }

    // Sort suggestions by relevance using getRelevanceScore
    const merged = [...fileItems, ...pokemonItems, ...berryItems, ...commandItems];
    if (query.trim()) {
      return merged.sort((a, b) => {
        const scoreA = getRelevanceScore(a.label, query);
        const scoreB = getRelevanceScore(b.label, query);
        if (scoreA !== scoreB) {
          return scoreA - scoreB;
        }
        
        // Consistent category grouping when similarity score is identical
        const catOrder: Record<string, number> = { file: 1, pokemon: 2, berry: 3, template: 4, structure: 5, format: 6 };
        const orderA = catOrder[a.category] ?? 99;
        const orderB = catOrder[b.category] ?? 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        return a.label.localeCompare(b.label);
      });
    }
    return merged;
  }, [query, from, to, view, onClose, fileResults]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex(i => (i + 1) % items.length);
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex(i => (i - 1 + items.length) % items.length);
      }
      if (e.key === 'Enter' || e.key === 'Tab') {
        e.preventDefault();
        if (items[activeIndex]) {
          items[activeIndex].onSelect();
        }
      }
    };
    window.addEventListener('keydown', handleKey, true);
    return () => window.removeEventListener('keydown', handleKey, true);
  }, [items, activeIndex, onClose]);

  // Scroll active into view
  useEffect(() => {
    const el = listRef.current?.querySelector('.active');
    el?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  // Reset active when query changes
  useEffect(() => { setActiveIndex(0); }, [query]);

  if (items.length === 0 && !isSearchingFiles) return null;

  // Group by category
  const groups = new Map<string, SlashItem[]>();
  for (const item of items) {
    const g = groups.get(item.category) ?? [];
    g.push(item);
    groups.set(item.category, g);
  }

  // Position: clamp to viewport
  const MAX_HEIGHT = 400;
  const style: React.CSSProperties = {
    left: Math.min(position.x, window.innerWidth - 420),
    top: position.y + 8,
  };
  if (position.y + MAX_HEIGHT > window.innerHeight) {
    style.top = position.y - MAX_HEIGHT - 8;
  }

  let globalIdx = 0;

  return (
    <div className="slash-command-popup" style={style}>
      <div className="slash-command-header">
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⚡</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
          {query ? `/${query}` : 'Comandos — digite para filtrar'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>ESC para fechar</span>
      </div>

      <div className="slash-command-list" ref={listRef}>
        {Array.from(groups.entries()).map(([category, groupItems]) => (
          <div className="slash-command-section" key={category}>
            <div className="slash-command-section-label">{CATEGORY_LABELS[category] ?? category}</div>
            {groupItems.map(item => {
              const idx = globalIdx++;
              const isActive = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  className={`slash-command-item ${isActive ? 'active' : ''}`}
                  onMouseDown={e => { e.preventDefault(); item.onSelect(); }}
                  onMouseEnter={() => setActiveIndex(idx)}
                >
                  <div className="slash-command-item-icon">
                    {item.spriteUrl ? (
                      <img src={item.spriteUrl} alt={item.label} />
                    ) : (
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                    )}
                  </div>
                  <div className="slash-command-item-content">
                    <div className="slash-command-item-name">{item.label}</div>
                    <div className="slash-command-item-desc">{item.description}</div>
                  </div>
                  {item.dex && (
                    <span className="slash-command-item-badge">#{String(item.dex).padStart(3, '0')}</span>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
