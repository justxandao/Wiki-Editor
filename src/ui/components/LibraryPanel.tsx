import React, { useState } from 'react';
import { useEditorStore } from '../../state/editorStore';
import { searchPokemon, getPokemonSpriteUrl } from '../../pokemon/pokemon-service';
import { searchBerries, getBerrySpriteUrl, buildBerryWikiText } from '../../pokemon/berry-service';
import { PanelLeftClose, ArrowLeft, ArrowRight, Plus, History, Clock, Folder, ChevronRight, ChevronDown, FileText } from 'lucide-react';

const LIBRARY_SNIPPETS = [];

function SectionHeader({ title, icon: Icon, expanded, onClick }: any) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '10px 16px', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter, sans-serif' }}>
      {expanded ? <ChevronDown size={14} style={{ opacity: 0.5 }} /> : <ChevronRight size={14} style={{ opacity: 0.5 }} />}
      {Icon && <Icon size={14} style={{ opacity: 0.8 }} />}
      <span style={{ fontSize: '11px', fontWeight: 600, letterSpacing: '0.05em' }}>{title}</span>
    </button>
  );
}

function FolderItem({ title, onClick, active }: any) {
  return (
    <button onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '6px 16px 6px 36px', background: active ? '#16161f' : 'transparent', border: 'none', color: active ? '#e2e2e8' : 'var(--text-muted)', cursor: 'pointer', fontFamily: 'Inter, sans-serif', fontSize: '13px', textAlign: 'left', transition: 'all 0.15s' }}>
      <Folder size={14} style={{ opacity: active ? 1 : 0.7, color: active ? '#a78bfa' : 'inherit' }} />
      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{title}</span>
    </button>
  );
}

