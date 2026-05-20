import React, { useState } from 'react';
import { useEditorStore } from '../../state/editorStore';
import { searchPokemon, getPokemonSpriteUrl } from '../../pokemon/pokemon-service';
import { searchBerries, getBerrySpriteUrl, buildBerryWikiText } from '../../pokemon/berry-service';

const LIBRARY_SNIPPETS = [
  { id: 'wikitable', label: 'Wikitable', icon: '📊', category: 'Estruturas',
    code: '{| class="wikitable"\n! Col 1\n! Col 2\n|-\n| Dado\n| Dado\n|}' },
  { id: 'h2', label: 'Título H2', icon: '#️⃣', category: 'Formatação',
    code: '== Título ==\n' },
  { id: 'h3', label: 'Sub-título H3', icon: '##', category: 'Formatação',
    code: '=== Sub-título ===\n' },
  { id: 'bold', label: 'Negrito', icon: 'B', category: 'Formatação',
    code: "'''texto'''" },
  { id: 'italic', label: 'Itálico', icon: 'I', category: 'Formatação',
    code: "''texto''" },
  { id: 'link', label: 'Link Wiki', icon: '🔗', category: 'Formatação',
    code: '[[Página|Texto]]' },
  { id: 'ref', label: 'Referência', icon: '📌', category: 'Formatação',
    code: '<ref>Fonte aqui</ref>' },
];

const TABS = ['Biblioteca', 'Pokémon', 'Berries', 'Outline'] as const;
type LibTab = typeof TABS[number];

