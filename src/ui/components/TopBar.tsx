import React, { useState } from 'react';
import { useEditorStore } from '../../state/editorStore';
import { usePokedexUIStore } from '../../pokedex/store/pokedexStore';
import { useEditorViewStore } from '../../state/editorViewStore';
import {
  LayoutTemplate,
  Moon,
  Sun,
  Code2,
  Eye,
  Columns2,
  Plus,
  Settings,
  BookOpen,
  PanelLeft,
  PanelLeftClose,
  ListTree,
  Search,
  Zap,
  Copy,
  Bold,
  Italic,
} from 'lucide-react';
import wikiLogo from '../../assets/wiki.png';
import { LIBRARY_SNIPPETS } from '../../editor/snippets';

export function TopBar() {
  const { mode, setMode, theme, setTheme, createTab, sidebarPanel, setSidebarPanel, showToast, setTableBuilderOpen } = useEditorStore();
  const tabs = useEditorStore(s => s.tabs);
  const activeTabId = useEditorStore(s => s.activeTabId);
  const activeTab = tabs.find(t => t.id === activeTabId);
  const activeView = useEditorViewStore(s => s.activeView);
  const { setOpen: openPokedexBuilder } = usePokedexUIStore();

  const handleSnippetClick = (item: typeof LIBRARY_SNIPPETS[number]) => {
    if (item.id === 'wikitable') { setTableBuilderOpen(true); return; }
    if (activeView) {
      const { from, to } = activeView.state.selection.main;
      const selectedText = activeView.state.doc.sliceString(from, to);
      let textToInsert = item.code;
      if (selectedText.length > 0) {
        if (item.id === 'bold') textToInsert = `'''${selectedText}'''`;
        else if (item.id === 'italic') textToInsert = `''${selectedText}''`;
        else if (item.id === 'link') textToInsert = `[[${selectedText}]]`;
        else if (item.id === 'h2') textToInsert = `== ${selectedText} ==\n`;
        else if (item.id === 'h3') textToInsert = `=== ${selectedText} ===\n`;
        else if (item.id === 'ref') textToInsert = `<ref>${selectedText}</ref>`;
      }
      activeView.dispatch({ changes: { from, to, insert: textToInsert }, selection: { anchor: from + textToInsert.length } });
      activeView.focus();
    } else if (activeTabId) {
      const activeContent = tabs.find(t => t.id === activeTabId)?.content ?? '';
      useEditorStore.getState().updateTabContent(activeTabId, activeContent + '\n' + item.code);
    }
  };

  return (
    <header style={{
      height: 48,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'center',
      paddingLeft: 12,
      paddingRight: 12,
      gap: 8,
      flexShrink: 0,
      zIndex: 10,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
        <img 
          src={wikiLogo} 
          alt="WikiPxG Logo" 
          style={{ 
            width: 32, 
            height: 32, 
            objectFit: 'contain', 
            backgroundColor: '#353671',
            borderRadius: 8,
            boxShadow: '0 0 12px rgba(168, 85, 247, 0.25)'
          }} 
        />
        <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
          <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Outfit, sans-serif' }}>
            WikiPxG
          </span>
          <span style={{ fontSize: 9, color: 'var(--text-muted)', fontWeight: 500, letterSpacing: '0.05em' }}>
            EDITOR
          </span>
        </div>
      </div>

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', marginRight: 4 }} />

      {/* Sidebar toggles */}
      <IconButton
        icon={sidebarPanel === 'library' ? <PanelLeftClose size={15} /> : <PanelLeft size={15} />}
        active={sidebarPanel === 'library'}
        onClick={() => setSidebarPanel('library')}
        title="Alternar Barra Lateral"
      />
      <IconButton
        icon={<Search size={15} />}
        active={sidebarPanel === 'search'}
        onClick={() => setSidebarPanel('search')}
        title="Busca"
      />

      {/* Divider */}
      <div style={{ width: 1, height: 24, background: 'var(--border-subtle)', margin: '0 4px' }} />

      {/* Mode switcher */}
      <div style={{
        display: 'flex',
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        gap: 0,
      }}>
        <ModeButton
          active={mode === 'code'}
          onClick={() => setMode('code')}
          title="Modo Código"
          icon={<Code2 size={13} />}
          label="Código"
        />
        <ModeButton
          active={mode === 'split'}
          onClick={() => setMode('split')}
          title="Modo Split"
          icon={<Columns2 size={13} />}
          label="Split"
        />
        <ModeButton
          active={mode === 'preview'}
          onClick={() => setMode('preview')}
          title="Modo Preview"
          icon={<Eye size={13} />}
          label="Preview"
        />
      </div>

      {/* Spacer & Snippets */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
        {LIBRARY_SNIPPETS.map(item => (
          <button
            key={item.id}
            onClick={() => handleSnippetClick(item)}
            title={item.label}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '4px 8px',
              background: 'var(--bg-primary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              fontSize: 11, fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-overlay)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-primary)';
              (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-secondary)';
            }}
          >
            <span style={{ fontSize: 12 }}>{item.icon}</span>
            <span>{item.label}</span>
          </button>
        ))}
      </div>

      {/* Pokédex Builder button */}
      <button
        onClick={() => openPokedexBuilder(true)}
        title="Criar Pokédex"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #9333ea 0%, #3b82f6 100%)',
          border: 'none',
          borderRadius: 'var(--radius-md)',
          padding: '5px 12px',
          color: '#fff',
          fontSize: 12, fontWeight: 700,
          cursor: 'pointer',
          fontFamily: 'Outfit, sans-serif',
          letterSpacing: '0.03em',
          boxShadow: '0 2px 12px rgba(188, 140, 255, 0.3)',
          transition: 'all 0.15s',
          flexShrink: 0,
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.04)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)'; }}
      >
        <LayoutTemplate size={13} />
        Pokédex Builder
      </button>

      {/* Pokémon badge (Official Wiki Link) */}
      <a 
        href="https://wiki.pokexgames.com/" 
        target="_blank" 
        rel="noopener noreferrer"
        title="Acessar a Wiki Oficial"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'var(--bg-primary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-full)',
          padding: '4px 10px',
          fontSize: 11, color: 'var(--text-primary)',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.15s',
          fontWeight: 600,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'var(--bg-overlay)';
          e.currentTarget.style.borderColor = 'var(--accent-primary)';
          e.currentTarget.style.transform = 'scale(1.02)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--bg-primary)';
          e.currentTarget.style.borderColor = 'var(--border-subtle)';
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        <img 
          src="https://wiki.pokexgames.com/favicon.ico" 
          alt="Wiki" 
          style={{ 
            width: 16, 
            height: 16, 
            objectFit: 'contain'
          }} 
        />
        <span>Wiki PokexGames</span>
      </a>

      {/* Theme toggle */}
      <IconButton
        icon={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={`Tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      />

      {/* Copy text */}
      <IconButton
        icon={<Copy size={15} />}
        onClick={() => {
          if (activeTab) {
            navigator.clipboard.writeText(activeTab.content);
            showToast('Texto copiado!', 'success');
          } else {
            showToast('Nenhum texto para copiar.', 'error');
          }
        }}
        title="Copiar Texto"
      />
    </header>
  );
}

interface IconButtonProps {
  icon: React.ReactNode;
  onClick: () => void;
  title: string;
  active?: boolean;
  accent?: boolean;
}

function IconButton({ icon, onClick, title, active, accent }: IconButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        width: 32, height: 32,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: active ? 'var(--bg-overlay)' : accent ? 'var(--accent-primary)' : 'transparent',
        border: 'none',
        borderRadius: 'var(--radius-md)',
        color: active ? 'var(--text-primary)' : accent ? '#fff' : 'var(--text-muted)',
        cursor: 'pointer',
        transition: 'all 0.15s',
        flexShrink: 0,
      }}
      onMouseEnter={e => {
        if (!accent) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-overlay)';
        (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)';
      }}
      onMouseLeave={e => {
        if (!accent && !active) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
        (e.currentTarget as HTMLButtonElement).style.color = active ? 'var(--text-primary)' : accent ? '#fff' : 'var(--text-muted)';
      }}
    >
      {icon}
    </button>
  );
}

interface ModeButtonProps {
  active: boolean;
  onClick: () => void;
  title: string;
  icon: React.ReactNode;
  label: string;
}

function ModeButton({ active, onClick, title, icon, label }: ModeButtonProps) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '4px 10px',
        background: active ? 'var(--accent-primary)' : 'transparent',
        border: 'none',
        color: active ? '#fff' : 'var(--text-muted)',
        fontSize: 12, fontWeight: active ? 600 : 400,
        cursor: 'pointer',
        transition: 'all 0.15s',
        fontFamily: 'Inter, sans-serif',
      }}
      onMouseEnter={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; }}
      onMouseLeave={e => { if (!active) (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}
