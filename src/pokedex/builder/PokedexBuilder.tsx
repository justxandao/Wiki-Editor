import React, { useState, useRef, useEffect } from 'react';
import './PokedexBuilder.css';
import { usePokedexStore, usePokedexUIStore } from '../store/pokedexStore';
import { renderPokedexWikitext } from '../renderer/renderer';
import { useEditorStore } from '../../state/editorStore';
import movePresetsData from '../data/move-presets.json';
import pokemonMovesData from '../data/pokemon-moves.json';
import typesClansData from '../data/types-clans.json';
import evolutionStonesData from '../data/evolution-stones.json';
import {
  calculateEffectiveness,
  parseWikitextToSchema,
  resolveWikiImg,
  parsePastedPokemonText,
  normalizeAbilities,
  getBasePokemonName,
  inferElementsFromMoves,
} from './utils/helpers';
import { FORM_ATTRIBUTES, MAP_ABILITIES_LIST } from './utils/constants';
import { Sidebar } from './components/Sidebar';
import { PreviewPanel } from './components/PreviewPanel';
import { MoveModal } from './components/MoveModal';
import { GeneralFlow } from './flows/GeneralFlow';
import { searchPokemon, getPokemonSpriteUrl, resolvePokemon } from '../../pokemon/pokemon-service';

const ELEMENTS = typesClansData.elements;

const BOOST_TIERS = ['Boost (2)', 'Boost (3)', 'Boost (4)', 'Boost (5)', 'Boost (6)', 'Boost (7)', 'Boost (8)', 'Boost (9)', 'Boost (10)', 'Boost (15)', 'Boost (20)', 'Boost (25)', 'Boost (30)', 'Boost (50)'];

// FORM_ATTRIBUTES imported from ./utils/constants

const CLANS = typesClansData.clans;

const POKEMON_TIERS = [
  { id: 'T4', label: 'Tier 4', level: '', materiaKey: 'Mastered' },
  { id: 'T3', label: 'Tier 3', level: '80', materiaKey: 'Enhanced' },
  { id: 'T2', label: 'Tier 2', level: '100', materiaKey: 'Superior' },
  { id: 'T1', label: 'Tier 1', level: '100', materiaKey: 'Mastered' },
  { id: 'Lendario', label: 'Lendário', level: '100', materiaKey: 'Mastered' },
];

// materia label map
const MATERIA_LABEL: Record<string, string> = {
  Mastered: 'Mastered', Enhanced: 'Enhanced', Superior: 'Superior'
};

// MAP_ABILITIES imported from ./utils/constants as MAP_ABILITIES_LIST
const MAP_ABILITIES = MAP_ABILITIES_LIST;
const SLOTS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'P'];

const NAV_ITEMS = [
  { id: 'general', label: 'General Information', icon: '◎' },
  { id: 'evolutions', label: 'Evolutions', icon: '⟳' },
  { id: 'moves', label: 'Moves', icon: '⚡' },
  { id: 'effectiveness', label: 'Effectiveness', icon: '◈' },
  { id: 'altVersions', label: 'Other Versions', icon: '◧' },
  { id: 'preview', label: 'Preview', icon: '▷' },
];

// resolveWikiImg imported from ./utils/helpers

