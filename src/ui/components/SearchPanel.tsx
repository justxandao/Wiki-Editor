import React from 'react';
import { useEditorStore } from '../../state/editorStore';

export function SearchPanel() {
  const [query, setQuery] = React.useState('');
  const tabs = useEditorStore((s) => s.tabs);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const activeTab = tabs.find((t) => t.id === activeTabId);

  const results = React.useMemo(() => {
    if (!query.trim() || !activeTab) return [];
    const lines = activeTab.content.split('\n');
    return lines
      .map((line, i) => ({ line: i + 1, text: line, match: line.toLowerCase().includes(query.toLowerCase()) }))
      .filter((r) => r.match)
      .slice(0, 50);
  }, [query, activeTab]);

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar no documento..."
        autoFocus
        style={{
          width: '100%', padding: '7px 10px',
          background: 'var(--bg-primary)', border: '1px solid var(--border-default)',
          borderRadius: 'var(--radius-md)', color: 'var(--text-primary)',
          fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none',
        }}
      />
      <div style={{ overflow: 'auto', flex: 1 }}>
        {results.length === 0 && query && (
          <div style={{ color: 'var(--text-muted)', fontSize: 12, padding: '8px 4px' }}>Nenhum resultado.</div>
        )}
        {results.map((r) => (
          <div
            key={r.line}
            style={{
              padding: '6px 8px', fontSize: 12, cursor: 'pointer', borderRadius: 'var(--radius-sm)',
              display: 'flex', gap: 8, alignItems: 'baseline',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-overlay)')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <span style={{ color: 'var(--text-muted)', fontFamily: 'JetBrains Mono, monospace', minWidth: 28 }}>{r.line}</span>
            <span style={{ color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {r.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
