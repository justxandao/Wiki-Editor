import { create } from 'zustand';
import { PokedexSchema, MoveEntry, EvolutionEntry, AltVersionEntry } from '../types/schema';
import { INITIAL_POKEDEX_SCHEMA } from '../schema/schema';

interface PokedexState {
  isOpen: boolean;
  activeTab: string; // 'builder' | 'json'
  schema: PokedexSchema;
  setOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  updateGeneralInfo: (field: keyof PokedexSchema['generalInfo'], value: string) => void;
  updateEffectiveness: (field: keyof PokedexSchema['effectiveness'], value: string) => void;
  
  // Moves
  setMoves: (moves: MoveEntry[]) => void;
  updateMove: (index: number, field: keyof MoveEntry, value: any) => void;
  toggleMoveIcon: (moveIndex: number, icon: string) => void;

  // Evolutions
  addEvolution: () => void;
  updateEvolution: (index: number, field: keyof EvolutionEntry, value: string) => void;
  removeEvolution: (index: number) => void;

  // Alt Versions
  addAltVersion: () => void;
  updateAltVersion: (index: number, field: keyof AltVersionEntry, value: string) => void;
  removeAltVersion: (index: number) => void;

  importSchema: (schema: PokedexSchema) => void;
  resetSchema: () => void;
}

export const usePokedexStore = create<PokedexState>((set) => ({
  isOpen: false,
  activeTab: 'builder',
  schema: JSON.parse(JSON.stringify(INITIAL_POKEDEX_SCHEMA)),
  setOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (activeTab) => set({ activeTab }),
  
  updateGeneralInfo: (field, value) => set((s) => ({
    schema: {
      ...s.schema,
      generalInfo: {
        ...s.schema.generalInfo,
        [field]: value
      }
    }
  })),

  updateEffectiveness: (field, value) => set((s) => ({
    schema: {
      ...s.schema,
      effectiveness: {
        ...s.schema.effectiveness,
        [field]: value
      }
    }
  })),

  setMoves: (moves) => set((s) => ({
    schema: {
      ...s.schema,
      moves
    }
  })),

  updateMove: (index, field, value) => set((s) => {
    const nextMoves = [...s.schema.moves];
    if (nextMoves[index]) {
      nextMoves[index] = {
        ...nextMoves[index],
        [field]: value
      };
    }
    return { schema: { ...s.schema, moves: nextMoves } };
  }),

  toggleMoveIcon: (moveIndex, icon) => set((s) => {
    const nextMoves = [...s.schema.moves];
    if (nextMoves[moveIndex]) {
      const currentIcons = nextMoves[moveIndex].icons;
      const icons = currentIcons.includes(icon)
        ? currentIcons.filter(i => i !== icon)
        : [...currentIcons, icon];
      nextMoves[moveIndex] = {
        ...nextMoves[moveIndex],
        icons
      };
    }
    return { schema: { ...s.schema, moves: nextMoves } };
  }),

  addEvolution: () => set((s) => ({
    schema: {
      ...s.schema,
      evolutions: [...s.schema.evolutions, { name: '', level: '' }]
    }
  })),

  updateEvolution: (index, field, value) => set((s) => {
    const nextEvos = [...s.schema.evolutions];
    if (nextEvos[index]) {
      nextEvos[index] = {
        ...nextEvos[index],
        [field]: value
      };
    }
    return { schema: { ...s.schema, evolutions: nextEvos } };
  }),

  removeEvolution: (index) => set((s) => {
    const nextEvos = [...s.schema.evolutions];
    nextEvos.splice(index, 1);
    return { schema: { ...s.schema, evolutions: nextEvos } };
  }),

  addAltVersion: () => set((s) => ({
    schema: {
      ...s.schema,
      altVersions: [...s.schema.altVersions, { name: '', imagePrefix: '' }]
    }
  })),

  updateAltVersion: (index, field, value) => set((s) => {
    const nextAlts = [...s.schema.altVersions];
    if (nextAlts[index]) {
      nextAlts[index] = {
        ...nextAlts[index],
        [field]: value
      };
    }
    return { schema: { ...s.schema, altVersions: nextAlts } };
  }),

  removeAltVersion: (index) => set((s) => {
    const nextAlts = [...s.schema.altVersions];
    nextAlts.splice(index, 1);
    return { schema: { ...s.schema, altVersions: nextAlts } };
  }),

  importSchema: (schema) => set({ schema }),
  resetSchema: () => set({ schema: JSON.parse(JSON.stringify(INITIAL_POKEDEX_SCHEMA)) }),
}));
