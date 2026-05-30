import React from 'react';
import { usePokedexUIStore, usePokedexStore } from '../../store/pokedexStore';
import { NAV_ITEMS } from '../utils/constants';

export function Sidebar() {
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
