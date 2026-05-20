export interface GeneralInfo {
  name: string;
  number: string;
  level: string;
  element: string;
  abilities: string;
  boost: string;
  materia: string;
  description: string;
}

export interface EvolutionEntry {
  name: string;
  level: string;
}

export interface MoveEntry {
  id: number;
  slot: string;
  name: string;
  cooldownPvP: string;
  cooldownPvE: string;
  level: string;
  icons: string[];
  element: string;
  clan: string;
  isDifferentPvE: boolean;
  wildOnly?: boolean;
}

export interface EffectivenessData {
  veryEffective: string;
  effective: string;
  normal: string;
  ineffective: string;
  veryIneffective: string;
  nulo: string;
}

export interface AltVersionEntry {
  name: string;
  imagePrefix: string;
}

export interface PokedexSchema {
  generalInfo: GeneralInfo;
  evolutions: EvolutionEntry[];
  moves: MoveEntry[];
  effectiveness: EffectivenessData;
  altVersions: AltVersionEntry[];
}
