import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorView } from '@codemirror/view';
import { searchPokemon, buildPokemonWikiText, getPokemonSpriteUrl, PokemonEntry } from '../../pokemon/pokemon-service';
import { BUILTIN_COMMANDS, SlashCommand, replaceSlashCommand } from '../../editor/slash-commands/slash-commands';
import Fuse from 'fuse.js';

interface SlashItem {
  id: string;
  label: string;
  description: string;
  icon?: string;
  spriteUrl?: string;
  dex?: number;
  category: 'pokemon' | 'template' | 'structure' | 'format';
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
  template: '📋 Templates',
  structure: '🏗️ Estruturas',
  format: '✏️ Formatação',
  file: '🖼️ Banner da Wiki',
};

export function SlashCommandPopup({ view, query, from, to, position, onClose }: SlashCommandPopupProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);
  const [fileResults, setFileResults] = useState<string[]>([]);
  const [isSearchingFiles, setIsSearchingFiles] = useState(false);

  // Live File Search
  useEffect(() => {
    const q = query.toLowerCase();
    if (q.startsWith('banner ')) {
      const searchTerm = query.substring(q.indexOf(' ') + 1).trim();
      if (searchTerm.length >= 2) {
        setIsSearchingFiles(true);
        const url = `https://wiki.pokexgames.com/api.php?action=query&list=search&srsearch=File:${encodeURIComponent('banner ' + searchTerm)}&srnamespace=6&format=json&origin=*`;
        fetch(url)
          .then(r => r.json())
          .then(data => {
            if (data.query?.search) {
              setFileResults(data.query.search.map((s: any) => s.title));
            }
          })
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
        description: `Importar banner da wiki`,
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

    // Always put specific files first if searching
    return [...fileItems, ...pokemonItems, ...commandItems];
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
