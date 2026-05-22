import React, { useState, useRef, useEffect } from 'react';
import './PokedexBuilder.css';
import { usePokedexStore, usePokedexUIStore } from '../store/pokedexStore';
import { renderPokedexWikitext } from '../renderer/renderer';
import { useEditorStore } from '../../state/editorStore';
import movePresetsData from '../data/move-presets.json';
import pokemonMovesData from '../data/pokemon-moves.json';
import typesClansData from '../data/types-clans.json';
import evolutionStonesData from '../data/evolution-stones.json';
import { calculateEffectiveness, parseWikitextToSchema } from './utils/helpers';
import { searchPokemon, getPokemonSpriteUrl, resolvePokemon } from '../../pokemon/pokemon-service';

const ELEMENTS = typesClansData.elements;

const BOOST_TIERS = ['Boost (2)','Boost (3)','Boost (4)','Boost (5)','Boost (6)','Boost (7)','Boost (8)','Boost (9)','Boost (10)','Boost (15)','Boost (20)','Boost (25)','Boost (30)','Boost (50)'];

// Status effects — full names, no abbreviations
const FORM_ATTRIBUTES = [
  { id: 'AOE',             label: 'AOE',             file: 'AOE.png' },
  { id: 'Blind',           label: 'Blind',           file: 'Blind.png' },
  { id: 'Buff',            label: 'Buff',            file: 'Buff.png' },
  { id: 'Burn',            label: 'Burn',            file: 'Burn.png' },
  { id: 'Confusion',       label: 'Confusion',       file: 'Confusion.png' },
  { id: 'Control Blocked', label: 'Control Blocked', file: 'Control_Blocked.png' },
  { id: 'Damage',          label: 'Damage',          file: 'Damage.png' },
  { id: 'Debuff',          label: 'Debuff',          file: 'Debuff.png' },
  { id: 'Focus Blocked',   label: 'Focus Blocked',   file: 'Focus_Blocked.png' },
  { id: 'Healing',         label: 'Healing',         file: 'HealingStatus.png' },
  { id: 'Knockback',       label: 'Knockback',       file: 'Knockback.png' },
  { id: 'Lifesteal',       label: 'Lifesteal',       file: 'Lifesteal.png' },
  { id: 'Locked',          label: 'Locked',          file: 'Locked.png' },
  { id: 'NeverBoost',      label: 'NeverBoost',      file: 'NeverBoost.png' },
  { id: 'Nevermiss',       label: 'Nevermiss',       file: 'Nevermiss.png' },
  { id: 'Paralyze',        label: 'Paralyze',        file: 'Paralyze.png' },
  { id: 'Passive',         label: 'Passive',         file: 'Passive.png' },
  { id: 'Poison',          label: 'Poison',          file: 'Poison.png' },
  { id: 'Self',            label: 'Self',            file: 'Self.png' },
  { id: 'Silence',         label: 'Silence',         file: 'Silence.png' },
  { id: 'Slow',            label: 'Slow',            file: 'Slow.png' },
  { id: 'Stun',            label: 'Stun',            file: 'Stun.png' },
  { id: 'Target',          label: 'Target',          file: 'Target.png' },
];

const CLANS = typesClansData.clans;

const POKEMON_TIERS = [
  { id: 'T4',       label: 'Tier 4',        level: '',    materiaKey: 'Mastered' },
  { id: 'T3',       label: 'Tier 3',        level: '80',  materiaKey: 'Enhanced' },
  { id: 'T2',       label: 'Tier 2',        level: '100', materiaKey: 'Superior' },
  { id: 'T1',       label: 'Tier 1',        level: '100', materiaKey: 'Mastered' },
  { id: 'Lendario', label: 'Tier Lendário', level: '100', materiaKey: 'Mastered' },
];

// materia label map: for each clan, per tier materiaKey -> "Clan Enhanced" etc
const MATERIA_LABEL: Record<string, string> = {
  Mastered: 'Mastered', Enhanced: 'Enhanced', Superior: 'Superior'
};

const MAP_ABILITIES = ["Dig","Rock Smash","Cut","Teleport","Light","Fly","Ride","Surf","Headbutt","Blink","Dark Portal","Strength"];
const SLOTS = ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','P'];

const NAV_ITEMS = [
  { id: 'general',       label: 'General Information', icon: '◎' },
  { id: 'evolutions',    label: 'Evolutions',           icon: '⟳' },
  { id: 'moves',         label: 'Moves',                icon: '⚡' },
  { id: 'effectiveness', label: 'Effectiveness',        icon: '◈' },
  { id: 'altVersions',   label: 'Other Versions',       icon: '◧' },
  { id: 'preview',       label: 'Preview',              icon: '▷' },
];

function resolveWikiImg(filename: string) {
  const enc = encodeURIComponent(filename.replace(/ /g, '_'));
  return `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${enc}`;
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar() {
  const { activeTab, setActiveTab, setOpen } = usePokedexUIStore();
  const { resetSchema } = usePokedexStore();

  return (
    <aside className="pxg-sidebar">
      <div className="pxg-sidebar-brand">
        <span className="pxg-sidebar-title">Pokédex</span>
        <span className="pxg-sidebar-subtitle">Builder</span>
      </div>

      <nav className="pxg-sidebar-nav">
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`pxg-nav-item ${activeTab === item.id ? 'active' : ''}`}
          >
            <span className="pxg-nav-icon">{item.icon}</span>
            <span className="pxg-nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pxg-sidebar-footer">
        <button
          className="pxg-nav-item pxg-nav-danger"
          onClick={() => { if (confirm('Limpar workspace?')) resetSchema(); }}
        >
          <span className="pxg-nav-icon pxg-nav-icon-danger">✕</span>
          <span className="pxg-nav-label" style={{ color: '#ef4444' }}>Clear</span>
        </button>
        <button className="pxg-nav-item" onClick={() => setOpen(false)}>
          <span className="pxg-nav-icon">←</span>
          <span className="pxg-nav-label">Back</span>
        </button>
      </div>
    </aside>
  );
}

