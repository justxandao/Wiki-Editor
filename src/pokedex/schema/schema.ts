import { PokedexSchema } from '../types/schema';

export const INITIAL_POKEDEX_SCHEMA: PokedexSchema = {
  generalInfo: {
    name: '',
    number: '',
    level: '',
    element: '',
    abilities: '',
    boost: '',
    materia: '',
    description: ''
  },
  evolutions: [],
  moves: [],
  effectiveness: {
    veryEffective: '',
    effective: '',
    normal: '',
    ineffective: '',
    veryIneffective: '',
    nulo: ''
  },
  altVersions: []
};
