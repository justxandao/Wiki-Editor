import { PokedexSchema, MoveEntry, EvolutionEntry, AltVersionEntry } from '../types/schema';
import { INITIAL_POKEDEX_SCHEMA } from '../schema/schema';

interface PokedexUIState {
  isOpen: boolean;
  activeTab: string; // 'general' | 'moves' | 'evolutions' | 'altVersions' | 'effectiveness'
  focusMode: boolean;
  focusedItemIndex: number | null; // e.g. which move or evolution is currently being edited
  previewMode: boolean; // For toggling PvP/PvE in preview
  
  setOpen: (isOpen: boolean) => void;
  setActiveTab: (tab: string) => void;
  setFocusMode: (isFocused: boolean) => void;
  setFocusedItem: (index: number | null) => void;
  setPreviewMode: (isPvP: boolean) => void;
}

interface PokedexDomainState {
  schema: PokedexSchema;
  updateGeneralInfo: (field: keyof PokedexSchema['generalInfo'], value: string) => void;
  updateEffectiveness: (field: keyof PokedexSchema['effectiveness'], value: string) => void;
  setEffectiveness: (data: PokedexSchema['effectiveness']) => void;
  
  // Moves
  setMoves: (moves: MoveEntry[]) => void;
  addMove: () => void;
  removeMove: (index: number) => void;
  updateMove: (index: number, field: keyof MoveEntry, value: any) => void;
  toggleMoveIcon: (moveIndex: number, icon: string) => void;

  // Evolutions
  addEvolution: () => void;
  updateEvolution: (index: number, field: keyof EvolutionEntry, value: string) => void;
  removeEvolution: (index: number) => void;
  setEvolutions: (evolutions: EvolutionEntry[]) => void;

  // Alt Versions
  addAltVersion: () => void;
  updateAltVersion: (index: number, field: keyof AltVersionEntry, value: string) => void;
  removeAltVersion: (index: number) => void;

  importSchema: (schema: PokedexSchema) => void;
  resetSchema: () => void;
}

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const usePokedexUIStore = create<PokedexUIState>((set) => ({
  isOpen: false,
  activeTab: 'general',
  focusMode: false,
  focusedItemIndex: null,
  previewMode: false,
  
  setOpen: (isOpen) => set({ isOpen }),
  setActiveTab: (activeTab) => set({ activeTab, focusedItemIndex: null }),
  setFocusMode: (focusMode) => set({ focusMode }),
  setFocusedItem: (focusedItemIndex) => set({ focusedItemIndex }),
  setPreviewMode: (previewMode) => set({ previewMode }),
}));

export const usePokedexStore = create<PokedexDomainState>()(persist((set) => ({
  schema: JSON.parse(JSON.stringify(INITIAL_POKEDEX_SCHEMA)),
  
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

  setEffectiveness: (data) => set((s) => ({
    schema: {
      ...s.schema,
      effectiveness: data
    }
  })),

  setMoves: (moves) => set((s) => ({
    schema: {
      ...s.schema,
      moves
    }
  })),

  addMove: () => set((s) => {
    const moves = s.schema.moves;
    const lastId = moves.length > 0 ? Math.max(...moves.map(m => m.id)) : 0;
    const slots = ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','P'];
    const nextSlot = slots[moves.length] ?? `M${moves.length + 1}`;
    const newMove: MoveEntry = {
      id: lastId + 1,
      slot: nextSlot,
      name: '',
      cooldownPvP: '',
      cooldownPvE: '',
      level: '100',
      icons: [],
      element: 'Normal1',
      clan: 'Gardestrike',
      isDifferentPvE: false,
    };
    return { schema: { ...s.schema, moves: [...moves, newMove] } };
  }),

  removeMove: (index) => set((s) => {
    const nextMoves = [...s.schema.moves];
    nextMoves.splice(index, 1);
    return { schema: { ...s.schema, moves: nextMoves } };
  }),

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

  setEvolutions: (evolutions) => set((s) => ({
    schema: {
      ...s.schema,
      evolutions
    }
  })),

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
}), {
  name: 'wikipxg-pokedex-builder-storage', // saves to localStorage automatically
}));