export function LibraryPanel() {
  const [sections, setSections] = useState({ history: true, tools: true });
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const [pokemonQuery, setPokemonQuery] = useState('');
  const [berryQuery, setBerryQuery] = useState('');
  
  const { tabs, activeTabId, updateTabContent, setTableBuilderOpen, setSidebarPanel, createTab, setActiveTab } = useEditorStore();
  const activeContent = tabs.find(t => t.id === activeTabId)?.content ?? '';

  const insertSnippet = (code: string) => {
    const view = (window as any).activeEditorView;
    if (view) {
      const { from, to } = view.state.selection.main;
      view.dispatch({ changes: { from, to, insert: code }, selection: { anchor: from + code.length } });
      view.focus();
    } else if (activeTabId) {
      updateTabContent(activeTabId, activeContent + '\n' + code);
    }
  };



  const pokeResults = searchPokemon(pokemonQuery, 10);
  const berryResults = searchBerries(berryQuery, 10);

  const outline = React.useMemo(() => {
    return activeContent.split('\n')
      .map((line, i) => {
        const m = line.match(/^(={1,6})\s*(.+?)\s*\1\s*$/);
        return m ? { level: m[1].length, text: m[2], line: i } : null;
      }).filter(Boolean);
  }, [activeContent]);

  const inputStyle = { width: '100%', padding: '7px 10px', background: '#0d0d14', border: '1px solid #2a2a3e', borderRadius: '6px', color: '#e2e2e8', fontSize: '12px', outline: 'none' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#111118', color: '#e2e2e8', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Top Header matching Antigravity */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 16px', borderBottom: '1px solid #1e1e2e' }}>
        <button onClick={() => setSidebarPanel(null)} title="Esconder Barra Lateral" style={{ background: 'transparent', border: 'none', color: '#a0a0ab', cursor: 'pointer', padding: 0 }}>
          <PanelLeftClose size={18} />
        </button>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a0a0ab' }}>
          <ArrowLeft size={16} style={{ opacity: 0.3, cursor: 'not-allowed' }} />
          <ArrowRight size={16} style={{ opacity: 0.3, cursor: 'not-allowed' }} />
        </div>
      </div>

      {/* New Conversation equivalent */}


      <div style={{ flex: 1, overflow: 'auto' }} className="custom-scrollbar">
        {/* History */}
        <SectionHeader title="Histórico de Páginas" icon={History} expanded={sections.history} onClick={() => setSections(s => ({...s, history: !s.history}))} />
        {sections.history && (
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '12px' }}>
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} 
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '6px 16px 6px 36px', background: activeTabId === tab.id ? 'rgba(124, 58, 237, 0.1)' : 'transparent', border: 'none', color: activeTabId === tab.id ? '#a78bfa' : '#a0a0ab', fontSize: '13px', cursor: 'pointer', textAlign: 'left' }}
                onMouseEnter={e => { if (activeTabId !== tab.id) { e.currentTarget.style.background = '#16161f'; e.currentTarget.style.color = '#e2e2e8'; } }}
                onMouseLeave={e => { if (activeTabId !== tab.id) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#a0a0ab'; } }}>
                <FileText size={14} style={{ opacity: 0.7 }} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>{tab.title}</span>
                {tab.isDirty && <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#a78bfa', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
        )}

        {/* Projects -> Ferramentas */}
        <SectionHeader title="Ferramentas (Projetos)" expanded={sections.tools} onClick={() => setSections(s => ({...s, tools: !s.tools}))} />
        {sections.tools && (
          <div style={{ display: 'flex', flexDirection: 'column', paddingBottom: '12px' }}>
            

            <FolderItem title="Busca de Pokémon" active={activeTool === 'pokemon'} onClick={() => setActiveTool(activeTool === 'pokemon' ? null : 'pokemon')} />
            {activeTool === 'pokemon' && (
              <div style={{ padding: '8px 16px 8px 36px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input value={pokemonQuery} onChange={e => setPokemonQuery(e.target.value)} placeholder="Ex: Arcanine" style={inputStyle} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {pokeResults.map(({ key, entry }) => (
                    <button key={key} onClick={() => insertSnippet(`[[Arquivo:${entry.image}|link=${entry.wikilink}]] '''[[${entry.wikilink}]]'''`)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'transparent', border: 'none', color: '#e2e2e8', fontSize: '12px', cursor: 'pointer', textAlign: 'left', borderRadius: '4px' }} onMouseEnter={e=>e.currentTarget.style.background='#1e1e2e'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <img src={getPokemonSpriteUrl(entry)} alt={entry.name} style={{ width: 20, height: 20, imageRendering: 'pixelated' }} />
                      <span>{entry.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <FolderItem title="Busca de Berries" active={activeTool === 'berries'} onClick={() => setActiveTool(activeTool === 'berries' ? null : 'berries')} />
            {activeTool === 'berries' && (
              <div style={{ padding: '8px 16px 8px 36px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <input value={berryQuery} onChange={e => setBerryQuery(e.target.value)} placeholder="Ex: Cheri" style={inputStyle} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {berryResults.map(entry => (
                    <button key={entry.name} onClick={() => insertSnippet(buildBerryWikiText(entry))} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', background: 'transparent', border: 'none', color: '#e2e2e8', fontSize: '12px', cursor: 'pointer', textAlign: 'left', borderRadius: '4px' }} onMouseEnter={e=>e.currentTarget.style.background='#1e1e2e'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                      <img src={getBerrySpriteUrl(entry)} alt={entry.name} style={{ width: 20, height: 20, imageRendering: 'pixelated' }} />
                      <span>{entry.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <FolderItem title="Índice (Outline)" active={activeTool === 'outline'} onClick={() => setActiveTool(activeTool === 'outline' ? null : 'outline')} />
            {activeTool === 'outline' && (
              <div style={{ padding: '8px 16px 8px 36px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {outline.length === 0 ? (
                  <div style={{ fontSize: '11px', color: '#6b6b80' }}>Nenhuma seção (== Título ==).</div>
                ) : (
                  outline.map((item, i) => item && (
                    <div key={i} onClick={() => {}} style={{ paddingLeft: `${(item.level - 1) * 8}px`, padding: '4px 0', fontSize: '11px', color: item.level === 1 ? '#a78bfa' : '#a0a0ab', cursor: 'pointer' }}>
                      {'▸'.repeat(item.level)} {item.text}
                    </div>
                  ))
                )}
              </div>
            )}
            
          </div>
        )}
      </div>

    </div>
  );
}
