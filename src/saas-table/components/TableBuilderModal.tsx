import React, { useState } from 'react';
import { useEditorStore } from '../../state/editorStore';
import { useEditorViewStore } from '../../state/editorViewStore';
import { X, Check } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Col, GridRow } from '../utils/types';
import { FreeGrid } from './FreeGrid';
import { NpcDuelBuilder } from './NpcDuelBuilder';
import { gridToWiki, rewardsToWiki, wikiUrl } from '../utils/wikiGenerators';
import '../../pokedex/builder/PokedexBuilder.css';

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
  const activeView = useEditorViewStore((s) => s.activeView);

  const insert = (wikitext: string) => {
    if (activeView) {
      const { from, to } = activeView.state.selection.main;
      activeView.dispatch({ changes: { from, to, insert: wikitext }, selection: { anchor: from + wikitext.length } });
      activeView.focus();
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
        className="pxg-modal wiki-container"
        style={{ width: '92vw', maxWidth: '1400px', height: '88vh', fontFamily: 'Inter, Segoe UI, sans-serif' }}
      >
        {/* Header */}
        <div className="pxg-modal-header" style={{ padding: '18px 28px' }}>
          <div className="flex items-center gap-3">
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'linear-gradient(135deg, var(--accent-primary), #4c1d95)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20, flexShrink: 0,
              boxShadow: '0 4px 12px rgba(109,40,217,0.4)'
            }}>📊</div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>Construtor de Tabelas Wiki</div>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Clique em qualquer célula para editar. Digite <kbd className="bg-[var(--border-subtle)] px-1 rounded text-[var(--accent-primary)] font-mono text-[10px]">/</kbd> para buscar um Pokémon ou arquivo.
              </p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="pxg-modal-close"><X size={16} /></button>
        </div>

        {/* Mode tabs */}
        <div className="flex items-center gap-1 px-6 pt-3 border-b border-[var(--border-subtle)] bg-[var(--bg-primary)] flex-shrink-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setMode(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 text-sm font-bold rounded-t-lg border-b-[3px] transition-all duration-200 ease-in-out ${
                mode === tab.id
                  ? 'text-[var(--text-primary)] border-[var(--accent-primary)] bg-[var(--bg-secondary)]'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--accent-primary)] hover:bg-[var(--bg-tertiary)]/60'
              }`}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              <span>{tab.label}</span>
              {mode === tab.id && <span className="ml-1 w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></span>}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {mode === 'blank' && (
            <>
              <div className="flex items-center justify-between px-6 py-2 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 flex-shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></div>
                  <span className="text-xs text-[var(--text-muted)] font-medium">{gridRows.length} linhas × {gridCols.length} colunas</span>
                </div>
              </div>
              <FreeGrid cols={gridCols} rows={gridRows} onColsChange={setGridCols} onRowsChange={setGridRows} />
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex-shrink-0">
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
              <div className="flex items-center justify-between px-6 py-2.5 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/40 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent-primary)]"></div>
                    <span className="text-xs text-[var(--text-muted)] font-medium">Tabela de Recompensas • {rewardRows.length} {rewardRows.length === 1 ? 'item' : 'itens'}</span>
                  </div>
                </div>
                {/* XP Row toggle */}
                <button
                  onClick={() => setHasXpRow(v => !v)}
                  className={`flex items-center gap-2 transition-all ${
                    hasXpRow ? 'pxg-btn-primary' : 'pxg-btn-secondary'
                  }`}
                  style={{ padding: '8px 16px' }}
                >
                  <span style={{ fontSize: 14 }}>⭐</span>
                  {hasXpRow ? 'Linha de XP Ativa' : 'Adicionar Linha de XP'}
                </button>
              </div>

              {/* XP row editor (visible when toggled) */}
              {hasXpRow && (
                <div className="flex items-center gap-3 px-6 py-3 border-b border-[var(--border-subtle)] bg-[var(--accent-primary)]/10 flex-shrink-0">
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
                    className="flex-1 bg-[var(--bg-primary)] border border-[var(--accent-primary)]/50 rounded-lg px-4 py-2 text-sm font-bold text-[#c084fc] outline-none focus:border-[var(--accent-primary)] placeholder-[var(--text-muted)] transition-colors"
                    placeholder="Ex: Experiência: 8.000"
                    value={xpText}
                    onChange={e => setXpText(e.target.value)}
                  />
                  <div className="text-xs text-[var(--text-muted)] flex-shrink-0">↳ última linha</div>
                </div>
              )}

              <FreeGrid cols={REWARD_COLS} rows={rewardRows} onColsChange={() => {}} onRowsChange={setRewardRows} />
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)] flex-shrink-0">
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