// ─── Evolutions Tab ────────────────────────────────────────────────────────────
function EvolutionsTab() {
  const { schema, addEvolution, updateEvolution, removeEvolution } = usePokedexStore();
  return (
    <div className="pxg-tab-content">
      <div className="pxg-tab-header">
        <h2 className="pxg-tab-title">Evolutions</h2>
        <button className="pxg-btn-primary" onClick={addEvolution}>+ Add Evolution</button>
      </div>
      {schema.evolutions.length === 0 ? (
        <div className="pxg-empty-state">
          <p>No evolutions added yet.</p>
          <button className="pxg-btn-secondary" onClick={addEvolution}>Add First Evolution</button>
        </div>
      ) : (
        <div className="pxg-list">
          {schema.evolutions.map((evo, i) => (
            <div key={i} className="pxg-list-item">
              <div className="pxg-form-row-2" style={{ flex: 1 }}>
                <div className="pxg-form-group">
                  <label className="pxg-label">Name</label>
                  <input className="pxg-input" placeholder="e.g. Charmeleon" value={evo.name}
                    onChange={e => updateEvolution(i, 'name', e.target.value)} />
                </div>
                <div className="pxg-form-group">
                  <label className="pxg-label">Level Required</label>
                  <input className="pxg-input" placeholder="e.g. 16" value={evo.level}
                    onChange={e => updateEvolution(i, 'level', e.target.value)} />
                </div>
              </div>
              <button className="pxg-btn-remove" onClick={() => removeEvolution(i)}>✕</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Moves Tab ─────────────────────────────────────────────────────────────────
function MovesTab() {
  const { schema, addMove, removeMove } = usePokedexStore();
  const [modalIdx, setModalIdx] = useState<number | null>(null);

  function handleAddMove() {
    addMove();
    // Open modal for newly added move
    setTimeout(() => setModalIdx(schema.moves.length), 0);
  }

  return (
    <div className="pxg-tab-content">
      <div className="pxg-tab-header">
        <h2 className="pxg-tab-title">Moves</h2>
        <button className="pxg-btn-primary" onClick={handleAddMove}>+ Add Move</button>
      </div>

      {schema.moves.length === 0 ? (
        <div className="pxg-empty-state">
          <p>No moves added yet.</p>
          <button className="pxg-btn-secondary" onClick={handleAddMove}>Add First Move</button>
        </div>
      ) : (
        <div className="pxg-moves-list">
          {schema.moves.map((move, idx) => {
            const elemObj = ELEMENTS.find(e => e.id === move.element);
            return (
              <div key={move.id} className="pxg-move-card">
                {/* Slot badge — clickable for reorder */}
                <div className="pxg-move-row" onClick={() => setModalIdx(idx)}>
                  <span className="pxg-move-slot">{move.slot}</span>
                  {elemObj && (
                    <img src={resolveWikiImg(elemObj.file)} alt={elemObj.label} className="pxg-move-elem-img"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0'; }} />
                  )}
                  <span className="pxg-move-name">
                    {move.name || <span style={{ color: 'var(--text-muted)' }}>Unnamed Move</span>}
                  </span>
                  <span className="pxg-move-cd">{move.cooldownPvE || 'No cooldown'}</span>
                  {move.icons.length > 0 && (
                    <div className="pxg-move-icons-preview">
                      {move.icons.slice(0, 4).map(ic => {
                        const attr = FORM_ATTRIBUTES.find(a => a.id === ic);
                        return attr ? (
                          <img key={ic} src={resolveWikiImg(attr.file)} alt={ic} className="pxg-move-icon-sm"
                            onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                        ) : null;
                      })}
                    </div>
                  )}
                  {/* Wild badge */}
                  {move.wildOnly && (
                    <span className="pxg-wild-badge">🌿 Selvagem</span>
                  )}
                  {/* Quick-delete button */}
                  <button
                    className="pxg-move-delete-btn"
                    title="Remove move"
                    onClick={e => { e.stopPropagation(); removeMove(idx); }}
                  >
                    🗑
                  </button>
                  <span className="pxg-move-chevron">✏</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalIdx !== null && (
        <MoveModal idx={modalIdx} onClose={() => setModalIdx(null)} />
      )}
    </div>
  );
}

// ─── Effectiveness Tab ──────────────────────────────────────────────────────────
function parseEffString(str: string): string[] {
  if (!str) return [];
  const cleaned = str.replace(/\.$/, '').trim();
  if (!cleaned) return [];
  return cleaned.split(/,\s*|\s+and\s+/i).map(s => s.trim()).filter(Boolean);
}

function buildEffString(arr: string[]): string {
  if (arr.length === 0) return '';
  if (arr.length === 1) return `${arr[0]}.`;
  return `${arr.slice(0, -1).join(', ')} and ${arr[arr.length - 1]}.`;
}

function EffectivenessTab() {
  const { schema, setEffectiveness } = usePokedexStore();
  const { effectiveness: eff } = schema;

  const rows = [
    { field: 'veryEffective', label: 'Very Effective (2x)', color: '#22c55e' },
    { field: 'effective', label: 'Effective (1.75x)', color: '#86efac' },
    { field: 'normal', label: 'Normal (1x)', color: '#a1a1aa' },
    { field: 'ineffective', label: 'Ineffective (0.75x)', color: '#f59e0b' },
    { field: 'veryIneffective', label: 'Very Ineffective (0.5x)', color: '#ef4444' },
    { field: 'nulo', label: 'Immune (0x)', color: 'var(--accent-primary)' },
  ];

  function handleToggle(field: keyof typeof eff, elLabel: string) {
    const newEff = { ...eff };
    // Remove from all fields
    (Object.keys(newEff) as (keyof typeof eff)[]).forEach(k => {
      const current = parseEffString(newEff[k]);
      if (current.includes(elLabel)) {
        newEff[k] = buildEffString(current.filter(e => e !== elLabel));
      }
    });

    const wasInTarget = parseEffString(eff[field]).includes(elLabel);
    if (!wasInTarget) {
      const targetArr = parseEffString(newEff[field]);
      targetArr.push(elLabel);
      newEff[field] = buildEffString(targetArr);
    }

    setEffectiveness(newEff);
  }

  function handleRecalculate() {
    const currentElements = ELEMENTS.filter(el =>
      schema.generalInfo.element.toLowerCase().includes(el.label.toLowerCase())
    ).map(e => e.label);
    if (currentElements.length > 0) {
      setEffectiveness(calculateEffectiveness(currentElements));
    } else {
      setEffectiveness({ veryEffective: '', effective: '', normal: '', ineffective: '', veryIneffective: '', nulo: '' });
    }
  }

  return (
    <div className="pxg-tab-content">
      <div className="pxg-tab-header">
        <div>
          <h2 className="pxg-tab-title">Effectiveness</h2>
        </div>
        <button className="pxg-btn-primary" onClick={handleRecalculate} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 16 }}>↻</span> Recarregar Automaticamente
        </button>
      </div>

      <div className="pxg-eff-list" style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 16 }}>
        {rows.map(row => {
          const activeElements = parseEffString(eff[row.field as keyof typeof eff]);
          return (
            <div key={row.field} className="pxg-form-group">
              <label className="pxg-eff-label" style={{ color: row.color, marginBottom: 8, display: 'block' }}>{row.label}</label>
              <div className="pxg-elements-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: 6 }}>
                {ELEMENTS.map(el => {
                  const isActive = activeElements.includes(el.label);
                  return (
                    <button key={el.id} onClick={() => handleToggle(row.field as keyof typeof eff, el.label)}
                      className={`pxg-element-btn ${isActive ? 'active' : ''}`} title={el.label}
                      style={{ padding: '6px 8px', minHeight: '32px', flexDirection: 'row', justifyContent: 'flex-start', gap: 6 }}>
                      <img src={resolveWikiImg(el.file)} alt={el.label} className="pxg-element-img" style={{ width: 16, height: 16, marginBottom: 0 }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                      <span className="pxg-element-label" style={{ fontSize: 11 }}>{el.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Alt Versions Tab ───────────────────────────────────────────────────────────
function AltVersionsTab() {
  const { schema, addAltVersion, updateAltVersion, removeAltVersion } = usePokedexStore();
  const [searches, setSearches] = useState<Record<number, string>>({});
  const [showSugg, setShowSugg] = useState<Record<number, boolean>>({});

  function handleNameChange(i: number, val: string) {
    updateAltVersion(i, 'name', val);
    setSearches(s => ({ ...s, [i]: val }));
    setShowSugg(s => ({ ...s, [i]: true }));
    
    // Auto-fill if exact match
    const pSearch = searchPokemon(val, 1);
    const p = pSearch[0]?.entry;
    if (p && p.name.toLowerCase() === val.toLowerCase()) {
      if (p.image) {
        const baseName = p.name.replace('Shiny ', '');
        const prefix = p.image.split(baseName)[0] || '';
        updateAltVersion(i, 'imagePrefix', prefix);
      }
    } else {
       updateAltVersion(i, 'imagePrefix', '');
    }
  }

  function handleSelectPokemon(i: number, p: any) {
    updateAltVersion(i, 'name', p.name || '');
    if (p.image) {
      const baseName = p.name.replace('Shiny ', '');
      const prefix = p.image.split(baseName)[0] || '';
      updateAltVersion(i, 'imagePrefix', prefix);
    } else {
      updateAltVersion(i, 'imagePrefix', '');
    }
    setShowSugg(s => ({ ...s, [i]: false }));
  }

  function getFilteredPokemon(i: number) {
    const q = searches[i] || '';
    if (!q.trim()) return [];
    return searchPokemon(q, 6).map(r => r.entry);
  }

  return (
    <div className="pxg-tab-content">
      <div className="pxg-tab-header">
        <h2 className="pxg-tab-title">Other Versions</h2>
        <button className="pxg-btn-primary" onClick={addAltVersion}>+ Add Version</button>
      </div>
      {schema.altVersions.length === 0 ? (
        <div className="pxg-empty-state">
          <p>No alternate versions added.</p>
          <button className="pxg-btn-secondary" onClick={addAltVersion}>Add Version</button>
        </div>
      ) : (
        <div className="pxg-list">
          {schema.altVersions.map((alt, i) => {
            const filtered = getFilteredPokemon(i);
            return (
              <div key={i} className="pxg-list-item">
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div className="pxg-form-group" style={{ position: 'relative' }}>
                    <label className="pxg-label">Pokémon Name</label>
                    <input
                      className="pxg-input"
                      placeholder="Type Pokémon name to search..."
                      value={alt.name}
                      onChange={e => handleNameChange(i, e.target.value)}
                      onFocus={() => setShowSugg(s => ({ ...s, [i]: true }))}
                    />
                    {showSugg[i] && filtered.length > 0 && (
                      <div className="pxg-suggestions">
                        {filtered.map((p: any, pi: number) => (
                          <button key={pi} className="pxg-suggestion-item" onClick={() => handleSelectPokemon(i, p)}>
                            <span className="pxg-suggestion-name">{p.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {alt.imagePrefix && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <img
                        src={resolveWikiImg(`${alt.imagePrefix}${alt.name}`)}
                        alt={alt.name}
                        style={{ width: 40, height: 40, objectFit: 'contain', imageRendering: 'pixelated' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                      />
                      <span className="pxg-preview-label" style={{ fontSize: 12 }}>{alt.imagePrefix}{alt.name}</span>
                    </div>
                  )}
                </div>
                <button className="pxg-btn-remove" onClick={() => removeAltVersion(i)}>✕</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Export Tab ─────────────────────────────────────────────────────────────────
function ExportTab() {
  const { schema, importSchema } = usePokedexStore();
  const { setOpen } = usePokedexUIStore();
  const { createTab } = useEditorStore();
  const [wikitextIn, setWikitextIn] = useState('');
  const [copied, setCopied] = useState(false);

  const wikitext = renderPokedexWikitext(schema);

  function handleCopy() {
    navigator.clipboard.writeText(wikitext);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleExport() {
    createTab(`${schema.generalInfo.name || 'Pokemon'}_Dex`, wikitext);
    setOpen(false);
  }

  function handleImport() {
    if (!wikitextIn.trim()) return;
    try {
      const parsed = parseWikitextToSchema(wikitextIn);
      importSchema(parsed);
      setWikitextIn('');
    } catch {
      alert('Error parsing wikitext.');
    }
  }

  return (
    <div className="pxg-tab-content">
      <h2 className="pxg-tab-title">Preview & Export</h2>
      <div className="pxg-export-grid">
        <div className="pxg-export-col">
          <div className="pxg-export-header">
            <span className="pxg-label">Wikitext Output</span>
            <button className="pxg-btn-ghost" onClick={handleCopy}>{copied ? '✓ Copied' : 'Copy'}</button>
          </div>
          <pre className="pxg-code-block">{wikitext}</pre>
          <button className="pxg-btn-primary" style={{ width: '100%', marginTop: 12 }} onClick={handleExport}>Export to Editor Tab</button>
        </div>
        <div className="pxg-export-col">
          <div className="pxg-export-header">
            <span className="pxg-label">Import Wikitext</span>
          </div>
          <textarea className="pxg-input pxg-code-input" placeholder="Paste existing wikitext here to import..."
            value={wikitextIn} onChange={e => setWikitextIn(e.target.value)} />
          <button className="pxg-btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={handleImport}>Import & Overwrite</button>
        </div>
      </div>
    </div>
  );
}

// ─── Root ────────────────────────────────────────────────────────────────────
export function PokedexBuilder() {
  const { isOpen, activeTab } = usePokedexUIStore();
  if (!isOpen) return null;

  return (
    <div className="pxg-root wiki-container" style={{ margin: '2.2rem 1rem', height: 'calc(100vh - 4.4rem)', position: 'fixed', inset: 0, zIndex: 9999 }}>
      <Sidebar />
      <main className="pxg-main">
        {activeTab === 'general' && <GeneralFlow />}
        {activeTab === 'evolutions' && <EvolutionsTab />}
        {activeTab === 'moves' && <MovesTab />}
        {activeTab === 'effectiveness' && <EffectivenessTab />}
        {activeTab === 'altVersions' && <AltVersionsTab />}
        {activeTab === 'preview' && <ExportTab />}
      </main>
      <PreviewPanel />
    </div>
  );
}
