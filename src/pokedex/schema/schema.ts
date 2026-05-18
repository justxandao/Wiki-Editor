import { PokedexSchema } from '../types/schema';

export const INITIAL_POKEDEX_SCHEMA: PokedexSchema = {
  generalInfo: {
    name: 'Hisuian Arcanine',
    number: '059',
    level: '100',
    element: 'Fire and Rock',
    abilities: 'dig, rock smash, ride e headbutt.',
    boost: 'Fire Stone ou Rock Stone (2)',
    materia: 'Volcanic Mastered ou Orebound Mastered',
    description: 'Hisuian Arcanine usa suas presas enquanto está envolto em chamas para atacar os inimigos. Apesar da aparência enganosamente volumosa desse Pokémon, ele se move com agilidade como um dançarino.'
  },
  evolutions: [
    { name: 'Hisuian Growlithe', level: '30' },
    { name: 'Hisuian Arcanine', level: '100' }
  ],
  moves: [
    { id: 1, slot: 'M1', name: 'Roar', cooldownPvP: '40s', cooldownPvE: '60s', level: '100', icons: ['AOE', 'Focus Blocked', 'Paralyze', 'NeverBoost'], element: 'Normal1', clan: 'Gardestrike', isDifferentPvE: true },
    { id: 2, slot: 'M2', name: 'Rock Slide', cooldownPvP: '10s', cooldownPvE: '10s', level: '100', icons: ['Target', 'Damage'], element: 'Rock', clan: 'Orebound', isDifferentPvE: false },
    { id: 3, slot: 'M3', name: 'Play Rough', cooldownPvP: '10s', cooldownPvE: '10s', level: '100', icons: ['Target', 'Damage'], element: 'Fairy', clan: 'Psycraft', isDifferentPvE: false },
    { id: 4, slot: 'M4', name: 'Head Smash', cooldownPvP: '45s', cooldownPvE: '40s', level: '100', icons: ['AOE', 'Damage', 'Stun'], element: 'Rock', clan: 'Orebound', isDifferentPvE: true },
    { id: 5, slot: 'M5', name: 'Raging Fury', cooldownPvP: '30s', cooldownPvE: '30s', level: '100', icons: ['Target', 'AOE', 'Damage', 'Debuff', 'Nevermiss'], element: 'Fire', clan: 'Volcanic', isDifferentPvE: false },
    { id: 6, slot: 'M6', name: 'Dragon Pulse', cooldownPvP: '40s', cooldownPvE: '40s', level: '100', icons: ['AOE', 'Damage'], element: 'Dragon', clan: 'Wingeon', isDifferentPvE: false },
    { id: 7, slot: 'M7', name: 'Solar Beam', cooldownPvP: '50s', cooldownPvE: '50s', level: '100', icons: ['AOE', 'Damage'], element: 'Grass', clan: 'Naturia', isDifferentPvE: false },
    { id: 8, slot: 'M8', name: 'Reversal', cooldownPvP: '60s', cooldownPvE: '50s', level: '100', icons: ['AOE', 'Damage'], element: 'Fighting', clan: 'Gardestrike', isDifferentPvE: true },
    { id: 9, slot: 'M9', name: 'Flare Blitz', cooldownPvP: '50s', cooldownPvE: '50s', level: '100', icons: ['AOE', 'Damage', 'Burn'], element: 'Fire', clan: 'Volcanic', isDifferentPvE: false },
    { id: 10, slot: 'M10', name: 'War Dog', cooldownPvP: '50s', cooldownPvE: '60s', level: '100', icons: ['Self', 'Focus Blocked', 'Buff'], element: 'Normal1', clan: 'Gardestrike', isDifferentPvE: true },
    { id: 11, slot: 'P', name: 'Rock Head', cooldownPvP: '', cooldownPvE: '', level: '100', icons: ['Passive', 'Buff'], element: 'Rock', clan: 'Orebound', isDifferentPvE: false }
  ],
  effectiveness: {
    veryEffective: 'Water and Ground.',
    effective: 'Fighting and Rock.',
    normal: 'Grass, Electric, Psychic, Ghost, Dragon, Steel, Dark and Crystal.',
    ineffective: 'Normal, Ice, Poison, Flying, Bug and Fairy.',
    veryIneffective: 'Fire.'
  },
  altVersions: [
    { name: 'Arcanine', imagePrefix: '059-' },
    { name: 'Shiny Arcanine', imagePrefix: '059-Sh ' }
  ]
};
