import React, { useState, useMemo } from 'react';
import { usePokedexStore } from '../store/pokedexStore';
import { renderPokedexWikitext } from '../renderer/renderer';
import { LivePreview } from '../preview/LivePreview';
import { useEditorStore } from '../../state/editorStore';
import movePresets from '../data/move-presets.json';
import { 
  Settings, 
  Info, 
  Zap, 
  Shield, 
  Image as ImageIcon, 
  Copy, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Save, 
  X,
  Eye,
  Terminal
} from 'lucide-react';

export function PokedexBuilder() {
  const { 
    isOpen, 
    setOpen, 
    schema, 
    updateGeneralInfo, 
    updateEffectiveness, 
    updateMove, 
    toggleMoveIcon,
    addEvolution, 
    updateEvolution, 
    removeEvolution, 
    addAltVersion, 
    updateAltVersion, 
    removeAltVersion
  } = usePokedexStore();

  const { createTab } = useEditorStore();

  const [activeTab, setActiveTab] = useState('general');
  const [activeRightTab, setActiveRightTab] = useState('wikitext'); // 'wikitext' | 'preview'
  const [isCopied, setIsCopied] = useState(false);
  const [presetSearch, setPresetSearch] = useState<Record<number, string>>({});

  // Options
  const elementOptions = ['Normal', 'Fire', 'Water', 'Grass', 'Electric', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy'];
  const clanOptions = ['Volcanic', 'Seavell', 'Naturia', 'Raibolt', 'Psycraft', 'Orebound', 'Wingeon', 'Malefic', 'Gardestrike', 'Ironhard'];
  const iconOptions = ['AOE', 'Target', 'Self', 'Damage', 'Stun', 'Paralyze', 'Burn', 'Focus Blocked', 'NeverBoost', 'Nevermiss', 'Debuff', 'Buff', 'Passive'];

  const generatedWikitext = useMemo(() => {
    return renderPokedexWikitext(schema);
  }, [schema]);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedWikitext);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleInsertIntoEditor = () => {
    createTab(
      `${schema.generalInfo.name || 'Pokemon'}_Dex`,
      generatedWikitext
    );
    setOpen(false);
  };

  const handleSelectPreset = (moveIndex: number, preset: typeof movePresets[0]) => {
    updateMove(moveIndex, 'name', preset.name);
    updateMove(moveIndex, 'element', preset.type);
    updateMove(moveIndex, 'cooldownPvP', preset.cooldown);
    updateMove(moveIndex, 'cooldownPvE', preset.cooldown);
    updateMove(moveIndex, 'icons', preset.categories);
    setPresetSearch(prev => ({ ...prev, [moveIndex]: '' }));
  };

  // Live syntax highlighter for Wikitext preview
  const highlightWikitext = (text: string) => {
    // Escape standard HTML characters to prevent broken preview DOM
    let html = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    html = html
      // Section headers in blue
      .replace(/===(.*?)===/g, '<span class="text-blue-300 font-bold">===$1===</span>')
      .replace(/== (.*?) ==/g, '<span class="text-blue-400 font-bold">== $1 ==</span>')
      // Bold tags in bold yellow
      .replace(/'''(.*?)'''/g, '<span class="text-yellow-300 font-semibold">\'\'\'$1\'\'\'</span>')
      // Links in green
      .replace(/\[\[(file|arquivo):(.*?)\]\]/gi, '<span class="text-emerald-400 font-medium">[[$1:$2]]</span>')
      .replace(/\[\[(.*?)\]\]/g, '<span class="text-green-400 font-medium">[[$1]]</span>')
      // Table structures in orange
      .replace(/(^|\n)(\{\||\|\}|\|-)/g, '$1<span class="text-orange-400 font-bold">$2</span>')
      // Table row cells
      .replace(/(^|\n)(\| |! |\|)/g, '$1<span class="text-orange-500/70 font-semibold">$2</span>')
      // HTML elements inside Wikitext
      .replace(/&lt;center&gt;/g, '<span class="text-purple-400 font-mono">&lt;center&gt;</span>')
      .replace(/&lt;\/center&gt;/g, '<span class="text-purple-400 font-mono">&lt;/center&gt;</span>')
      .replace(/&lt;br\s*\/?&gt;/g, '<span class="text-purple-400 font-mono">&lt;br /&gt;</span>')
      .replace(/&lt;br&gt;/g, '<span class="text-purple-400 font-mono">&lt;br&gt;</span>')
      .replace(/&lt;\/br&gt;/g, '<span class="text-purple-400 font-mono">&lt;/br&gt;</span>')
      .replace(/&lt;b&gt;/g, '<span class="text-purple-300 font-mono">&lt;b&gt;</span>')
      .replace(/&lt;\/b&gt;/g, '<span class="text-purple-300 font-mono">&lt;/b&gt;</span>');

    return html;
  };

  // Styled helper definitions
  const inputClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 placeholder-zinc-700 text-xs font-semibold shadow-inner";
  const selectClass = "w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-2.5 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs font-semibold cursor-pointer shadow-inner";
  const labelClass = "text-xs font-semibold text-zinc-400 block mb-1.5";

  const renderGeneralForm = () => (
    <div className="space-y-8 animate-fade-in pr-1">
      {/* Dados Principais */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
          <span>📝</span> Dados Principais
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className={labelClass}>Nome do Pokémon</label>
            <input 
              type="text" 
              className={inputClass}
              value={schema.generalInfo.name} 
              onChange={e => updateGeneralInfo('name', e.target.value)} 
              placeholder="Ex: Hisuian Arcanine"
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Número (Dex)</label>
            <input 
              type="text" 
              className={inputClass}
              value={schema.generalInfo.number} 
              onChange={e => updateGeneralInfo('number', e.target.value)} 
              placeholder="Ex: 059" 
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Level Base</label>
            <input 
              type="text" 
              className={inputClass}
              value={schema.generalInfo.level} 
              onChange={e => updateGeneralInfo('level', e.target.value)} 
            />
          </div>
          <div className="space-y-1.5">
            <label className={labelClass}>Elementos</label>
            <input 
              type="text" 
              className={inputClass}
              value={schema.generalInfo.element} 
              onChange={e => updateGeneralInfo('element', e.target.value)} 
              placeholder="Ex: Fire and Rock"
            />
          </div>
        </div>
      </section>

      {/* Requisitos & Materia */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
          <span>⚡</span> Requisitos & Matéria
        </h2>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className={labelClass}>Habilidades de Mapa</label>
            <input 
              type="text" 
              className={inputClass}
              value={schema.generalInfo.abilities} 
              onChange={e => updateGeneralInfo('abilities', e.target.value)} 
              placeholder="Ex: ride, dig, headbutt."
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className={labelClass}>Boost Recomendado</label>
              <input 
                type="text" 
                className={inputClass}
                value={schema.generalInfo.boost} 
                onChange={e => updateGeneralInfo('boost', e.target.value)} 
                placeholder="Ex: Fire Stone (2)"
              />
            </div>
            <div className="space-y-1.5">
              <label className={labelClass}>Matéria / Clã</label>
              <input 
                type="text" 
                className={inputClass}
                value={schema.generalInfo.materia} 
                onChange={e => updateGeneralInfo('materia', e.target.value)} 
                placeholder="Ex: Volcanic Mastered"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Descricao Oficial */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
          <span>📖</span> Descrição Oficial da Wiki
        </h2>
        <div className="space-y-1.5">
          <textarea 
            rows={4}
            className="w-full bg-zinc-950 border border-zinc-800 text-white rounded-lg px-4 py-3 outline-none transition-all focus:border-orange-500 focus:ring-1 focus:ring-orange-500 text-xs font-semibold resize-none leading-relaxed"
            value={schema.generalInfo.description} 
            onChange={e => updateGeneralInfo('description', e.target.value)} 
            placeholder="Escreva a descrição oficial aqui..."
          />
        </div>
      </section>

      {/* Linha Evolutiva */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider flex items-center gap-2">
            🧬 Linha Evolutiva
          </h2>
          <button 
            onClick={addEvolution} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold rounded-md transition border border-zinc-700"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Evolução
          </button>
        </div>

        <div className="space-y-3">
          {schema.evolutions.map((evo, index) => (
            <div key={index} className="flex items-center space-x-3 bg-zinc-950 p-4 rounded-xl border border-zinc-800 animate-fade-in group shadow-inner">
              <span className="text-[10px] font-black text-zinc-500 w-6 text-center">{index + 1}</span>
              <input 
                type="text" 
                placeholder="Nome do Pokémon" 
                className="flex-1 bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-xs font-semibold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                value={evo.name} 
                onChange={e => updateEvolution(index, 'name', e.target.value)} 
              />
              <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Lv.</span>
              <input 
                type="text" 
                placeholder="Level" 
                className="w-20 bg-zinc-900 border border-zinc-800 text-white rounded-lg px-3 py-2 text-center text-xs font-semibold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                value={evo.level} 
                onChange={e => updateEvolution(index, 'level', e.target.value)} 
              />
              <button 
                onClick={() => removeEvolution(index)} 
                className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition" 
                title="Remover"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const renderMovesForm = () => (
    <div className="space-y-8 animate-fade-in pr-1">
      {/* Moves tip info */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 flex gap-3 shadow-md">
        <div className="text-orange-500 text-lg">💡</div>
        <p className="text-[11px] font-semibold text-zinc-400 leading-relaxed">
          Preencha os dados de cada slot. O wikitext final gerará as tabelas de PvP e PvE de forma sincronizada. Para destacar movimentos que mudam no PvE (negrito), marque a caixa <span className="text-orange-500 font-bold">Diferente no PvE</span>.
        </p>
      </div>

      {schema.moves.map((move, index) => {
        const query = presetSearch[index] || '';
        const filteredPresets = query.trim()
          ? movePresets.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
          : [];

        return (
          <div key={index} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col gap-5 relative hover:border-zinc-700 transition duration-200 shadow-md space-y-1">
            {/* Header: Slot Badge, Name input, Preset Search & Checkbox */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="px-2.5 py-0.5 rounded bg-orange-500/10 border border-orange-500/20 text-orange-500 text-xs font-bold font-outfit uppercase">
                  {move.slot}
                </span>
                
                <div className="relative flex-1 min-w-0">
                  <div className="flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Nome do Movimento" 
                      className="w-full bg-zinc-950 px-3 py-2 text-xs border border-zinc-800 rounded-lg text-white font-bold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition" 
                      value={move.name} 
                      onChange={e => updateMove(index, 'name', e.target.value)} 
                    />
                    
                    {/* Compact preset selector */}
                    <div className="relative flex-shrink-0">
                      <input 
                        type="text" 
                        placeholder="💡 Preset..." 
                        value={query}
                        onChange={e => setPresetSearch(prev => ({ ...prev, [index]: e.target.value }))}
                        className="w-28 bg-zinc-950 hover:bg-zinc-800 px-3 py-2 text-[10px] border border-zinc-800 rounded-lg text-orange-500 font-bold placeholder-orange-500/40 outline-none transition" 
                      />
                      {filteredPresets.length > 0 && (
                        <div className="absolute top-full right-0 mt-1 bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl z-20 max-h-40 overflow-y-auto p-1 min-w-[200px]">
                          {filteredPresets.map(preset => (
                            <div 
                              key={preset.name} 
                              onClick={() => handleSelectPreset(index, preset)} 
                              className="p-2 hover:bg-zinc-800 rounded cursor-pointer text-[10px] font-bold text-white flex justify-between gap-2"
                            >
                              <span>{preset.name}</span>
                              <span className="text-[9px] text-zinc-500">{preset.cooldown}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* PvP differences & level */}
              <div className="flex items-center gap-4 text-xs font-bold select-none">
                <label className="flex items-center space-x-1.5 cursor-pointer text-zinc-400 hover:text-white transition">
                  <input 
                    type="checkbox" 
                    checked={move.isDifferentPvE} 
                    onChange={e => updateMove(index, 'isDifferentPvE', e.target.checked)} 
                    className="rounded border-zinc-800 bg-zinc-950 text-orange-500 focus:ring-orange-500/40" 
                  />
                  <span>Diferente no PvE</span>
                </label>
                <div className="flex items-center space-x-1">
                  <span className="text-zinc-500">Lv:</span>
                  <input 
                    type="text" 
                    className="w-12 bg-zinc-950 border border-zinc-800 rounded-lg p-1.5 text-center font-bold text-white text-xs outline-none" 
                    value={move.level} 
                    onChange={e => updateMove(index, 'level', e.target.value)} 
                  />
                </div>
              </div>
            </div>

            {/* Row 2 inputs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className={labelClass}>Cooldown PvP</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 10s" 
                    className={inputClass} 
                    value={move.cooldownPvP} 
                    onChange={e => updateMove(index, 'cooldownPvP', e.target.value)} 
                  />
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Cooldown PvE</label>
                  <input 
                    type="text" 
                    placeholder="Ex: 12s" 
                    className={`${inputClass} ${move.isDifferentPvE && move.cooldownPvP !== move.cooldownPvE ? 'border-orange-500/50 bg-orange-500/5 text-orange-400' : ''}`} 
                    value={move.cooldownPvE} 
                    onChange={e => updateMove(index, 'cooldownPvE', e.target.value)} 
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <div className="flex-1">
                  <label className={labelClass}>Elemento</label>
                  <select 
                    className={selectClass} 
                    value={move.element} 
                    onChange={e => updateMove(index, 'element', e.target.value)}
                  >
                    <option value="Normal1" className="bg-zinc-900">Normal</option>
                    {elementOptions.filter(el => el !== 'Normal').map(opt => (
                      <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <label className={labelClass}>Link / Clan</label>
                  <select 
                    className={selectClass} 
                    value={move.clan} 
                    onChange={e => updateMove(index, 'clan', e.target.value)}
                  >
                    {clanOptions.map(opt => (
                      <option key={opt} value={opt} className="bg-zinc-900">{opt}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Categorias / Tags selector */}
            <div>
              <label className={labelClass}>Ícones / Categorias do Golpe</label>
              <div className="flex flex-wrap gap-1.5">
                {iconOptions.map(icon => {
                  const isActive = move.icons.includes(icon);
                  return (
                    <button
                      key={icon}
                      onClick={() => toggleMoveIcon(index, icon)}
                      className={`text-[9px] font-bold px-2.5 py-1.5 rounded-full border transition duration-150 ${isActive ? 'bg-orange-500/10 border-orange-500/40 text-orange-400 font-black' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-white hover:border-zinc-700'}`}
                    >
                      {icon}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderMiscForm = () => (
    <div className="space-y-8 animate-fade-in pr-1">
      {/* Efetividades Card */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider border-b border-zinc-800 pb-2 flex items-center gap-2">
          <Shield className="w-4 h-4 text-orange-500" /> Efetividades Elementais
        </h2>
        
        <div className="grid grid-cols-1 gap-4 bg-zinc-900 border border-zinc-800 p-6 rounded-xl shadow-md">
          {[
            { field: 'veryEffective', label: 'Muito Efetivo', color: 'border-l-4 border-emerald-500 bg-emerald-500/5 focus-within:border-emerald-400 text-emerald-400' },
            { field: 'effective', label: 'Efetivo', color: 'border-l-4 border-teal-500 bg-teal-500/5 focus-within:border-teal-400 text-teal-400' },
            { field: 'normal', label: 'Normal', color: 'border-l-4 border-zinc-500 bg-zinc-950/20 focus-within:border-zinc-400 text-zinc-400' },
            { field: 'ineffective', label: 'Inefetivo', color: 'border-l-4 border-amber-500 bg-amber-500/5 focus-within:border-amber-400 text-amber-400' },
            { field: 'veryIneffective', label: 'Muito Inefetivo', color: 'border-l-4 border-red-500 bg-red-500/5 focus-within:border-red-400 text-red-400' }
          ].map(row => (
            <div key={row.field} className={`flex flex-col sm:flex-row sm:items-center p-3 rounded-lg border border-zinc-800 gap-3 transition ${row.color}`}>
              <span className="w-28 text-[10px] font-bold uppercase tracking-wider block">
                {row.label}
              </span>
              <input 
                type="text" 
                className="flex-1 bg-zinc-950 px-3 py-2 rounded-lg text-xs font-semibold text-white outline-none border border-zinc-800 focus:border-zinc-700 transition"
                value={schema.effectiveness[row.field as keyof typeof schema.effectiveness]} 
                onChange={e => updateEffectiveness(row.field as keyof typeof schema.effectiveness, e.target.value)} 
              />
            </div>
          ))}
        </div>
      </section>

      {/* Outras Versões Card */}
      <section className="space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-2">
          <h2 className="text-sm font-bold text-orange-500 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-orange-500" /> Outras Versões (Shiny, Mega...)
          </h2>
          <button 
            onClick={addAltVersion} 
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-bold rounded-md transition border border-zinc-700"
          >
            <Plus className="w-3.5 h-3.5" /> Adicionar Versão
          </button>
        </div>

        <div className="space-y-4">
          {schema.altVersions.map((alt, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-4 bg-zinc-900 border border-zinc-800 p-5 rounded-xl relative animate-fade-in shadow-md">
              <div className="flex-1">
                <label className={labelClass}>Prefixo da Imagem</label>
                <input 
                  type="text" 
                  placeholder="Ex: 059-Sh " 
                  className="w-full bg-zinc-950 px-3 py-2 text-xs border border-zinc-800 rounded-lg text-white font-mono outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                  value={alt.imagePrefix} 
                  onChange={e => updateAltVersion(index, 'imagePrefix', e.target.value)} 
                />
              </div>
              <div className="flex-1">
                <label className={labelClass}>Nome do Link</label>
                <input 
                  type="text" 
                  placeholder="Ex: Shiny Arcanine" 
                  className="w-full bg-zinc-950 px-3 py-2 text-xs border border-zinc-800 rounded-lg text-white font-bold outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500" 
                  value={alt.name} 
                  onChange={e => updateAltVersion(index, 'name', e.target.value)} 
                />
              </div>
              <div className="pt-4 sm:pt-6 flex items-center justify-center">
                <button 
                  onClick={() => removeAltVersion(index)} 
                  className="p-2 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-lg transition"
                  title="Remover"
                >
                  <Trash2 className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  return (
    <div className="fixed inset-0 z-40 bg-zinc-950 text-gray-200 flex flex-col font-sans select-none antialiased animate-fade-in">
      
      {/* Header Workspace Navigation */}
      <header className="h-14 border-b border-zinc-800 bg-zinc-900 px-6 flex items-center justify-between z-20">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse"></span>
          <div>
            <h1 className="text-sm font-black tracking-wider text-white uppercase font-outfit">Pokédex Visual Builder</h1>
            <span className="text-[9px] text-zinc-500 font-bold block mt-0.5 uppercase tracking-widest">v2.0 Refactored • Connected</span>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(false)}
            className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-500 hover:text-white transition duration-150"
          >
            <X size={16} />
          </button>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT PANEL: Form Editor with spacing and design breath */}
        <div className="w-1/2 flex flex-col border-r border-zinc-800 bg-zinc-900 shadow-xl z-10 overflow-y-auto custom-scrollbar">
          
          {/* Tabs header selector */}
          <div className="flex border-b border-zinc-800 bg-zinc-900 p-2 gap-2 sticky top-0 z-10">
            <button 
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-150 flex items-center justify-center gap-1.5 ${activeTab === 'general' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/40'}`}
              onClick={() => setActiveTab('general')}
            >
              <Info className="w-4 h-4" /> Info Geral
            </button>
            <button 
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-150 flex items-center justify-center gap-1.5 ${activeTab === 'moves' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/40'}`}
              onClick={() => setActiveTab('moves')}
            >
              <Zap className="w-4 h-4" /> Movimentos
            </button>
            <button 
              className={`flex-1 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition duration-150 flex items-center justify-center gap-1.5 ${activeTab === 'misc' ? 'bg-zinc-800 text-white shadow-md border border-zinc-700' : 'text-zinc-500 hover:text-white hover:bg-zinc-800/40'}`}
              onClick={() => setActiveTab('misc')}
            >
              <Settings className="w-4 h-4" /> Outros
            </button>
          </div>

          {/* Form Scroll Body */}
          <div className="p-8 space-y-8 flex-1 scrollbar-thin bg-zinc-900">
            {activeTab === 'general' && renderGeneralForm()}
            {activeTab === 'moves' && renderMovesForm()}
            {activeTab === 'misc' && renderMiscForm()}
          </div>
        </div>

        {/* RIGHT PANEL: Code Editor & Live simulation */}
        <div className="w-1/2 bg-black flex flex-col relative h-full">
          
          {/* Floating actions & tabs header */}
          <header className="absolute top-0 right-0 left-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/90 to-transparent z-20">
            {/* View selectors */}
            <div className="flex bg-zinc-900/90 border border-zinc-800 p-1 rounded-lg pointer-events-auto shadow-lg backdrop-blur">
              <button
                onClick={() => setActiveRightTab('wikitext')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider transition ${activeRightTab === 'wikitext' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-white'}`}
              >
                <Terminal size={12} />
                Wikitext
              </button>
              <button
                onClick={() => setActiveRightTab('preview')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-extrabold uppercase tracking-wider transition ${activeRightTab === 'preview' ? 'bg-zinc-800 text-white border border-zinc-700' : 'text-zinc-500 hover:text-white'}`}
              >
                <Eye size={12} />
                Preview
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pointer-events-auto shadow-lg">
              <button 
                onClick={handleCopy}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition border ${isCopied ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-zinc-800 hover:bg-zinc-700 text-white border-zinc-700'}`}
              >
                {isCopied ? <><CheckCircle className="w-4 h-4 inline mr-1.5" /> Copiado!</> : <><Copy className="w-4 h-4 inline mr-1.5" /> Copiar Código</>}
              </button>
              <button 
                onClick={handleInsertIntoEditor}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg transition shadow-lg shadow-orange-900/50"
              >
                <Save className="w-4 h-4 inline mr-1.5" /> Inserir no Editor
              </button>
            </div>
          </header>

          {/* Render Area */}
          <div className="flex-1 p-8 pt-20 overflow-y-auto custom-scrollbar select-text bg-[#030303]">
            {activeRightTab === 'wikitext' ? (
              <pre className="font-mono text-xs leading-relaxed text-zinc-300 whitespace-pre-wrap select-text selection:bg-orange-500/30">
                <code dangerouslySetInnerHTML={{ 
                  __html: highlightWikitext(generatedWikitext)
                }}>
                </code>
              </pre>
            ) : (
              <div className="w-full min-h-[400px] rounded-xl border border-zinc-800 overflow-hidden bg-white text-black shadow-2xl">
                <LivePreview content={generatedWikitext} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
