import React, { useEffect, useRef, useCallback, useState } from 'react';
import {
  EditorView,
  lineNumbers,
  highlightActiveLine,
  highlightActiveLineGutter,
  drawSelection,
  dropCursor,
  rectangularSelection,
  crosshairCursor,
  keymap,
} from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import {
  defaultKeymap,
  history,
  historyKeymap,
  indentWithTab,
} from '@codemirror/commands';
import {
  searchKeymap,
  highlightSelectionMatches,
} from '@codemirror/search';
import {
  autocompletion,
  completionKeymap,
  closeBrackets,
} from '@codemirror/autocomplete';
import { wikitextLanguage, wikitextHighlighting } from './syntax/wikitext-language';
import { detectSlashCommand } from './slash-commands/slash-commands';
import { SlashCommandPopup } from '../ui/components/SlashCommandPopup';

interface WikiEditorProps {
  content: string;
  onChange: (value: string) => void;
  tabId: string;
}

interface SlashState {
  from: number;
  to: number;
  query: string;
  position: { x: number; y: number };
}

// Dark theme for CodeMirror
const darkTheme = EditorView.theme({
  '&': {
    height: '100%',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
  },
  '.cm-content': {
    caretColor: 'var(--accent-primary)',
    fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
    fontSize: '14px',
    lineHeight: '1.7',
  },
  '.cm-cursor': { borderLeftColor: 'var(--accent-primary)' },
  '.cm-gutters': {
    backgroundColor: 'var(--bg-secondary)',
    borderRight: '1px solid var(--border-subtle)',
    color: 'var(--text-muted)',
    minWidth: '48px',
  },
  '.cm-lineNumbers .cm-gutterElement': { padding: '0 8px 0 4px' },
  '.cm-activeLine': { backgroundColor: 'rgba(255,255,255,0.02)' },
  '.cm-activeLineGutter': { backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-secondary)' },
  '.cm-selectionBackground': { backgroundColor: 'rgba(247,129,102,0.2) !important' },
  '&.cm-focused .cm-selectionBackground': { backgroundColor: 'rgba(247,129,102,0.3) !important' },
  '.cm-matchingBracket': { backgroundColor: 'rgba(247,129,102,0.2)', outline: '1px solid var(--accent-primary)' },
  '.cm-searchMatch': { backgroundColor: 'rgba(247,129,102,0.2)', borderRadius: '2px' },
  '.cm-searchMatch.cm-searchMatch-selected': { backgroundColor: 'rgba(247,129,102,0.5)' },
  '.cm-tooltip': {
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border-default)',
    borderRadius: 'var(--radius-md)',
    boxShadow: 'var(--shadow-lg)',
  },
  '.cm-tooltip-autocomplete ul li[aria-selected]': {
    backgroundColor: 'var(--bg-overlay)',
    color: 'var(--text-primary)',
  },
}, { dark: true });

