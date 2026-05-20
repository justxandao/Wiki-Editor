import React, { useRef } from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { 
  Settings, 
  FileText, 
  ArrowRightLeft, 
  Dna, 
  ShieldAlert, 
  Layers, 
  RotateCcw, 
  Download, 
  Upload 
} from 'lucide-react';

interface SidebarPanelProps {
  onScrollToBlock: (blockId: string) => void;
}

export function SidebarPanel({ onScrollToBlock }: SidebarPanelProps) {
  const { schema, importSchema, resetSchema } = usePokedexStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(schema, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `${schema.generalInfo?.name || 'pokemon'}-pokedex.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.generalInfo && parsed.moves) {
          importSchema(parsed);
        } else {
          alert('JSON inválido ou incompatível.');
        }
      } catch (err) {
        alert('Erro ao analisar o JSON.');
      }
    };
    reader.readAsText(file);
  };

  const blocks = [
    { id: 'general', label: 'Informações Gerais', icon: <Settings size={13} className="text-blue-400" /> },
    { id: 'description', label: 'Descrição da Wiki', icon: <FileText size={13} className="text-green-400" /> },
    { id: 'moves-pvp', label: 'Movimentos PvP', icon: <ArrowRightLeft size={13} className="text-red-400" /> },
    { id: 'moves-pve', label: 'Movimentos PvE', icon: <ArrowRightLeft size={13} className="text-orange-400" /> },
    { id: 'evolutions', label: 'Evoluções', icon: <Dna size={13} className="text-purple-400" /> },
    { id: 'effectiveness', label: 'Efetividades', icon: <ShieldAlert size={13} className="text-yellow-400" /> },
    { id: 'versions', label: 'Outras Versões', icon: <Layers size={13} className="text-pink-400" /> },
  ];

  return (
    <aside className="w-60 border-r border-white/[0.06] bg-[#0E0E12] flex flex-col justify-between flex-shrink-0 h-full overflow-y-auto">
      {/* Top Section */}
      <div className="p-4 flex flex-col gap-6">
        <div>
          <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest block mb-3 px-1">
            Estrutura da Pokédex
          </span>
          <div className="flex flex-col gap-1">
            {blocks.map(block => (
              <button
                key={block.id}
                onClick={() => onScrollToBlock(block.id)}
                className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold text-text-secondary hover:text-white hover:bg-white/[0.05] flex items-center gap-2.5 transition duration-150 group"
              >
                <span className="opacity-80 group-hover:scale-105 transition">{block.icon}</span>
                <span className="flex-1 truncate">{block.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Actions Section */}
      <div className="p-4 border-t border-white/[0.06] bg-[#0B0B0E]/60 flex flex-col gap-1.5">
        <span className="text-[9px] font-extrabold text-text-muted uppercase tracking-widest block mb-2 px-1">
          Ações & Drafts
        </span>

        {/* Import JSON */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleImportFile} 
          accept=".json" 
          className="hidden" 
        />
        <button
          onClick={handleImportClick}
          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-text-secondary hover:text-white hover:bg-white/[0.05] flex items-center gap-2.5 transition"
        >
          <Upload size={13} className="text-text-muted" />
          Importar JSON
        </button>

        {/* Export JSON */}
        <button
          onClick={handleExport}
          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-bold text-text-secondary hover:text-white hover:bg-white/[0.05] flex items-center gap-2.5 transition"
        >
          <Download size={13} className="text-text-muted" />
          Exportar JSON
        </button>

        {/* Reset */}
        <button
          onClick={() => {
            if (confirm('Deseja realmente limpar todos os dados do builder?')) {
              resetSchema();
            }
          }}
          className="w-full text-left px-3 py-1.5 rounded-lg text-xs font-extrabold text-red-400 hover:text-red-300 hover:bg-red-500/10 flex items-center gap-2.5 transition mt-2"
        >
          <RotateCcw size={13} />
          Limpar Builder
        </button>
      </div>
    </aside>
  );
}
