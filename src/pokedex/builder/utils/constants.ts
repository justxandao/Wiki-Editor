import React from 'react';

export const TYPE_CHART: Record<string, Record<string, number>> = {
  Normal:   { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire:     { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water:    { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass:    { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice:      { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 0.5, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison:   { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground:   { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying:   { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic:  { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug:      { Fire: 0.5, Grass: 2, Fighting: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock:     { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost:    { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon:   { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark:     { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel:    { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2, Fighting: 0.5, Ground: 0.5 },
  Fairy:    { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
  Crystal:  {}, // Custom PxG type - neutral against all
};

export const ALL_ATTACK_TYPES = ['Normal', 'Fire', 'Water', 'Electric', 'Grass', 'Ice', 'Fighting', 'Poison', 'Ground', 'Flying', 'Psychic', 'Bug', 'Rock', 'Ghost', 'Dragon', 'Dark', 'Steel', 'Fairy', 'Crystal'];

export const ELEMENT_COLORS: Record<string, string> = {
  Normal: '#9CA3AF', Fire: '#EF4444', Water: '#3B82F6', Grass: '#10B981',
  Electric: '#F59E0B', Ice: '#06B6D4', Fighting: '#DC2626', Poison: '#8B5CF6',
  Ground: '#D97706', Flying: '#60A5FA', Psychic: '#EC4899', Bug: '#84CC16',
  Rock: '#78350F', Ghost: '#6366F1', Dragon: '#4F46E5', Dark: '#374151',
  Steel: '#9CA3AF', Fairy: '#F472B6', Crystal: '#C084FC', Neutral: '#94A3B8'
};

export const MAP_ABILITIES_LIST = ["Dig", "Rock Smash", "Cut", "Teleport", "Light", "Fly", "Ride", "Surf", "Headbutt", "Blink", "Dark Portal", "Strength"];

export const ELEMENTS = Object.keys(ELEMENT_COLORS);

export const FORM_ATTRIBUTES = [
  { id: 'AOE', label: 'Aoe', file: 'AOE.png' },
  { id: 'Blind', label: 'Blind', file: 'Blind.png' },
  { id: 'Buff', label: 'Buff', file: 'Buff.png' },
  { id: 'Burn', label: 'Burn', file: 'Burn.png' },
  { id: 'Confusion', label: 'Confusion', file: 'Confusion.png' },
  { id: 'Control Blocked', label: 'Ctrl Block', file: 'Control_Blocked.png' },
  { id: 'Damage', label: 'Damage', file: 'Damage.png' },
  { id: 'Debuff', label: 'Debuff', file: 'Debuff.png' },
  { id: 'Focus Blocked', label: 'Foc. Block', file: 'Focus_Blocked.png' },
  { id: 'Healing', label: 'Healing', file: 'Healing.png' },
  { id: 'Knockback', label: 'Knockback', file: 'Knockback.png' },
  { id: 'Lifesteal', label: 'Lifesteal', file: 'Lifesteal.png' },
  { id: 'Locked', label: 'Locked', file: 'Locked.png' },
  { id: 'Mirror Coat Blocked', label: 'Mirror Blk', file: 'Mirror_Coat_Blocked.png' },
  { id: 'NeverBoost', label: 'NvrBoost', file: 'NeverBoost.png' },
  { id: 'Nevermiss', label: 'Nevermiss', file: 'Nevermiss.png' },
  { id: 'Paralyze', label: 'Paralyze', file: 'Paralyze.png' },
  { id: 'Passive', label: 'Passive', file: 'Passive.png' },
  { id: 'Poison', label: 'Poison', file: 'Poison.png' },
  { id: 'Reflect Blocked', label: 'Refl. Blk', file: 'Reflect_Blocked.png' },
  { id: 'Self', label: 'Self', file: 'Self.png' },
  { id: 'Silence', label: 'Silence', file: 'Silence.png' },
  { id: 'Sketch Blocked', label: 'Sketch Blk', file: 'Sketch_Blocked.png' },
  { id: 'Slow', label: 'Slow', file: 'Slow.png' },
  { id: 'Stun', label: 'Stun', file: 'Stun.png' },
  { id: 'Target', label: 'Target', file: 'Target.png' }
];

export const CLAN_MATERIA_MAP: Record<string, Record<string, string>> = {
  Volcanic:    { T4: 'Volcanic Mastered', T3: 'Volcanic Enhanced', T2: 'Volcanic Superior', T1: 'Volcanic Mastered', Lendario: 'Volcanic Mastered' },
  Seavell:     { T4: 'Seavell Mastered',  T3: 'Seavell Enhanced',  T2: 'Seavell Superior',  T1: 'Seavell Mastered',  Lendario: 'Seavell Mastered' },
  Orebound:    { T4: 'Orebound Mastered', T3: 'Orebound Enhanced', T2: 'Orebound Superior', T1: 'Orebound Mastered', Lendario: 'Orebound Mastered' },
  Wingeon:     { T4: 'Wingeon Mastered',  T3: 'Wingeon Enhanced',  T2: 'Wingeon Superior',  T1: 'Wingeon Mastered',  Lendario: 'Wingeon Mastered' },
  Malefic:     { T4: 'Malefic Mastered',  T3: 'Malefic Enhanced',  T2: 'Malefic Superior',  T1: 'Malefic Mastered',  Lendario: 'Malefic Mastered' },
  Gardestrike: { T4: 'Gardestrike Mastered', T3: 'Gardestrike Enhanced', T2: 'Gardestrike Superior', T1: 'Gardestrike Mastered', Lendario: 'Gardestrike Mastered' },
  Psycraft:    { T4: 'Psycraft Mastered', T3: 'Psycraft Enhanced', T2: 'Psycraft Superior', T1: 'Psycraft Mastered', Lendario: 'Psycraft Mastered' },
  Naturia:     { T4: 'Naturia Mastered',  T3: 'Naturia Enhanced',  T2: 'Naturia Superior',  T1: 'Naturia Mastered',  Lendario: 'Naturia Mastered' },
  Raibolt:     { T4: 'Raibolt Mastered',  T3: 'Raibolt Enhanced',  T2: 'Raibolt Superior',  T1: 'Raibolt Mastered',  Lendario: 'Raibolt Mastered' },
  Ironhard:    { T4: 'Ironhard Mastered', T3: 'Ironhard Enhanced', T2: 'Ironhard Superior', T1: 'Ironhard Mastered', Lendario: 'Ironhard Mastered' },
};

export const TIER_LEVELS: Record<string, string> = {
  T4: '80',
  T3: '100',
  T2: '100',
  T1: '100',
  Lendario: '100',
};