export function LibraryPanel() {
  const [activeTab, setActiveTab] = useState<LibTab>('Biblioteca');
  const [pokemonQuery, setPokemonQuery] = useState('');
  const [berryQuery, setBerryQuery] = useState('');
  const activeTabId = useEditorStore(s => s.activeTabId);
  const tabs = useEditorStore(s => s.tabs);
  const updateTabContent = useEditorStore(s => s.updateTabContent);

  const activeContent = tabs.find(t => t.id === activeTabId)?.content ?? '';

  const insertSnippet = (code: string) => {
    const view = (window as any).activeEditorView;
    if (view) {
      const { from, to } = view.state.selection.main;
      view.dispatch({
        changes: { from, to, insert: code },
        selection: { anchor: from + code.length }
      });
      view.focus();
    } else {
      if (!activeTabId) return;
      updateTabContent(activeTabId, activeContent + '\n' + code);
    }
  };

  const handleSnippetClick = (item: typeof LIBRARY_SNIPPETS[number]) => {
    const view = (window as any).activeEditorView;
    if (view) {
      const { from, to } = view.state.selection.main;
      const selectedText = view.state.doc.sliceString(from, to);
      let textToInsert = item.code;

      if (selectedText.length > 0) {
        if (item.id === 'bold') {
          textToInsert = `'''${selectedText}'''`;
        } else if (item.id === 'italic') {
          textToInsert = `''${selectedText}''`;
        } else if (item.id === 'link') {
          textToInsert = `[[${selectedText}]]`;
        } else if (item.id === 'h2') {
          textToInsert = `== ${selectedText} ==\n`;
        } else if (item.id === 'h3') {
          textToInsert = `=== ${selectedText} ===\n`;
        } else if (item.id === 'ref') {
          textToInsert = `<ref>${selectedText}</ref>`;
        }
      }

      view.dispatch({
        changes: { from, to, insert: textToInsert },
        selection: { anchor: from + textToInsert.length }
      });
      view.focus();
    } else {
      insertSnippet(item.code);
    }
  };

  const pokeResults = searchPokemon(pokemonQuery, 20);
  const berryResults = searchBerries(berryQuery, 20);

  // Build outline from content
  const outline = React.useMemo(() => {
    const lines = activeContent.split('\n');
    return lines
      .map((line, i) => {
        const m = line.match(/^(={1,6})\s*(.+?)\s*\1\s*$/);
        if (!m) return null;
        return { level: m[1].length, text: m[2], line: i };
      })
      .filter(Boolean);
  }, [activeContent]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Tab bar */}
      <div style={{
        display: 'flex',
        borderBottom: '1px solid var(--border-subtle)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        {TABS.map(t => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            style={{
              flex: 1,
              padding: '8px 4px',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === t ? '2px solid var(--accent-primary)' : '2px solid transparent',
              color: activeTab === t ? 'var(--text-primary)' : 'var(--text-muted)',
              fontSize: 12,
              fontWeight: activeTab === t ? 600 : 400,
              cursor: 'pointer',
              transition: 'all 0.15s',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeTab === 'Biblioteca' && (
          <div style={{ padding: 8 }}>
            {Object.entries(
              LIBRARY_SNIPPETS.reduce((acc, s) => {
                (acc[s.category] = acc[s.category] ?? []).push(s);
                return acc;
              }, {} as Record<string, typeof LIBRARY_SNIPPETS>)
            ).map(([cat, items]) => (
              <div key={cat} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', padding: '6px 8px 2px' }}>
                  {cat}
                </div>
                {items.map(item => (
                  <div
                    key={item.id}
                    className="library-item"
                    onClick={() => handleSnippetClick(item)}
                    title={item.code}
                  >
                    <div className="library-item-icon">
                      <span style={{ fontSize: 14 }}>{item.icon}</span>
                    </div>
                    <span>{item.label}</span>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>⊕</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'Pokémon' && (
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              value={pokemonQuery}
              onChange={e => setPokemonQuery(e.target.value)}
              placeholder="Buscar Pokémon..."
              style={{
                width: '100%',
                padding: '7px 10px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {pokeResults.map(({ key, entry }) => (
                <div
                  key={key}
                  className="library-item"
                  onClick={() => insertSnippet(`[[Arquivo:${entry.image}|link=${entry.wikilink}]] '''[[${entry.wikilink}]]'''`)}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <img
                    src={getPokemonSpriteUrl(entry)}
                    alt={entry.name}
                    style={{ width: 28, height: 28, objectFit: 'contain', imageRendering: 'pixelated', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{entry.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>#{String(entry.dex).padStart(3, '0')} · {entry.types.join('/')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Berries' && (
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <input
              value={berryQuery}
              onChange={e => setBerryQuery(e.target.value)}
              placeholder="Buscar Berries..."
              style={{
                width: '100%',
                padding: '7px 10px',
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
                fontSize: 13,
                fontFamily: 'Inter, sans-serif',
                outline: 'none',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {berryResults.map(entry => (
                <div
                  key={entry.name}
                  className="library-item"
                  onClick={() => insertSnippet(buildBerryWikiText(entry))}
                  style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                >
                  <img
                    src={getBerrySpriteUrl(entry)}
                    alt={entry.name}
                    style={{ width: 28, height: 28, objectFit: 'contain', imageRendering: 'pixelated', flexShrink: 0 }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{entry.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.category} · {entry.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'Outline' && (
          <div style={{ padding: 8 }}>
            {outline.length === 0 ? (
              <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '16px 8px', textAlign: 'center' }}>
                Nenhuma seção encontrada.<br />
                <span style={{ fontSize: 11 }}>Use == Título == para criar seções.</span>
              </div>
            ) : (
              outline.map((item, i) => item && (
                <div
                  key={i}
                  style={{
                    paddingLeft: `${(item.level - 1) * 12 + 8}px`,
                    paddingTop: 5,
                    paddingBottom: 5,
                    fontSize: 12,
                    color: item.level === 1 ? 'var(--accent-secondary)' : item.level === 2 ? 'var(--text-secondary)' : 'var(--text-muted)',
                    fontWeight: item.level <= 2 ? 600 : 400,
                    cursor: 'pointer',
                    borderRadius: 'var(--radius-sm)',
                    transition: 'background 0.1s',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ opacity: 0.4, fontSize: 10 }}>{'▸'.repeat(item.level)}</span>
                  {item.text}
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Footer hint */}
      <div style={{
        padding: '8px 12px',
        borderTop: '1px solid var(--border-subtle)',
        fontSize: 10,
        color: 'var(--text-muted)',
        background: 'var(--bg-secondary)',
        flexShrink: 0,
      }}>
        💡 Digite <kbd style={{ background: 'var(--bg-overlay)', padding: '1px 4px', borderRadius: 3, fontSize: 10 }}>/</kbd> no editor para slash commands
      </div>
    </div>
  );
}
