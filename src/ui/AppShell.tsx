import React, { useEffect, useCallback } from 'react';
import { useEditorStore } from '../state/editorStore';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { StatusBar } from './components/StatusBar';
import { LibraryPanel } from './components/LibraryPanel';
import { WikiEditor } from '../editor/WikiEditor';
import { WikiPreview } from '../preview/components/WikiPreview';
import { initializePokemonIndex } from '../pokemon/pokemon-service';
import { PokedexBuilder } from '../pokedex/builder/PokedexBuilder';
import { TableBuilderModal } from '../saas-table/components/TableBuilderModal';

export function AppShell() {
  const {
    tabs, activeTabId, mode, sidebarPanel, sidebarWidth,
    updateTabContent, createTab, persistTab, showToast, toast, dismissToast,
    isLoading, loadPersistedState, setTheme, theme,
  } = useEditorStore();

  const activeTab = tabs.find(t => t.id === activeTabId);

  // Load persisted state on mount
  useEffect(() => {
    loadPersistedState();
    initializePokemonIndex();
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (activeTabId) {
          persistTab(activeTabId).then(() => showToast('✅ Salvo!', 'success'));
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 't') {
        e.preventDefault();
        createTab();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeTabId, createTab, persistTab, showToast]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  if (isLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: 'linear-gradient(135deg, #f78166, #bc8cff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
          animation: 'pulse-glow 2s ease-in-out infinite',
        }}>
          ⚡
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando WikiPokexGames Editor...</div>
      </div>
    );
  }

  const showSidebar = sidebarPanel !== null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <TopBar />
      <TabBar />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {/* Sidebar */}
        {showSidebar && (
          <div
            className="sidebar-panel"
            style={{ width: sidebarWidth, minWidth: 200, maxWidth: 400, display: 'flex', flexDirection: 'column', background: '#111118', borderRight: '1px solid #1e1e2e' }}
          >
            {sidebarPanel === 'library' && <LibraryPanel />}
            {sidebarPanel === 'search' && <SearchPanel />}
          </div>
        )}

        {/* Editor + Preview area */}
        <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0 }}>
          {/* Code Editor */}
          {(mode === 'code' || mode === 'split') && (
            <div style={{
              flex: mode === 'split' ? '1 1 50%' : 1,
              overflow: 'hidden',
              borderRight: mode === 'split' ? '1px solid var(--border-subtle)' : 'none',
            }}>
              {activeTab ? (
                <WikiEditor
                  key={activeTab.id}
                  tabId={activeTab.id}
                  content={activeTab.content}
                  onChange={val => updateTabContent(activeTab.id, val)}
                />
              ) : (
                <EmptyState onCreate={() => createTab()} />
              )}
            </div>
          )}

          {/* Preview */}
          {(mode === 'preview' || mode === 'split') && (
            <div style={{ flex: mode === 'split' ? '1 1 50%' : 1, overflow: 'hidden' }}>
              <WikiPreview content={activeTab?.content ?? ''} />
            </div>
          )}
        </div>
      </div>

      <StatusBar />

      {/* Toast notification */}
      {toast && (
        <div
          className="toast"
          onClick={dismissToast}
          style={{
            borderLeft: `4px solid ${
              toast.type === 'success' ? 'var(--accent-success)' :
              toast.type === 'error' ? 'var(--accent-danger)' :
              'var(--accent-secondary)'
            }`,
          }}
        >
          <span style={{ fontSize: 14 }}>
            {toast.type === 'success' ? '✅' : toast.type === 'error' ? '❌' : 'ℹ️'}
          </span>
          <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{toast.message}</span>
        </div>
      )}

      {/* Pokédex Builder Modal */}
      <PokedexBuilder />
      <TableBuilderModal />
    </div>
  );
}

function EmptyState({ onCreate }: { onCreate: () => void }) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 16,
      color: 'var(--text-muted)',
    }}>
      <div style={{ fontSize: 48 }}>⚡</div>
      <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-secondary)', fontFamily: 'Outfit, sans-serif' }}>
        WikiPokexGames Editor
      </div>
      <div style={{ fontSize: 13, textAlign: 'center', maxWidth: 320 }}>
        Nenhuma aba aberta. Crie uma nova página para começar a editar WikiText.
      </div>
      <button
        onClick={onCreate}
        style={{
          padding: '10px 24px',
          background: 'var(--accent-primary)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          color: '#fff',
          fontSize: 14,
          fontWeight: 600,
          cursor: 'pointer',
          fontFamily: 'Inter, sans-serif',
        }}
      >
        + Nova Página
      </button>
    </div>
  );
}

function SearchPanel() {
  const [query, setQuery] = React.useState('');
  const tabs = useEditorStore(s => s.tabs);
  const activeTabId = useEditorStore(s => s.activeTabId);
  const activeTab = tabs.find(t => t.id === activeTabId);

  const results = React.useMemo(() => {
    if (!query.trim() || !activeTab) return [];
    const lines = activeTab.content.split('\n');
    return lines
      .map((line, i) => ({ line: i + 1, text: line, match: line.toLowerCase().includes(query.toLowerCase()) }))
      .filter(r => r.match)
      .slice(0, 50);
  }, [query, activeTab]);

  return (
    <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
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
        {results.map(r => (
          <div key={r.line} style={{
            padding: '6px 8px', fontSize: 12, cursor: 'pointer', borderRadius: 'var(--radius-sm)',
            display: 'flex', gap: 8, alignItems: 'baseline',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-overlay)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
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
