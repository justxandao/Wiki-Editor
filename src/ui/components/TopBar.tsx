import React, { useState } from 'react';
import { useEditorStore } from '../../state/editorStore';
import { usePokedexStore } from '../../pokedex/store/pokedexStore';
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
  ListTree,
  Search,
  Zap,
} from 'lucide-react';

export function TopBar() {
  const { mode, setMode, theme, setTheme, createTab, sidebarPanel, setSidebarPanel } = useEditorStore();
  const tabs = useEditorStore(s => s.tabs);
  const activeTabId = useEditorStore(s => s.activeTabId);
  const activeTab = tabs.find(t => t.id === activeTabId);
  const { setOpen: openPokedexBuilder } = usePokedexStore();

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
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: 'linear-gradient(135deg, #f78166, #bc8cff)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, flexShrink: 0,
        }}>
          ⚡
        </div>
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
        icon={<BookOpen size={15} />}
        active={sidebarPanel === 'library'}
        onClick={() => setSidebarPanel('library')}
        title="Biblioteca (snippets)"
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

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Pokédex Builder button */}
      <button
        onClick={() => openPokedexBuilder(true)}
        title="Criar Pokédex"
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          background: 'linear-gradient(135deg, #f78166 0%, #bc8cff 100%)',
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

      {/* Pokémon badge */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 6,
        background: 'var(--bg-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-full)',
        padding: '4px 10px',
        fontSize: 11, color: 'var(--text-muted)',
      }}>
        <Zap size={11} style={{ color: 'var(--pokemon-yellow)' }} />
        <span>WikiPokexGames</span>
      </div>

      {/* Theme toggle */}
      <IconButton
        icon={theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        title={`Tema ${theme === 'dark' ? 'claro' : 'escuro'}`}
      />

      {/* New tab */}
      <IconButton
        icon={<Plus size={15} />}
        onClick={() => createTab()}
        title="Nova aba (Ctrl+T)"
        accent
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
