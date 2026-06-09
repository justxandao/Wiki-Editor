import { useEffect, useState } from 'react';
import { useEditorStore } from '../state/editorStore';
import { useEditorViewStore } from '../state/editorViewStore';
import { TopBar } from './components/TopBar';
import wikiLogo from '../assets/wiki.png';
import { TabBar } from './components/TabBar';
import { StatusBar } from './components/StatusBar';
import { LibraryPanel } from './components/LibraryPanel';
import { SearchPanel } from './components/SearchPanel';
import { EmptyState } from './components/EmptyState';
import { WikiEditor } from '../editor/WikiEditor';
import { WikiPreview } from '../preview/components/WikiPreview';
import { initializePokemonIndex } from '../pokemon/pokemon-service';
import { PokedexBuilder } from '../pokedex/builder/PokedexBuilder';
import { TableBuilderModal } from '../saas-table/components/TableBuilderModal';
import { PanelLeft } from 'lucide-react';
import { useResizer } from '../hooks/useResizer';

export function AppShell() {
  const {
    tabs, activeTabId, mode, sidebarPanel, sidebarWidth, setSidebarWidth,
    updateTabContent, createTab, persistTab, showToast, toast, dismissToast,
    isLoading, loadPersistedState, setTheme, theme, setSidebarPanel,
  } = useEditorStore();

  const activeTab = tabs.find((t) => t.id === activeTabId);
  const [splitRatio, setSplitRatio] = useState(50);

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
          persistTab(activeTabId).then(() => showToast('Salvo!', 'success'));
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

  // Resizers via hook
  const sidebarResizer = useResizer({
    value: sidebarWidth,
    onChange: setSidebarWidth,
    min: 200,
    max: 600,
    mode: 'pixels',
  });

  const splitResizer = useResizer({
    value: splitRatio,
    onChange: setSplitRatio,
    min: 10,
    max: 90,
    mode: 'ratio',
  });

  if (isLoading) {
    return (
      <div style={{
        height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)', flexDirection: 'column', gap: 16,
      }}>
        <img 
          src={wikiLogo} 
          alt="Wiki" 
          style={{ 
            width: 48, 
            height: 48, 
            objectFit: 'contain', 
            backgroundColor: '#353671',
            borderRadius: 12,
            boxShadow: '0 8px 32px rgba(168, 85, 247, 0.3)',
            animation: 'pulse-glow 2s ease-in-out infinite'
          }} 
        />
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>Carregando WikiPokexGames Editor...</div>
      </div>
    );
  }

  const showSidebar = sidebarPanel !== null;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', background: 'transparent' }}>
      <TopBar />
      <TabBar />

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Edge hover for sidebar */}
        {!showSidebar && (
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 0,
              width: 16,
              zIndex: 40,
            }}
            onMouseEnter={(e) => {
              const btn = e.currentTarget.querySelector('button') as HTMLButtonElement | null;
              if (btn) btn.style.opacity = '1';
            }}
            onMouseLeave={(e) => {
              const btn = e.currentTarget.querySelector('button') as HTMLButtonElement | null;
              if (btn) btn.style.opacity = '0';
            }}
            onMouseMove={(e) => {
              const btn = e.currentTarget.querySelector('button') as HTMLButtonElement | null;
              if (btn) {
                const rect = e.currentTarget.getBoundingClientRect();
                const y = e.clientY - rect.top;
                const halfBtn = 16;
                let top = y - halfBtn;
                if (top < 0) top = 0;
                if (top > rect.height - 32) top = rect.height - 32;
                btn.style.top = top + 'px';
              }
            }}
          >
            <button
              onClick={() => setSidebarPanel('library')}
              style={{
                position: 'absolute',
                left: 4,
                top: '50%',
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                opacity: 0,
                transition: 'opacity 0.2s, background 0.2s, color 0.2s',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-overlay)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)';
                (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)';
              }}
            >
              <PanelLeft size={16} />
            </button>
          </div>
        )}

        {/* Sidebar */}
        {showSidebar && (
          <>
            <div
              className="sidebar-panel wiki-container"
              style={{ width: sidebarWidth, minWidth: 200, maxWidth: 600, display: 'flex', flexDirection: 'column', marginTop: '2.2rem', marginLeft: '1rem', marginRight: '0.4rem' }}
            >
              {sidebarPanel === 'library' && <LibraryPanel />}
              {sidebarPanel === 'search' && <SearchPanel />}
            </div>
            <div
              className="resizer"
              style={{
                width: 4,
                cursor: 'col-resize',
                zIndex: 50,
                borderRight: '1px solid #1e1e2e',
                background: 'transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--accent-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              onMouseDown={sidebarResizer.onMouseDown}
            />
          </>
        )}

        {/* Editor + Preview area */}
        <div className="wiki-container" style={{ flex: 1, display: 'flex', overflow: 'hidden', minWidth: 0, marginTop: '2.2rem', marginRight: '1rem' }}>
          {/* Code Editor */}
          {(mode === 'code' || mode === 'split') && (
            <div style={{
              flex: mode === 'split' ? `0 0 ${splitRatio}%` : 1,
              overflow: 'hidden',
            }}>
              {activeTab ? (
                <WikiEditor
                  key={activeTab.id}
                  tabId={activeTab.id}
                  content={activeTab.content}
                  onChange={(val) => updateTabContent(activeTab.id, val)}
                />
              ) : (
                <EmptyState onCreate={() => createTab()} />
              )}
            </div>
          )}

          {/* Split Resizer */}
          {mode === 'split' && (
            <div
              className="resizer"
              style={{
                width: 4,
                cursor: 'col-resize',
                zIndex: 50,
                borderRight: '1px solid var(--border-subtle)',
                background: 'transparent',
                transition: 'background 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'var(--accent-primary)'; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
              onMouseDown={splitResizer.onMouseDown}
            />
          )}

          {/* Preview */}
          {(mode === 'preview' || mode === 'split') && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
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