// ─── Preview Panel ─────────────────────────────────────────────────────────────
function PreviewPanel() {
  const { schema } = usePokedexStore();
  const g = schema.generalInfo;
  const go = (tab: string) => usePokedexUIStore.getState().setActiveTab(tab);

  return (
    <aside className="pxg-preview-panel">
      <h3 className="pxg-preview-title">Preview</h3>

      {/* Informações Gerais — now clickable */}
      <button className="pxg-preview-section pxg-preview-section-link" onClick={() => go('general')}>
        <h4 className="pxg-preview-section-title">Informações Gerais</h4>
        <div className="pxg-preview-row"><span className="pxg-preview-label">Nome:</span><span>{g.name}</span></div>
        <div className="pxg-preview-row"><span className="pxg-preview-label">Nível:</span><span>{g.level}</span></div>
        <div className="pxg-preview-row"><span className="pxg-preview-label">Elemento:</span><span>{g.element}</span></div>
        <div className="pxg-preview-row"><span className="pxg-preview-label">Habilidades:</span><span>{g.abilities}</span></div>
      </button>

      <button className="pxg-preview-section pxg-preview-section-link" onClick={() => go('evolutions')}>
        <h4 className="pxg-preview-section-title">Evoluções</h4>
        {schema.evolutions.map((e, i) => (
          <div key={i} className="pxg-preview-row"><span>{e.name}</span><span className="pxg-preview-label">Lv {e.level}</span></div>
        ))}
      </button>

      <button className="pxg-preview-section pxg-preview-section-link" onClick={() => go('general')}>
        <h4 className="pxg-preview-section-title">Descrição</h4>
        {g.description && <p className="pxg-preview-desc">{g.description.slice(0, 100)}{g.description.length > 100 ? '...' : ''}</p>}
      </button>

      <button className="pxg-preview-section pxg-preview-section-link" onClick={() => go('moves')}>
        <h4 className="pxg-preview-section-title">Movimentos</h4>
        {schema.moves.slice(0, 5).map((m, i) => (
          <div key={i} className="pxg-preview-row">
            <span style={{ minWidth: 28 }}>{m.slot}</span>
            <span style={{ flex: 1 }}>{m.name}</span>
            <span className="pxg-preview-label">{m.cooldownPvE}</span>
          </div>
        ))}
        {schema.moves.length > 5 && <p className="pxg-preview-label" style={{ fontSize: 11 }}>+{schema.moves.length - 5} more</p>}
      </button>

      <button className="pxg-preview-section pxg-preview-section-link" onClick={() => go('effectiveness')}>
        <h4 className="pxg-preview-section-title">Efetividade</h4>
      </button>

      <button className="pxg-preview-section pxg-preview-section-link" onClick={() => go('altVersions')}>
        <h4 className="pxg-preview-section-title">Outras Versões</h4>
        {schema.altVersions.map((a, i) => (
          <div key={i} className="pxg-preview-row">{a.name}</div>
        ))}
      </button>
    </aside>
  );
}

// ─── Move Modal ────────────────────────────────────────────────────────────────
interface MoveModalProps {
  idx: number;
  onClose: () => void;
}

