import React from 'react';
import { LayoutTemplate, Zap, RefreshCw, ImageIcon, Settings, ArrowLeft, Download, Eye, Trash2 } from 'lucide-react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { useEditorStore } from '../../../state/editorStore';

export function WorkspaceSidebar() {
  const { activeTab, setActiveTab, setOpen } = usePokedexUIStore();
  const { createTab } = useEditorStore();

  const navGroups = [
    {
      title: 'Base Data',
      items: [
        { id: 'general', label: 'Overview', icon: <LayoutTemplate size={16} /> },
      ]
    },
    {
      title: 'Combat & Stats',
      items: [
        { id: 'moves', label: 'Moves & Abilities', icon: <Zap size={16} /> },
        { id: 'effectiveness', label: 'Weaknesses', icon: <Settings size={16} /> }, // Can change icon later
      ]
    },
    {
      title: 'Lineage',
      items: [
        { id: 'evolutions', label: 'Evolution Chain', icon: <RefreshCw size={16} /> },
        { id: 'altVersions', label: 'Alternate Forms', icon: <ImageIcon size={16} /> },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-zinc-950 border-r border-white/5 flex flex-col justify-between flex-shrink-0 h-full select-none relative z-10">
      <div className="flex flex-col h-full">
        {/* Workspace Header */}
        <div className="p-5 flex items-center gap-3 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-sm">
            <span className="text-sm">🐾</span>
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider font-outfit truncate">WikiPokexGames</span>
            <span className="text-sm font-semibold text-zinc-100 truncate">Pokedex Workspace</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <div className="flex-1 overflow-y-auto p-3 space-y-6 custom-scrollbar">
          {navGroups.map((group, idx) => (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2 font-outfit">
                {group.title}
              </h4>
              <nav className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                        isActive
                          ? 'bg-zinc-800/80 text-zinc-100 shadow-sm border border-white/5'
                          : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
                      }`}
                    >
                      <span className={`${isActive ? 'text-zinc-100' : 'text-zinc-500'}`}>
                        {item.icon}
                      </span>
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="p-3 border-t border-white/5 space-y-1 bg-zinc-950">
          <button
            onClick={() => {
              if (confirm('Are you sure you want to clear the entire workspace? All unsaved data will be lost.')) {
                usePokedexStore.getState().resetSchema();
                setActiveTab('general');
              }
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-500/70 hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer border border-transparent"
          >
            <Trash2 size={16} /> Clear Workspace
          </button>
          
          <button
            onClick={() => setActiveTab('publishing')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
              activeTab === 'publishing'
                ? 'bg-zinc-800/80 text-zinc-100 shadow-sm border border-white/5'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50 border border-transparent'
            }`}
          >
            <Download size={16} className="text-zinc-500" /> Publishing
          </button>
          
          <button
            onClick={() => setOpen(false)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/50 transition-colors cursor-pointer border border-transparent"
          >
            <ArrowLeft size={16} /> Exit Builder
          </button>
        </div>
      </div>
    </aside>
  );
}
