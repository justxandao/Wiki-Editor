import React, { useState, useRef, useEffect } from 'react';
import { usePokedexStore } from '../../store/pokedexStore';
import {
  calculateEffectiveness,
  resolveWikiImg,
  parseWikitextToSchema,
  parsePastedPokemonText,
  normalizeAbilities,
  getBasePokemonName,
  inferElementsFromMoves,
} from '../utils/helpers';
import { POKEMON_TIERS, ELEMENTS_LIST, MAP_ABILITIES_LIST as MAP_ABILITIES } from '../utils/constants';
import pokemonMovesData from '../../data/pokemon-moves.json';
import evolutionStonesData from '../../data/evolution-stones.json';
import typesClansData from '../../data/types-clans.json';
import { searchPokemon, getPokemonSpriteUrl, resolvePokemon } from '../../../pokemon/pokemon-service';
import { PasteTextModal } from '../components/PasteTextModal';

const CLANS = typesClansData.clans;
const BOOST_TIERS = ['Boost (2)', 'Boost (3)', 'Boost (4)', 'Boost (5)', 'Boost (6)', 'Boost (7)', 'Boost (8)', 'Boost (9)', 'Boost (10)', 'Boost (15)', 'Boost (20)', 'Boost (25)', 'Boost (30)', 'Boost (50)'];