function MoveModal({ idx, onClose }: MoveModalProps) {
  const { schema, updateMove, removeMove } = usePokedexStore();
  const move = schema.moves[idx];
  const [moveSearch, setMoveSearch] = useState(move?.name || '');
  const [showPresets, setShowPresets] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!move) return null;

  const filteredPresets = moveSearch.trim()
    ? movePresetsData.filter(m =>
        (m.displayName || m.name).toLowerCase().includes(moveSearch.toLowerCase())
      ).slice(0, 8)
    : [];

  function applyPreset(preset: any) {
    updateMove(idx, 'name', preset.name); // always export the real name
    updateMove(idx, 'element', preset.element || (preset.type === 'Normal' ? 'Normal1' : preset.type));
    updateMove(idx, 'cooldownPvE', preset.cooldown);
    updateMove(idx, 'cooldownPvP', preset.cooldownPvP || preset.cooldown);
    updateMove(idx, 'icons', preset.categories || []);
    const pokemonLevel = schema.generalInfo.level;
    if (pokemonLevel) updateMove(idx, 'level', pokemonLevel);
    setMoveSearch(preset.displayName || preset.name);
    setShowPresets(false);
  }

  return (
    <div className="pxg-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pxg-modal" ref={modalRef}>
        <div className="pxg-modal-header">
          <div className="pxg-modal-title">
            <span className="pxg-move-slot">{move.slot}</span>
            <span>{move.name || 'Configure Move'}</span>
          </div>
          <button className="pxg-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="pxg-modal-body">
          {/* Move Name */}
          <div className="pxg-form-row-2">
            <div className="pxg-form-group" style={{ position: 'relative' }}>
              <label className="pxg-label">Move Name</label>
              <input
                className="pxg-input"
                placeholder="Search or type move name..."
                value={move.name}
                onChange={e => { updateMove(idx, 'name', e.target.value); setMoveSearch(e.target.value); setShowPresets(true); }}
                onFocus={() => setShowPresets(true)}
                autoFocus
              />
              {showPresets && filteredPresets.length > 0 && (
                <div className="pxg-suggestions">
                  {filteredPresets.map((p: any, pi: number) => (
                    <button key={pi} className="pxg-suggestion-item" onClick={() => applyPreset(p)}>
                      <span className="pxg-suggestion-name">{p.displayName || p.name}</span>
                      <span className="pxg-suggestion-sub">{p.type} · {p.cooldown}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="pxg-form-group">
              <label className="pxg-label">Level Required</label>
              <input
                className="pxg-input"
                placeholder="100"
                value={move.level}
                onChange={e => updateMove(idx, 'level', e.target.value)}
              />
            </div>
          </div>

          {/* Cooldowns */}
          <div className="pxg-form-row-2">
            <div className="pxg-form-group">
              <label className="pxg-label">PvE Cooldown</label>
              <input
                className="pxg-input"
                placeholder="e.g. 15s"
                value={move.cooldownPvE}
                onChange={e => updateMove(idx, 'cooldownPvE', e.target.value)}
              />
            </div>
            <div className="pxg-form-group">
              <label className="pxg-label">PvP Cooldown</label>
              <input
                className="pxg-input"
                placeholder="e.g. 25s (blank = same as PvE)"
                value={move.cooldownPvP}
                onChange={e => updateMove(idx, 'cooldownPvP', e.target.value)}
              />
            </div>
          </div>

          {/* Element */}
          <div className="pxg-form-group">
            <label className="pxg-label">Element Type</label>
            <div className="pxg-elements-grid pxg-elements-grid-sm">
              {ELEMENTS.map(el => (
                <button
                  key={el.id}
                  onClick={() => updateMove(idx, 'element', el.id)}
                  className={`pxg-element-btn ${move.element === el.id ? 'active' : ''}`}
                  title={el.label}
                >
                  <img src={resolveWikiImg(el.file)} alt={el.label} className="pxg-element-img"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                  <span className="pxg-element-label">{el.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Status Effects */}
          <div className="pxg-form-group">
            <label className="pxg-label">Status Effects & Tags</label>
            <div className="pxg-tags-grid">
              {FORM_ATTRIBUTES.map(attr => {
                const active = move.icons.includes(attr.id);
                return (
                  <button
                    key={attr.id}
                    onClick={() => {
                      const icons = active
                        ? move.icons.filter(i => i !== attr.id)
                        : [...move.icons, attr.id];
                      updateMove(idx, 'icons', icons);
                    }}
                    className={`pxg-tag-btn ${active ? 'active' : ''}`}
                  >
                    <img src={resolveWikiImg(attr.file)} alt={attr.label} className="pxg-tag-img"
                      onError={e => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
                    {attr.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="pxg-modal-footer">
          {/* Wild Pokémon toggle */}
          <label className="pxg-wild-toggle" title="Golpe usado apenas por Pokémon selvagem — substitui o nível pelo aviso na wiki">
            <input
              type="checkbox"
              checked={!!move.wildOnly}
              onChange={e => updateMove(idx, 'wildOnly', e.target.checked)}
            />
            <span className="pxg-wild-toggle-label">🌿 Pokémon Selvagem</span>
          </label>
          <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
            <button className="pxg-btn-remove-text" onClick={() => { removeMove(idx); onClose(); }}>Remove Move</button>
            <button className="pxg-btn-primary" onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ParsedData {
  name?: string;
  level?: string;
  abilities?: string;
  boost?: string;
  materia?: string;
  description?: string;
  evolutions?: Array<{ name: string; level: string }>;
}

function parsePastedPokemonText(text: string): ParsedData {
  const lines = text.split('\n');
  const result: ParsedData = {
    evolutions: []
  };

  let inDescription = false;
  let inEvolutions = false;
  const descriptionLines: string[] = [];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      inEvolutions = false;
      continue;
    }

    const nameMatch = trimmed.match(/^(?:Nome|Name)\s*:\s*(.*)$/i);
    const levelMatch = trimmed.match(/^(?:N[íi]vel|Level)\s*:\s*(.*)$/i);
    const abilitiesMatch = trimmed.match(/^(?:Habilidades?|Abilities|Ability)\s*:\s*(.*)$/i);
    const boostMatch = trimmed.match(/^(?:Boost)\s*:\s*(.*)$/i);
    const materiaMatch = trimmed.match(/^(?:Mat[ée]ria)\s*:\s*(.*)$/i);
    const descMatch = trimmed.match(/^(?:Descri[çc]ão|Description)\s*:\s*(.*)$/i);
    const evoBlockMatch = trimmed.match(/^(?:Evolu[çc]ões|Evolutions)\s*:\s*(.*)$/i);

    if (nameMatch) {
      result.name = nameMatch[1].trim();
      inDescription = false;
      inEvolutions = false;
    } else if (levelMatch) {
      result.level = levelMatch[1].trim();
      inDescription = false;
      inEvolutions = false;
    } else if (abilitiesMatch) {
      result.abilities = abilitiesMatch[1].trim();
      inDescription = false;
      inEvolutions = false;
    } else if (boostMatch) {
      result.boost = boostMatch[1].trim();
      inDescription = false;
      inEvolutions = false;
    } else if (materiaMatch) {
      result.materia = materiaMatch[1].trim();
      inDescription = false;
      inEvolutions = false;
    } else if (descMatch) {
      descriptionLines.push(descMatch[1].trim());
      inDescription = true;
      inEvolutions = false;
    } else if (evoBlockMatch) {
      inEvolutions = true;
      inDescription = false;
      const initialEvo = evoBlockMatch[1].trim();
      if (initialEvo) {
        const match = initialEvo.match(/^\s*(.+?)\s*\((?:[^)]*?\b)?(\d+)\s*\)/i);
        if (match) {
          result.evolutions?.push({ name: match[1].trim(), level: match[2].trim() });
        }
      }
    } else {
      if (inDescription) {
        descriptionLines.push(trimmed);
      } else if (inEvolutions) {
        const match = trimmed.match(/^\s*(.+?)\s*\((?:[^)]*?\b)?(\d+)\s*\)/i);
        if (match) {
          result.evolutions?.push({ name: match[1].trim(), level: match[2].trim() });
        }
      }
    }
  }

  if (descriptionLines.length > 0) {
    result.description = descriptionLines.join('\n');
  }

  return result;
}

function normalizeAbilities(abilitiesStr: string): string {
  const MAP_ABILITIES = ["Dig","Rock Smash","Cut","Teleport","Light","Fly","Ride","Surf","Headbutt","Blink","Dark Portal","Strength"];
  const parts = abilitiesStr.split(/,|\s+e\s+|\s+and\s+/i);
  const normalized = parts
    .map(p => p.trim().toLowerCase())
    .filter(Boolean)
    .map(p => {
      const matched = MAP_ABILITIES.find(a => a.toLowerCase() === p);
      if (matched) return matched;
      return p.replace(/\b\w/g, c => c.toUpperCase());
    });
  return normalized.join(', ');
}

function getBasePokemonName(fullName: string): string {
  return fullName
    .replace(/^(Shiny|Mega|Alolan|Alola)\s+/i, '')
    .trim();
}

function inferElementsFromMoves(moves: any[]): string {
  const ELEMENTS_LIST = [
    { id: "Normal1", label: "Normal" },
    { id: "Fire", label: "Fire" },
    { id: "Water", label: "Water" },
    { id: "Grass", label: "Grass" },
    { id: "Electric", label: "Electric" },
    { id: "Ice", label: "Ice" },
    { id: "Fighting", label: "Fighting" },
    { id: "Poison1", label: "Poison" },
    { id: "Ground", label: "Ground" },
    { id: "Flying", label: "Flying" },
    { id: "Psychic", label: "Psychic" },
    { id: "Bug", label: "Bug" },
    { id: "Rock", label: "Rock" },
    { id: "Ghost1", label: "Ghost" },
    { id: "Dragon", label: "Dragon" },
    { id: "Dark1", label: "Dark" },
    { id: "Steel", label: "Steel" },
    { id: "Fairy", label: "Fairy" },
    { id: "Crystal", label: "Crystal" }
  ];

  if (!moves || moves.length === 0) return '';
  const counts: Record<string, number> = {};
  for (const m of moves) {
    const el = m.element;
    if (!el || el === 'Neutralicon' || el === 'Cl') continue;
    counts[el] = (counts[el] || 0) + 1;
  }
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return '';
  
  const getLabel = (id: string) => {
    const found = ELEMENTS_LIST.find(e => e.id === id);
    return found ? found.label : id;
  };

  const top1 = sorted[0][0];
  const label1 = getLabel(top1);

  if (sorted.length > 1) {
    const top2 = sorted[1][0];
    const count2 = sorted[1][1];
    if (count2 >= 2 && count2 >= moves.length * 0.15) {
      const label2 = getLabel(top2);
      return `${label1} and ${label2}`;
    }
  }

  return label1;
}

interface PasteTextModalProps {
  onClose: () => void;
  onImport: (text: string) => void;
}

function PasteTextModal({ onClose, onImport }: PasteTextModalProps) {
  const [text, setText] = useState('');

  const placeholderText = `Nome: Shiny Ursaring
Nível: 100

Habilidade: dig, rock smash, cut, headbutt e strength

Evoluções:
Shiny Teddiursa (requer nível 50)
Shiny Ursaring (requer nível 100)

Boost: Heart Stone (2)
Materia: Gardestrike

Descrição: Um Ursaring mais agressivo e territorial, especialmente durante a época de acasalamento. Ele é extremamente protetor com seus filhotes.`;

  return (
    <div className="pxg-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="pxg-modal" style={{ maxWidth: 500 }}>
        <div className="pxg-modal-header">
          <div className="pxg-modal-title">
            <span>📋 Importar de Texto</span>
          </div>
          <button className="pxg-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="pxg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <p style={{ fontSize: 13, color: '#9a9ab2', lineHeight: 1.4, margin: 0 }}>
            Cole as informações do Pokémon abaixo. O construtor irá preencher os campos e buscar os golpes/ícone no banco de dados automaticamente.
          </p>

          <div className="pxg-form-group">
            <textarea
              className="pxg-input"
              style={{ minHeight: 250, fontFamily: 'monospace', fontSize: 12, lineHeight: 1.5 }}
              placeholder={placeholderText}
              value={text}
              onChange={e => setText(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        <div className="pxg-modal-footer">
          <button className="pxg-btn-remove-text" onClick={onClose}>Cancelar</button>
          <button
            className="pxg-btn-primary"
            onClick={() => {
              if (text.trim()) {
                onImport(text);
                onClose();
              }
            }}
            disabled={!text.trim()}
            style={{ opacity: text.trim() ? 1 : 0.6 }}
          >
            Processar e Importar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── General Information Tab ───────────────────────────────────────────────────
function GeneralTab() {
  const { schema, updateGeneralInfo, setEffectiveness, setMoves, updateMove, setEvolutions } = usePokedexStore();
  const [showPasteModal, setShowPasteModal] = useState(false);

  const g = schema.generalInfo;

  const [pokemonSearch, setPokemonSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [selectedStone, setSelectedStone] = useState<string | null>(null);
  const [boostTier, setBoostTier] = useState('');
  const [iconName, setIconName] = useState(g.number || '');
  const [iconSearch, setIconSearch] = useState('');
  const [iconResults, setIconResults] = useState<Array<{name: string; image: string; spriteUrl: string}>>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedClan, setSelectedClan] = useState<string | null>(null);
  const [selectedMateriaType, setSelectedMateriaType] = useState<string | null>(null);
  const [showTierDropdown, setShowTierDropdown] = useState(false);
  const [showClanDropdown, setShowClanDropdown] = useState(false);
  const [showMateriaTypeDropdown, setShowMateriaTypeDropdown] = useState(false);
  const sugRef = useRef<HTMLDivElement>(null);

  // Derive selected stone from g.boost
  useEffect(() => {
    const stone = evolutionStonesData.find(s => g.boost?.includes(s.name));
    if (stone) setSelectedStone(stone.name);
    const tierMatch = g.boost?.match(/\((\d+)\)/);
    if (tierMatch) setBoostTier(`Boost (${tierMatch[1]})`);
    // Derive clan from materia
    if (g.materia) {
      const clan = CLANS.find(c => g.materia.startsWith(c.label));
      if (clan) setSelectedClan(clan.id);
      const mtype = ['Mastered','Enhanced','Superior'].find(t => g.materia.includes(t));
      if (mtype) setSelectedMateriaType(mtype);
    }
  }, []);

  const selectedElements = ELEMENTS.filter(el =>
    g.element.toLowerCase().includes(el.label.toLowerCase())
  ).map(el => el.id);

  function handleElementClick(elId: string) {
    const current = ELEMENTS.filter(el =>
      g.element.toLowerCase().includes(el.label.toLowerCase())
    );
    const alreadySelected = current.find(e => e.id === elId);
    let next: typeof current;
    if (alreadySelected) {
      next = current.filter(e => e.id !== elId);
    } else {
      if (current.length >= 2) return;
      next = [...current, ELEMENTS.find(e => e.id === elId)!];
    }
    const elStr = next.map(e => e.label).join(' and ');
    updateGeneralInfo('element', elStr);
    const elementKeys = next.map(e => e.label);
    if (elementKeys.length > 0) setEffectiveness(calculateEffectiveness(elementKeys));
  }

  function handleLevelChange(val: string) {
    updateGeneralInfo('level', val);
    // Update all moves' level to match
    schema.moves.forEach((_, idx) => {
      updateMove(idx, 'level', val);
    });
  }

  function handlePokemonSearch(val: string) {
    setPokemonSearch(val);
    updateGeneralInfo('name', val);
    if (val.trim()) {
      const matches = (pokemonMovesData as any[])
        .filter(p => p.name?.toLowerCase().includes(val.toLowerCase()))
        .slice(0, 6);
      setSuggestions(matches);
      setShowSugg(true);
    } else {
      setShowSugg(false);
    }
  }

  function handleSelectPokemon(p: any) {
    updateGeneralInfo('name', p.name || '');
    updateGeneralInfo('number', p.number || '');
    updateGeneralInfo('level', p.level || '');
    updateGeneralInfo('element', p.element || '');
    updateGeneralInfo('abilities', p.abilities || '');
    updateGeneralInfo('boost', p.boost || '');
    updateGeneralInfo('materia', p.materia || '');
    if (p.moves) setMoves(p.moves);
    const detected = ELEMENTS.filter(el =>
      (p.element || '').toLowerCase().includes(el.label.toLowerCase())
    ).map(e => e.label);
    if (detected.length > 0) setEffectiveness(calculateEffectiveness(detected));
    setShowSugg(false);
    setPokemonSearch(p.name);
  }

  function handleImportText(text: string) {
    const parsed = parsePastedPokemonText(text);
    if (!parsed.name) {
      alert("Não foi possível identificar o nome do Pokémon no texto.");
      return;
    }

    updateGeneralInfo('name', parsed.name);
    if (parsed.level) {
      updateGeneralInfo('level', parsed.level);
    }
    if (parsed.boost) {
      updateGeneralInfo('boost', parsed.boost);
    }
    if (parsed.materia) {
      updateGeneralInfo('materia', parsed.materia);
    }
    if (parsed.description) {
      updateGeneralInfo('description', parsed.description);
    }
    if (parsed.abilities) {
      updateGeneralInfo('abilities', normalizeAbilities(parsed.abilities));
    }

    if (parsed.evolutions && parsed.evolutions.length > 0) {
      setEvolutions(parsed.evolutions);
    } else {
      setEvolutions([]);
    }

    const exactMatch = (pokemonMovesData as any[]).find(
      p => p.name?.toLowerCase() === parsed.name!.toLowerCase()
    );
    let matchedPokemon = exactMatch;

    if (!matchedPokemon) {
      const baseName = getBasePokemonName(parsed.name!);
      matchedPokemon = (pokemonMovesData as any[]).find(
        p => p.name?.toLowerCase() === baseName.toLowerCase()
      );
    }

    if (matchedPokemon) {
      let movesToSet = matchedPokemon.moves || [];
      if (parsed.level) {
        movesToSet = movesToSet.map((m: any) => ({ ...m, level: parsed.level }));
      }
      setMoves(movesToSet);

      const inferredElement = inferElementsFromMoves(matchedPokemon.moves);
      if (inferredElement) {
        updateGeneralInfo('element', inferredElement);
        const detected = ELEMENTS.filter(el =>
          inferredElement.toLowerCase().includes(el.label.toLowerCase())
        ).map(e => e.label);
        if (detected.length > 0) {
          setEffectiveness(calculateEffectiveness(detected));
        }
      }
    }

    const wikiEntry = resolvePokemon(parsed.name) || resolvePokemon(getBasePokemonName(parsed.name));
    if (wikiEntry && wikiEntry.image) {
      const iconNameClean = wikiEntry.image.replace(/\.[^.]+$/, '');
      setIconName(iconNameClean);
      updateGeneralInfo('number', iconNameClean);
    } else {
      setIconName('');
      updateGeneralInfo('number', '');
    }

    setPokemonSearch(parsed.name);
  }

  function toggleAbility(ab: string) {
    const current = g.abilities ? g.abilities.split(', ').filter(Boolean) : [];
    const has = current.includes(ab);
    const next = has ? current.filter(a => a !== ab) : [...current, ab];
    updateGeneralInfo('abilities', next.join(', '));
  }

  function handleStoneSelect(stone: typeof evolutionStonesData[0]) {
    const newStone = selectedStone === stone.name ? null : stone.name;
    setSelectedStone(newStone);
    const tier = boostTier ? ` ${boostTier}` : '';
    updateGeneralInfo('boost', newStone ? `${newStone}${tier}` : tier.trim());
  }

  function handleBoostTierSelect(tier: string) {
    const newTier = boostTier === tier ? '' : tier;
    setBoostTier(newTier);
    const stonePart = selectedStone || '';
    updateGeneralInfo('boost', [stonePart, newTier].filter(Boolean).join(' '));
  }

  function handleIconChange(val: string) {
    setIconName(val);
    updateGeneralInfo('number', val);
  }

  function handleIconSearch(val: string) {
    setIconSearch(val);
    if (!val.trim()) { setIconResults([]); return; }
    // Use the existing pokemon-service index (same as /slash command)
    const results = searchPokemon(val, 12);
    setIconResults(
      results
        .filter(r => r.entry.image)
        .map(r => ({
          name: r.entry.name,
          image: r.entry.image,
          spriteUrl: getPokemonSpriteUrl(r.entry),
        }))
    );
  }

  function handleIconSelect(img: { name: string; image: string }) {
    // Store filename without extension
    const name = img.image.replace(/\.[^.]+$/, '');
    setIconName(name);
    updateGeneralInfo('number', name);
    setIconSearch('');
    setIconResults([]);
  }

  function handleTierSelect(tier: typeof POKEMON_TIERS[0]) {
    setSelectedTier(tier.id);
    setShowTierDropdown(false);
    if (tier.level) handleLevelChange(tier.level);
    // Update materia if clan already selected
    if (selectedClan) {
      const clan = CLANS.find(c => c.id === selectedClan);
      if (clan) updateGeneralInfo('materia', `${clan.label} ${tier.materiaKey}`);
      setSelectedMateriaType(tier.materiaKey);
    }
  }

  function handleClanSelect(clanId: string) {
    setSelectedClan(clanId);
    setShowClanDropdown(false);
    const clan = CLANS.find(c => c.id === clanId);
    const tier = POKEMON_TIERS.find(t => t.id === selectedTier);
    const materiaKey = selectedMateriaType || (tier ? tier.materiaKey : 'Mastered');
    if (clan) updateGeneralInfo('materia', `${clan.label} ${materiaKey}`);
  }

  function handleMateriaTypeSelect(mtype: string) {
    setSelectedMateriaType(mtype);
    setShowMateriaTypeDropdown(false);
    const clan = CLANS.find(c => c.id === selectedClan);
    if (clan) updateGeneralInfo('materia', `${clan.label} ${mtype}`);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (sugRef.current && !sugRef.current.contains(e.target as Node)) setShowSugg(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <div className="pxg-tab-content">
      <h2 className="pxg-tab-title">General Information</h2>

      {/* Load Pokédex */}
      <div style={{ marginBottom: 28 }}>
        <div className="pxg-load-btn-wrap" ref={sugRef}>
          <button className="pxg-load-btn" onClick={() => setShowSugg(s => !s)}>
            <span>⚙</span> LOAD POKÉDEX
          </button>
          <input
            className="pxg-load-search"
            placeholder="Search pokémon name..."
            value={pokemonSearch}
            onChange={e => handlePokemonSearch(e.target.value)}
            onFocus={() => pokemonSearch && setShowSugg(true)}
          />
          <button
            className="pxg-load-btn"
            style={{
              borderColor: '#bc8cff',
              color: '#bc8cff',
              transition: 'all 0.15s ease-in-out'
            }}
            onClick={() => setShowPasteModal(true)}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = 'rgba(188, 140, 255, 0.1)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <span>📋</span> COLAR INFORMAÇÕES
          </button>
          {showSugg && suggestions.length > 0 && (
            <div className="pxg-suggestions">
              {suggestions.map((p, i) => (
                <button key={i} className="pxg-suggestion-item" onClick={() => handleSelectPokemon(p)}>
                  <span className="pxg-suggestion-name">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Pokemon Name + Level + Tier dropdown */}
      <div className="pxg-form-row-2">
        <div className="pxg-form-group">
          <label className="pxg-label">Pokemon Name</label>
          <input className="pxg-input" placeholder="E.g: Pikachu" value={g.name}
            onChange={e => updateGeneralInfo('name', e.target.value)} />
        </div>
        <div className="pxg-form-group">
          <label className="pxg-label">Level</label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input className="pxg-input" placeholder="E.g: 100" value={g.level}
              onChange={e => handleLevelChange(e.target.value)} style={{ flex: 1 }} />
            {/* Single Tier dropdown */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <button
                className={`pxg-dropdown-btn ${selectedTier ? 'active' : ''}`}
                onClick={() => setShowTierDropdown(v => !v)}
              >
                {selectedTier ? POKEMON_TIERS.find(t => t.id === selectedTier)?.label : 'Tier'}
                <span className="pxg-dropdown-arrow">▾</span>
              </button>
              {showTierDropdown && (
                <div className="pxg-dropdown-list">
                  {POKEMON_TIERS.map(t => (
                    <button key={t.id} className={`pxg-dropdown-item ${selectedTier === t.id ? 'active' : ''}`}
                      onClick={() => handleTierSelect(t)}>
                      {t.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Pokémon Icon — wiki filename search */}
      <div className="pxg-form-group" style={{ marginBottom: 28 }}>
        <label className="pxg-label">Pokémon Icon</label>

        {/* Selected preview */}
        {iconName && (
          <div className="pxg-icon-selected">
            <div className="pxg-icon-preview">
              <img
                src={resolveWikiImg(`${iconName}.png`)}
                alt={iconName}
                style={{ width: 48, height: 48, objectFit: 'contain', imageRendering: 'pixelated' }}
                onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
              />
            </div>
            <span className="pxg-icon-name">{iconName}</span>
            <button className="pxg-btn-ghost" style={{ marginLeft: 'auto' }}
              onClick={() => { setIconName(''); updateGeneralInfo('number', ''); }}>
              ✕
            </button>
          </div>
        )}

        {/* Search input */}
        <div style={{ position: 'relative' }}>
          <input
            className="pxg-input"
            placeholder="Type Pokémon name to find wiki icon..."
            value={iconSearch}
            onChange={e => handleIconSearch(e.target.value)}
          />
        </div>

        {/* Results grid */}
        {iconResults.length > 0 && (
          <div className="pxg-icon-results">
            {iconResults.map((img, i) => (
              <button key={i} className="pxg-icon-result-btn" title={img.name}
                onClick={() => handleIconSelect(img)}>
                <img src={img.spriteUrl} alt={img.name}
                  style={{ width: 40, height: 40, objectFit: 'contain', imageRendering: 'pixelated' }}
                  onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.2'; }} />
                <span className="pxg-icon-result-label">{img.name}</span>
              </button>
            ))}
          </div>
        )}
        {iconSearch && iconResults.length === 0 && (
          <p style={{ fontSize: 12, color: '#4a4a62', marginTop: 8 }}>Nenhum resultado para "{iconSearch}"</p>
        )}
      </div>

      {/* Elements */}
      <div className="pxg-form-group" style={{ marginBottom: 28 }}>
        <label className="pxg-label">Elements (Max 2)</label>
        <div className="pxg-elements-grid">
          {ELEMENTS.map(el => {
            const isActive = selectedElements.includes(el.id);
            return (
              <button key={el.id} onClick={() => handleElementClick(el.id)}
                className={`pxg-element-btn ${isActive ? 'active' : ''}`} title={el.label}>
                <img src={resolveWikiImg(el.file)} alt={el.label} className="pxg-element-img"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                <span className="pxg-element-label">{el.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Abilities */}
      <div className="pxg-form-group" style={{ marginBottom: 28 }}>
        <label className="pxg-label">Abilities</label>
        <div className="pxg-abilities-grid">
          {MAP_ABILITIES.map(ab => {
            const active = g.abilities?.split(', ').includes(ab);
            return (
              <button key={ab} onClick={() => toggleAbility(ab)} className={`pxg-ability-btn ${active ? 'active' : ''}`}>
                {ab}
              </button>
            );
          })}
        </div>
      </div>

      {/* Pokemon Boost — Stone picker + Tier selector */}
      <div className="pxg-form-group" style={{ marginBottom: 28 }}>
        <label className="pxg-label">Pokémon Boost</label>

        {/* Stone grid */}
        <div className="pxg-stones-grid">
          {evolutionStonesData.map(stone => {
            const active = selectedStone === stone.name;
            return (
              <button key={stone.name} onClick={() => handleStoneSelect(stone)}
                className={`pxg-stone-btn ${active ? 'active' : ''}`} title={stone.name}>
                <img src={resolveWikiImg(stone.file)} alt={stone.name} className="pxg-stone-img"
                  onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                <span className="pxg-stone-label">{stone.name.replace(' Stone', '').replace(' Gemstone', '')}</span>
              </button>
            );
          })}
        </div>

        {/* Boost tier buttons */}
        <div className="pxg-boost-tiers">
          {BOOST_TIERS.map(tier => (
            <button key={tier} onClick={() => handleBoostTierSelect(tier)}
              className={`pxg-boost-tier-btn ${boostTier === tier ? 'active' : ''}`}>
              {tier}
            </button>
          ))}
        </div>

        {/* Current value display */}
        {g.boost && (
          <div className="pxg-boost-value">
            <span className="pxg-preview-label">Current: </span>
            <span style={{ color: '#c4b5fd' }}>{g.boost}</span>
          </div>
        )}
      </div>

      {/* Boost Type / Materia — clan dropdown + materia type dropdown */}
      <div className="pxg-form-group" style={{ marginBottom: 28 }}>
        <label className="pxg-label">Boost Type (Materia)</label>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {/* Clan dropdown */}
          <div style={{ position: 'relative', flex: 1 }}>
            <button
              className={`pxg-dropdown-btn pxg-dropdown-wide ${selectedClan ? 'active' : ''}`}
              onClick={() => { setShowClanDropdown(v => !v); setShowMateriaTypeDropdown(false); }}
            >
              {selectedClan ? (() => { const c = CLANS.find(cl => cl.id === selectedClan); return c ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <img src={resolveWikiImg(c.file)} style={{ width: 18, height: 18, objectFit: 'contain', imageRendering: 'pixelated' }} />
                  {c.label}
                </span>
              ) : selectedClan; })() : 'Select Clan'}
              <span className="pxg-dropdown-arrow">▾</span>
            </button>
            {showClanDropdown && (
              <div className="pxg-dropdown-list pxg-dropdown-list-wide">
                {CLANS.map(clan => (
                  <button key={clan.id} className={`pxg-dropdown-item ${selectedClan === clan.id ? 'active' : ''}`}
                    onClick={() => handleClanSelect(clan.id)}>
                    <img src={resolveWikiImg(clan.file)} style={{ width: 18, height: 18, objectFit: 'contain', imageRendering: 'pixelated' }}
                      onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                    {clan.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Materia type dropdown */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <button
              className={`pxg-dropdown-btn ${selectedMateriaType ? 'active' : ''}`}
              onClick={() => { setShowMateriaTypeDropdown(v => !v); setShowClanDropdown(false); }}
            >
              {selectedMateriaType || 'Type'}
              <span className="pxg-dropdown-arrow">▾</span>
            </button>
            {showMateriaTypeDropdown && (
              <div className="pxg-dropdown-list" style={{ right: 0, left: 'auto' }}>
                {['Mastered','Enhanced','Superior'].map(mtype => (
                  <button key={mtype} className={`pxg-dropdown-item ${selectedMateriaType === mtype ? 'active' : ''}`}
                    onClick={() => handleMateriaTypeSelect(mtype)}>
                    {mtype}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        {g.materia && (
          <div className="pxg-boost-value" style={{ marginTop: 6 }}>
            <span className="pxg-preview-label">Current: </span>
            <span style={{ color: '#c4b5fd' }}>{g.materia}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="pxg-form-group">
        <label className="pxg-label">Description</label>
        <textarea className="pxg-input pxg-textarea" placeholder="Pokémon lore description..."
          value={g.description} onChange={e => updateGeneralInfo('description', e.target.value)} />
      </div>

      {showPasteModal && (
        <PasteTextModal
          onClose={() => setShowPasteModal(false)}
          onImport={handleImportText}
        />
      )}
    </div>
  );
}

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
                    {move.name || <span style={{ color: '#555' }}>Unnamed Move</span>}
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
function EffectivenessTab() {
  const { schema, updateEffectiveness } = usePokedexStore();
  const { effectiveness: eff } = schema;

  const rows = [
    { field: 'veryEffective',   label: 'Very Effective (2x)',       color: '#22c55e' },
    { field: 'effective',       label: 'Effective (1.75x)',          color: '#86efac' },
    { field: 'normal',          label: 'Normal (1x)',                color: '#a1a1aa' },
    { field: 'ineffective',     label: 'Ineffective (0.75x)',        color: '#f59e0b' },
    { field: 'veryIneffective', label: 'Very Ineffective (0.5x)',    color: '#ef4444' },
    { field: 'nulo',            label: 'Immune (0x)',                color: '#a78bfa' },
  ];

  return (
    <div className="pxg-tab-content">
      <h2 className="pxg-tab-title">Effectiveness</h2>
      <p className="pxg-tab-desc">Automatically computed from Elements. Override manually if needed.</p>
      <div className="pxg-eff-list">
        {rows.map(row => (
          <div key={row.field} className="pxg-eff-row">
            <label className="pxg-eff-label" style={{ color: row.color }}>{row.label}</label>
            <input className="pxg-input" value={eff[row.field as keyof typeof eff]}
              onChange={e => updateEffectiveness(row.field as any, e.target.value)} placeholder="e.g. Grass and Bug." />
          </div>
        ))}
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
  }

  function handleSelectPokemon(i: number, p: any) {
    updateAltVersion(i, 'name', p.name || '');
    // Image prefix: use the number from the pokemon data or just the number field
    updateAltVersion(i, 'imagePrefix', p.number ? `${p.number} - ` : '');
    setShowSugg(s => ({ ...s, [i]: false }));
  }

  function getFilteredPokemon(i: number) {
    const q = searches[i] || '';
    if (!q.trim()) return [];
    return (pokemonMovesData as any[]).filter(p => p.name?.toLowerCase().includes(q.toLowerCase())).slice(0, 6);
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
                        src={resolveWikiImg(`${alt.imagePrefix}${alt.name}.png`)}
                        alt={alt.name}
                        style={{ width: 40, height: 40, objectFit: 'contain', imageRendering: 'pixelated' }}
                        onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }}
                      />
                      <span className="pxg-preview-label" style={{ fontSize: 12 }}>{alt.imagePrefix}{alt.name}.png</span>
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
    <div className="pxg-root">
      <Sidebar />
      <main className="pxg-main">
        {activeTab === 'general'       && <GeneralTab />}
        {activeTab === 'evolutions'    && <EvolutionsTab />}
        {activeTab === 'moves'         && <MovesTab />}
        {activeTab === 'effectiveness' && <EffectivenessTab />}
        {activeTab === 'altVersions'   && <AltVersionsTab />}
        {activeTab === 'preview'       && <ExportTab />}
      </main>
      <PreviewPanel />
    </div>
  );
}
