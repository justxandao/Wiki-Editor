import React, { useState, useRef } from 'react';
import { usePokedexStore } from '../../store/pokedexStore';
import { resolveWikiImg } from '../utils/helpers';
import { FORM_ATTRIBUTES, ELEMENTS } from '../utils/constants';
import movePresetsData from '../../data/move-presets.json';

interface MoveModalProps {
  idx: number;
  onClose: () => void;
}

export function MoveModal({ idx, onClose }: MoveModalProps) {
  const { schema, updateMove, removeMove } = usePokedexStore();
  const move = schema.moves[idx];
  const [moveSearch, setMoveSearch] = useState(move?.name || '');
  const [showPresets, setShowPresets] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  if (!move) return null;

  const filteredPresets = moveSearch.trim()
    ? movePresetsData.filter((m: any) =>
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
    <div className="pxg-modal-overlay">
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
            <div className="pxg-form-group" style={{ width: 80, flex: 'none' }}>
              <label className="pxg-label">Slot</label>
              <input
                className="pxg-input"
                placeholder="M1"
                value={move.slot}
                onChange={e => updateMove(idx, 'slot', e.target.value.toUpperCase())}
              />
            </div>
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
                onChange={e => {
                  const cleaned = e.target.value.replace(/[^\d.,]/g, '');
                  updateMove(idx, 'cooldownPvE', cleaned ? `${cleaned}s` : '');
                }}
              />
            </div>
            <div className="pxg-form-group">
              <label className="pxg-label">PvP Cooldown</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <input
                  className="pxg-input"
                  style={{ flex: 1 }}
                  placeholder="e.g. 25s (blank = same as PvE)"
                  value={move.cooldownPvP}
                  onChange={e => {
                    const cleaned = e.target.value.replace(/[^\d.,]/g, '');
                    updateMove(idx, 'cooldownPvP', cleaned ? `${cleaned}s` : '');
                  }}
                />
                <button
                  className="pxg-btn-secondary"
                  style={{ padding: '0 8px', fontSize: 12, height: '36px' }}
                  onClick={() => updateMove(idx, 'cooldownPvP', move.cooldownPvE)}
                  title="Copiar cooldown do PvE"
                >
                  = PvE
                </button>
              </div>
            </div>
          </div>

          {/* Element */}
          <div className="pxg-form-group">
            <label className="pxg-label">Element Type</label>
            <div className="pxg-elements-grid pxg-elements-grid-sm">
              {ELEMENTS.map((elName) => {
                const id = elName;
                const label = elName;
                // Just use elName as the icon filename (e.g. Normal.png or Normal1.png? We will handle it by just appending .png in resolveWikiImg)
                const file = `${elName}.png`;
                return (
                <button
                  key={id}
                  onClick={() => updateMove(idx, 'element', id)}
                  className={`pxg-element-btn ${move.element === id ? 'active' : ''}`}
                  title={label}
                >
                  <img src={resolveWikiImg(file)} alt={label} className="pxg-element-img"
                    onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = '0.3'; }} />
                  <span className="pxg-element-label">{label}</span>
                </button>
              )})}
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
          {/* Passive toggle */}
          <label className="pxg-wild-toggle" title="Habilidade passiva — muda o slot para 'P'">
            <input
              type="checkbox"
              checked={move.slot === 'P'}
              onChange={e => updateMove(idx, 'slot', e.target.checked ? 'P' : `M${idx + 1}`)}
            />
            <span className="pxg-wild-toggle-label">⭐ Passiva</span>
          </label>

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