export function GeneralFlow() {
  const { schema, updateGeneralInfo, setEffectiveness, setMoves, updateMove, setEvolutions, importSchema } = usePokedexStore();
  const [showPasteModal, setShowPasteModal] = useState(false);

  const g = schema.generalInfo;

  const [pokemonSearch, setPokemonSearch] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [selectedStone, setSelectedStone] = useState<string | null>(null);
  const [boostTier, setBoostTier] = useState('');
  const [iconName, setIconName] = useState(g.number || '');
  const [iconSearch, setIconSearch] = useState('');
  const [iconResults, setIconResults] = useState<Array<{ name: string; image: string; spriteUrl: string }>>([]);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [selectedClan, setSelectedClan] = useState<string | null>(null);
  const [selectedMateriaType, setSelectedMateriaType] = useState<string | null>(null);
  const [showTierDropdown, setShowTierDropdown] = useState(false);
  const [showClanDropdown, setShowClanDropdown] = useState(false);
  const [showMateriaTypeDropdown, setShowMateriaTypeDropdown] = useState(false);
  const sugRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIconName(g.number || '');
    const stone = evolutionStonesData.find(s => g.boost?.includes(s.name));
    setSelectedStone(stone ? stone.name : null);
    const tierMatch = g.boost?.match(/\((\d+)\)/);
    setBoostTier(tierMatch ? `Boost (${tierMatch[1]})` : '');

    // Derive clan from materia
    if (g.materia) {
      const clan = CLANS.find(c => g.materia.startsWith(c.label));
      setSelectedClan(clan ? clan.id : null);
      const mtype = ['Mastered', 'Enhanced', 'Superior'].find(t => g.materia.includes(t));
      setSelectedMateriaType(mtype || 'Nenhum');
    } else {
      setSelectedClan(null);
      setSelectedMateriaType('Nenhum');
    }
  }, [g.boost, g.materia, g.number]);

  const selectedElements = ELEMENTS_LIST.filter(el =>
    g.element.toLowerCase().includes(el.id.toLowerCase())
  ).map(e => e.id);

  function handleElementClick(elId: string) {
    const current = ELEMENTS_LIST.filter(el =>
      g.element.toLowerCase().includes(el.id.toLowerCase())
    ).map(e => e.id);
    const alreadySelected = current.find(e => e === elId);

    let next: string[];
    if (alreadySelected) {
      next = current.filter(e => e !== elId);
    } else {
      if (current.length >= 2) return;
      next = [...current, elId];
    }
    const elStr = next.join(' and ');
    updateGeneralInfo('element', elStr);
    if (next.length > 0) setEffectiveness(calculateEffectiveness(next));
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

  async function handleSelectPokemon(p: any) {
    setShowSugg(false);
    setPokemonSearch(p.name);

    try {
      const url = `https://wiki.pokexgames.com/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&titles=${encodeURIComponent(p.name)}&format=json&origin=*`;
      const response = await fetch(url);
      const data = await response.json();

      const pages = data.query.pages;
      const pageId = Object.keys(pages)[0];
      if (pageId !== '-1' && pages[pageId].revisions) {
        const text = pages[pageId].revisions[0].slots.main['*'];
        const parsed = parseWikitextToSchema(text);

        if (!parsed.generalInfo.name) parsed.generalInfo.name = p.name;

        let iconToSet = parsed.generalInfo.number;
        if (!iconToSet) {
          const wikiEntry = resolvePokemon(p.name, { strict: true }) || resolvePokemon(getBasePokemonName(p.name), { strict: true });
          if (wikiEntry && wikiEntry.image) {
            iconToSet = wikiEntry.image;
          }
        }
        parsed.generalInfo.number = iconToSet || '';

        importSchema(parsed);
        setIconName(parsed.generalInfo.number);

        const stone = evolutionStonesData.find(s => parsed.generalInfo.boost?.includes(s.name));
        setSelectedStone(stone ? stone.name : null);
        const tierMatch = parsed.generalInfo.boost?.match(/\((\d+)\)/);
        setBoostTier(tierMatch ? `Boost (${tierMatch[1]})` : '');
        if (parsed.generalInfo.materia) {
          const clan = CLANS.find(c => parsed.generalInfo.materia.startsWith(c.label));
          setSelectedClan(clan ? clan.id : null);
          const mtype = ['Mastered', 'Enhanced', 'Superior'].find(t => parsed.generalInfo.materia.includes(t));
          setSelectedMateriaType(mtype || null);
        } else {
          setSelectedClan(null);
          setSelectedMateriaType(null);
        }

        return;
      }
    } catch (e) {
      console.error("Error fetching from wiki:", e);
    }

    // Fallback to local DB if wiki fetch fails or page doesn't exist
    updateGeneralInfo('name', p.name || '');

    // Attempt to resolve the best possible image from pokemon-service
    let fallbackIcon = p.number;
    if (!fallbackIcon || fallbackIcon.trim() === '') {
      const entry = resolvePokemon(p.name, { strict: true }) || resolvePokemon(getBasePokemonName(p.name), { strict: true });
      if (entry && entry.image) {
        fallbackIcon = entry.image;
      }
    }

    updateGeneralInfo('number', fallbackIcon || '');
    updateGeneralInfo('level', p.level || '');
    updateGeneralInfo('element', p.element || '');
    updateGeneralInfo('abilities', p.abilities || '');
    updateGeneralInfo('boost', p.boost || '');
    updateGeneralInfo('materia', p.materia || '');
    setIconName(fallbackIcon || '');
    if (p.moves) setMoves(p.moves);
    const detected = ELEMENTS_LIST.filter(el =>
      (p.element || '').toLowerCase().includes(el.id.toLowerCase()) || 
      (p.element || '').toLowerCase().includes(el.label.toLowerCase())
    ).map(e => e.id);
    if (detected.length > 0) setEffectiveness(calculateEffectiveness(detected.map(d => d.replace('1', ''))));
  }

  async function handleImportText(text: string) {
    const parsed = parsePastedPokemonText(text);
    if (!parsed.name) {
      alert("Não foi possível identificar o nome do Pokémon no texto.");
      return;
    }

    // Prepare fallback data from local DB
    let payload = { name: parsed.name } as any;
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
      payload = { ...matchedPokemon, name: parsed.name };
      const inferredElement = inferElementsFromMoves(matchedPokemon.moves);
      if (inferredElement) payload.element = inferredElement;
    }

    // Tenta carregar informações completas da Wiki (moves, elemento correto, icon)
    await handleSelectPokemon(payload);

    // Sobrescreve com as informações coladas manualmente
    updateGeneralInfo('name', parsed.name);

    if (parsed.level) {
      updateGeneralInfo('level', parsed.level);
      // Atualiza o nível dos golpes usando o store atualizado
      usePokedexStore.getState().schema.moves.forEach((_, idx) => {
        updateMove(idx, 'level', parsed.level!);
      });
    }

    // ── Boost ────────────────────────────────────────────────────────────────────
    if (parsed.boostStoneName || parsed.boost) {
      // Reconstruct canonical format: "<Stone> Boost (<N>)" or just "<Stone>"
      const stoneName = parsed.boostStoneName ?? '';
      const tierNum = parsed.boostTierNumber;
      const canonicalBoost = stoneName
        ? tierNum ? `${stoneName} Boost (${tierNum})` : stoneName
        : parsed.boost ?? '';

      updateGeneralInfo('boost', canonicalBoost);

      // Sync visual state: find matching stone and boost tier
      const stone = evolutionStonesData.find(s => canonicalBoost.includes(s.name));
      setSelectedStone(stone ? stone.name : null);
      setBoostTier(tierNum ? `Boost (${tierNum})` : '');
    }

    // ── Materia ──────────────────────────────────────────────────────────────────
    if (parsed.materiaClan || parsed.materia) {
      const clanLabel = parsed.materiaClan ?? parsed.materia ?? '';
      // Default to 'Mastered' when no type keyword was found
      const materiaTypeStr = parsed.materiaType ?? 'Mastered';
      const canonicalMateria = materiaTypeStr !== 'Nenhum'
        ? `${clanLabel} ${materiaTypeStr}`.trim()
        : clanLabel;

      updateGeneralInfo('materia', canonicalMateria);

      const clan = CLANS.find(c => clanLabel.startsWith(c.label) || c.label === clanLabel);
      setSelectedClan(clan ? clan.id : null);
      setSelectedMateriaType(materiaTypeStr);
    }

    if (parsed.description) {
      updateGeneralInfo('description', parsed.description);
    }
    if (parsed.abilities) {
      updateGeneralInfo('abilities', normalizeAbilities(parsed.abilities));
    }
    if (parsed.evolutions && parsed.evolutions.length > 0) {
      setEvolutions(parsed.evolutions);
    }
  }

  function toggleAbility(ab: string) {
    const current = g.abilities ? g.abilities.split(/,\s*|\s+e\s+|\s+and\s+/i).filter(Boolean).map(a => a.trim()) : [];
    const has = current.find(a => a.toLowerCase() === ab.toLowerCase());
    const next = has ? current.filter(a => a.toLowerCase() !== ab.toLowerCase()) : [...current, ab];
    updateGeneralInfo('abilities', normalizeAbilities(next.join(', ')));
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

    if (val.toLowerCase().endsWith('.png') || val.toLowerCase().endsWith('.webp')) {
      handleIconSelect({ name: val.replace(/\.[^.]+$/, ''), image: val });
      return;
    }

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

  function handleIconSelect(img: any) {
    // Store full filename including extension
    const name = img.image;
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
    if (clan) updateGeneralInfo('materia', selectedMateriaType === 'Nenhum' ? clan.label : `${clan.label} ${materiaKey}`.trim());
  }

  function handleMateriaTypeSelect(mtype: string) {
    const isNone = mtype === 'Nenhum';
    setSelectedMateriaType(isNone ? 'Nenhum' : mtype);
    setShowMateriaTypeDropdown(false);
    const clan = CLANS.find(c => c.id === selectedClan);
    if (clan) updateGeneralInfo('materia', isNone ? clan.label : `${clan.label} ${mtype}`);
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
                src={resolveWikiImg(iconName)}
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
          <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>Nenhum resultado para "{iconSearch}"</p>
        )}
      </div>

      {/* Elements */}
      <div className="pxg-form-group" style={{ marginBottom: 28 }}>
        <label className="pxg-label">Elements (Max 2)</label>
        <div className="pxg-elements-grid">
          {ELEMENTS_LIST.map(el => {
            const isActive = selectedElements.includes(el.id);
            return (
              <button key={el.id} onClick={() => handleElementClick(el.id)}
                className={`pxg-element-btn ${isActive ? 'active' : ''}`} title={el.label}>
                <img src={resolveWikiImg(el.id)} alt={el.label} className="pxg-element-img"
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
            const active = g.abilities?.split(/,\s*|\s+e\s+|\s+and\s+/i)
              .map(a => a.trim().toLowerCase())
              .includes(ab.toLowerCase());
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
                  style={['Feather', 'Dimensional', 'Mirror'].some(n => stone.name.includes(n)) ? { transform: 'scale(0.7)' } : undefined}
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
            <span style={{ color: 'var(--accent-primary)' }}>{g.boost}</span>
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
              {selectedClan ? (() => {
                const c = CLANS.find(cl => cl.id === selectedClan); return c ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <img src={resolveWikiImg(c.file)} style={{ width: 18, height: 18, objectFit: 'contain', imageRendering: 'pixelated' }} />
                    {c.label}
                  </span>
                ) : selectedClan;
              })() : 'Select Clan'}
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
              className={`pxg-dropdown-btn ${selectedMateriaType && selectedMateriaType !== 'Nenhum' ? 'active' : ''}`}
              onClick={() => { setShowMateriaTypeDropdown(v => !v); setShowClanDropdown(false); }}
            >
              {selectedMateriaType || 'Nenhum'}
              <span className="pxg-dropdown-arrow">▾</span>
            </button>
            {showMateriaTypeDropdown && (
              <div className="pxg-dropdown-list" style={{ right: 0, left: 'auto' }}>
                {['Nenhum', 'Mastered', 'Enhanced', 'Superior'].map(mtype => (
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
            <span style={{ color: 'var(--accent-primary)' }}>{g.materia}</span>
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
