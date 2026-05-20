import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { Search, Plus, UploadCloud, Copy, Eye, Zap, RefreshCw, LayoutTemplate } from 'lucide-react';
import { renderPokedexWikitext } from '../../renderer/renderer';
import { useEditorStore } from '../../../state/editorStore';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setActiveTab, setFocusMode, focusMode, setPreviewMode, previewMode } = usePokedexUIStore();
  const { addMove, addEvolution, schema } = usePokedexStore();
  const { createTab } = useEditorStore();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-slide-up">
        <Command label="Command Menu" className="flex flex-col w-full h-full">
          <div className="flex items-center px-4 border-b border-white/5">
            <Search className="w-4 h-4 text-zinc-500 mr-2" />
            <Command.Input 
              autoFocus
              className="flex-1 h-12 bg-transparent text-sm text-zinc-100 placeholder:text-zinc-500 outline-none" 
              placeholder="Type a command or search..." 
            />
          </div>

          <Command.List className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
            <Command.Empty className="p-4 text-sm text-center text-zinc-500">No results found.</Command.Empty>

            <Command.Group heading={<div className="px-2 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase">Navigation</div>}>
              <Command.Item 
                onSelect={() => { setActiveTab('general'); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg cursor-pointer aria-selected:bg-white/5 aria-selected:text-white"
              >
                <LayoutTemplate className="w-4 h-4 text-zinc-400" /> Go to General Info
              </Command.Item>
              <Command.Item 
                onSelect={() => { setActiveTab('moves'); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg cursor-pointer aria-selected:bg-white/5 aria-selected:text-white"
              >
                <Zap className="w-4 h-4 text-purple-400" /> Go to Combat / Moves
              </Command.Item>
              <Command.Item 
                onSelect={() => { setActiveTab('evolutions'); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg cursor-pointer aria-selected:bg-white/5 aria-selected:text-white"
              >
                <RefreshCw className="w-4 h-4 text-blue-400" /> Go to Evolutions
              </Command.Item>
            </Command.Group>

            <Command.Group heading={<div className="px-2 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-2">Actions</div>}>
              <Command.Item 
                onSelect={() => { setActiveTab('moves'); addMove(); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg cursor-pointer aria-selected:bg-white/5 aria-selected:text-white"
              >
                <Plus className="w-4 h-4 text-emerald-400" /> Add New Move
              </Command.Item>
              <Command.Item 
                onSelect={() => { setActiveTab('evolutions'); addEvolution(); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg cursor-pointer aria-selected:bg-white/5 aria-selected:text-white"
              >
                <Plus className="w-4 h-4 text-blue-400" /> Add Evolution Stage
              </Command.Item>
              <Command.Item 
                onSelect={() => { 
                  const wikitext = renderPokedexWikitext(schema);
                  createTab(`${schema.generalInfo.name || 'Pokemon'}_Dex`, wikitext);
                  setOpen(false);
                }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg cursor-pointer aria-selected:bg-white/5 aria-selected:text-white"
              >
                <Copy className="w-4 h-4 text-zinc-400" /> Export & Create Tab
              </Command.Item>
            </Command.Group>

            <Command.Group heading={<div className="px-2 py-1.5 text-[10px] font-bold tracking-wider text-zinc-500 uppercase mt-2">Settings</div>}>
              <Command.Item 
                onSelect={() => { setFocusMode(!focusMode); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg cursor-pointer aria-selected:bg-white/5 aria-selected:text-white"
              >
                <Eye className="w-4 h-4 text-zinc-400" /> Toggle Focus Mode
              </Command.Item>
              <Command.Item 
                onSelect={() => { setPreviewMode(!previewMode); setOpen(false); }}
                className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-300 rounded-lg cursor-pointer aria-selected:bg-white/5 aria-selected:text-white"
              >
                <RefreshCw className="w-4 h-4 text-zinc-400" /> Toggle PvP/PvE Preview
              </Command.Item>
            </Command.Group>

          </Command.List>
        </Command>
      </div>
    </div>
  );
}
