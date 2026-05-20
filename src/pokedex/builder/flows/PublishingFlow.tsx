import React, { useState } from 'react';
import { usePokedexStore, usePokedexUIStore } from '../../store/pokedexStore';
import { renderPokedexWikitext } from '../../renderer/renderer';
import { useEditorStore } from '../../../state/editorStore';
import { parseWikitextToSchema } from '../utils/helpers';
import { Terminal, Copy, Check, Save, Download, UploadCloud } from 'lucide-react';
import { motion } from 'framer-motion';

export function PublishingFlow() {
  const { schema, importSchema } = usePokedexStore();
  const { setOpen } = usePokedexUIStore();
  const { createTab } = useEditorStore();
  
  const [isCopied, setIsCopied] = useState(false);
  const [wikitextToLoad, setWikitextToLoad] = useState('');

  const generatedWikitext = renderPokedexWikitext(schema);

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedWikitext);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleExport = () => {
    createTab(`${schema.generalInfo.name || 'Pokemon'}_Dex`, generatedWikitext);
    setOpen(false);
  };

  const handleImport = () => {
    if (!wikitextToLoad.trim()) return;
    try {
      const parsed = parseWikitextToSchema(wikitextToLoad);
      importSchema(parsed);
      setWikitextToLoad('');
      alert("Successfully imported Wikitext.");
    } catch (e) {
      alert("Error parsing wikitext.");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="max-w-4xl mx-auto space-y-8 pb-20"
    >
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold text-zinc-100">Publishing & Export</h2>
        <p className="text-sm text-zinc-500">Export your configured Pokemon to MediaWiki Wikitext or import an existing one.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Export Column */}
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[400px]">
            <div className="px-4 py-3 border-b border-white/5 bg-zinc-900 flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                <Terminal size={14} className="text-emerald-400" /> Wikitext Output
              </span>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                {isCopied ? <><Check size={14} className="text-emerald-400" /> Copied</> : <><Copy size={14} /> Copy</>}
              </button>
            </div>
            <pre className="flex-1 p-4 overflow-y-auto custom-scrollbar font-mono text-[10px] leading-relaxed text-zinc-400 bg-zinc-950">
              <code>{generatedWikitext}</code>
            </pre>
          </div>
          
          <button 
            onClick={handleExport}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-bold rounded-xl transition-colors cursor-pointer shadow-sm"
          >
            <Download size={16} /> Export to Editor Tab
          </button>
        </div>

        {/* Import Column */}
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-white/5 rounded-2xl overflow-hidden flex flex-col h-[400px]">
            <div className="px-4 py-3 border-b border-white/5 bg-zinc-900 flex items-center gap-2">
              <UploadCloud size={14} className="text-blue-400" />
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
                Import Existing Wikitext
              </span>
            </div>
            <textarea 
              className="flex-1 p-4 bg-zinc-950 text-xs font-mono text-zinc-300 outline-none resize-none custom-scrollbar"
              placeholder="Paste MediaWiki source code here to parse and load it into the builder..."
              value={wikitextToLoad}
              onChange={e => setWikitextToLoad(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleImport}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold rounded-xl transition-colors cursor-pointer border border-white/5 shadow-sm"
          >
            <Save size={16} /> Import and Overwrite
          </button>
        </div>

      </div>
    </motion.div>
  );
}
