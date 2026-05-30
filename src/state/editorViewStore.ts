/**
 * editorViewStore.ts
 *
 * Manages the active CodeMirror EditorView instance in a type-safe way.
 * Replaces the `(window as any).activeEditorView` anti-pattern.
 */
import { create } from 'zustand';
import type { EditorView } from '@codemirror/view';

interface EditorViewState {
  activeView: EditorView | null;
  setActiveView: (view: EditorView | null) => void;
}

export const useEditorViewStore = create<EditorViewState>((set) => ({
  activeView: null,
  setActiveView: (view) => set({ activeView: view }),
}));