export function WikiEditor({ content, onChange, tabId }: WikiEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [slashState, setSlashState] = useState<SlashState | null>(null);
  const slashStateRef = useRef<SlashState | null>(null);

  // Keep ref in sync with state for use inside keymaps
  useEffect(() => { slashStateRef.current = slashState; }, [slashState]);

  const getSlashPopupPosition = useCallback((view: EditorView, pos: number): { x: number; y: number } => {
    try {
      const coords = view.coordsAtPos(pos);
      if (coords) return { x: coords.left, y: coords.bottom };
    } catch {}
    const rect = view.dom.getBoundingClientRect();
    return { x: rect.left + 40, y: rect.top + 40 };
  }, []);

  const closeSlash = useCallback(() => setSlashState(null), []);

  useEffect(() => {
    if (!containerRef.current) return;

    const updateListener = EditorView.updateListener.of(update => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }

      // Detect slash commands on cursor move or doc change
      if (update.docChanged || update.selectionSet) {
        const detected = detectSlashCommand(update.state);
        if (detected) {
          const pos = getSlashPopupPosition(update.view, detected.from);
          setSlashState({ ...detected, position: pos });
        } else {
          setSlashState(null);
        }
      }
    });

    const state = EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightActiveLine(),
        drawSelection(),
        dropCursor(),
        rectangularSelection(),
        crosshairCursor(),
        history(),
        closeBrackets(),
        autocompletion(),
        highlightSelectionMatches(),
        wikitextLanguage,
        wikitextHighlighting,
        darkTheme,
        updateListener,
        keymap.of([
          {
            key: 'Enter',
            run: (view) => {
              const { from, to } = view.state.selection.main;
              if (from !== to) return false;

              const line = view.state.doc.lineAt(from);
              const beforeCursor = line.text.slice(0, from - line.from);

              // 1. Match Icon + Link: e.g. [[Arquivo:025_-_Pikachu.png|link=Pikachu]] [[Pikachu]]
              const doubleMatch = beforeCursor.match(/\[\[(?:Arquivo|File):([^|\]]+\.(?:png|gif|jpg|jpeg))\|link=([^\]]+)\]\]\s+\[\[([^\]]+)\]\]$/i);
              if (doubleMatch && doubleMatch[2].toLowerCase() === doubleMatch[3].toLowerCase()) {
                const pokemonName = doubleMatch[2];
                const suffix = beforeCursor.slice(beforeCursor.lastIndexOf(' [['));
                const replaceStart = from - suffix.length;
                
                view.dispatch({
                  changes: { from: replaceStart, to, insert: ` '''[[${pokemonName}]]'''` },
                  selection: { anchor: replaceStart + ` '''[[${pokemonName}]]'''`.length }
                });
                return true;
              }

              // 2. Match Icon only: e.g. [[Arquivo:025_-_Pikachu.png|link=Pikachu]]
              const singleMatch = beforeCursor.match(/\[\[(?:Arquivo|File):([^|\]]+\.(?:png|gif|jpg|jpeg))\|link=([^\]]+)\]\]$/i);
              if (singleMatch) {
                const pokemonName = singleMatch[2];
                view.dispatch({
                  changes: { from, to, insert: ` [[${pokemonName}]]` },
                  selection: { anchor: from + ` [[${pokemonName}]]`.length }
                });
                return true;
              }

              return false;
            }
          },
          ...defaultKeymap,
          ...historyKeymap,
          ...searchKeymap,
          ...completionKeymap,
          indentWithTab,
          // Custom formatting keybindings
          {
            key: 'Mod-b',
            run: (view) => {
              const { from, to } = view.state.selection.main;
              const selText = view.state.doc.sliceString(from, to);
              const formatted = `'''${selText || 'texto'}'''`;
              view.dispatch({
                changes: { from, to, insert: formatted },
                selection: { anchor: from + formatted.length }
              });
              return true;
            }
          },
          {
            key: 'Mod-i',
            run: (view) => {
              const { from, to } = view.state.selection.main;
              const selText = view.state.doc.sliceString(from, to);
              const formatted = `''${selText || 'texto'}''`;
              view.dispatch({
                changes: { from, to, insert: formatted },
                selection: { anchor: from + formatted.length }
              });
              return true;
            }
          },
          {
            key: 'Escape',
            run: () => {
              if (slashStateRef.current) { closeSlash(); return true; }
              return false;
            },
          },
          // Block ArrowDown/ArrowUp/Enter/Tab so popup can navigate when open
          {
            key: 'ArrowDown',
            run: () => !!slashStateRef.current,
          },
          {
            key: 'ArrowUp',
            run: () => !!slashStateRef.current,
          },
          {
            key: 'Enter',
            run: (view) => {
              if (slashStateRef.current) return true;
              const { from, to } = view.state.selection.main;
              if (from !== to) return false;

              const line = view.state.doc.lineAt(from);
              const beforeCursor = line.text.slice(0, from - line.from);

              const doubleMatch = beforeCursor.match(/\[\[(?:Arquivo|File):([^|\]]+\.(?:png|gif|jpg|jpeg))\|link=([^\]]+)\]\]\s+\[\[([^\]]+)\]\]$/i);
              if (doubleMatch && doubleMatch[2].toLowerCase() === doubleMatch[3].toLowerCase()) {
                const pokemonName = doubleMatch[2];
                const suffix = beforeCursor.slice(beforeCursor.lastIndexOf(' [['));
                const replaceStart = from - suffix.length;
                view.dispatch({
                  changes: { from: replaceStart, to, insert: ` '''[[${pokemonName}]]'''` },
                  selection: { anchor: replaceStart + ` '''[[${pokemonName}]]'''`.length }
                });
                return true;
              }

              const singleMatch = beforeCursor.match(/\[\[(?:Arquivo|File):([^|\]]+\.(?:png|gif|jpg|jpeg))\|link=([^\]]+)\]\]$/i);
              if (singleMatch) {
                const pokemonName = singleMatch[2];
                view.dispatch({
                  changes: { from, to, insert: ` [[${pokemonName}]]` },
                  selection: { anchor: from + ` [[${pokemonName}]]`.length }
                });
                return true;
              }

              return false;
            }
          },
          {
            key: 'Tab',
            run: () => !!slashStateRef.current,
          },
        ]),
        EditorView.lineWrapping,
      ],
    });

    const view = new EditorView({ state, parent: containerRef.current });
    viewRef.current = view;
    (window as any).activeEditorView = view;

    return () => {
      view.destroy();
      viewRef.current = null;
      if ((window as any).activeEditorView === view) {
        (window as any).activeEditorView = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabId]); // Recreate editor when tab changes

  // Sync external content changes (e.g., tab switching)
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current !== content) {
      view.dispatch({
        changes: { from: 0, to: current.length, insert: content },
      });
    }
  }, [content, tabId]);

  return (
    <div style={{ position: 'relative', height: '100%', overflow: 'hidden' }}>
      <div ref={containerRef} style={{ height: '100%', overflow: 'hidden' }} />

      {slashState && viewRef.current && (
        <SlashCommandPopup
          view={viewRef.current}
          query={slashState.query}
          from={slashState.from}
          to={slashState.to}
          position={slashState.position}
          onClose={closeSlash}
        />
      )}
    </div>
  );
}
