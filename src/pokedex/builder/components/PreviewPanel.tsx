import React from 'react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { resolveWikiImg } from '../utils/helpers';

export function PreviewPanel() {
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
