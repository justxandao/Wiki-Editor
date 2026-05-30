/**
 * useEditorInsert.ts
 *
 * Unified hook for inserting text into the active CodeMirror editor.
 * Replaces the duplicated insert logic spread across TopBar, LibraryPanel
 * and TableBuilderModal.
 */
import { useEditorViewStore } from '../state/editorViewStore';
import { useEditorStore } from '../state/editorStore';

export function useEditorInsert() {
  const activeView = useEditorViewStore((s) => s.activeView);
  const activeTabId = useEditorStore((s) => s.activeTabId);
  const tabs = useEditorStore((s) => s.tabs);
  const updateTabContent = useEditorStore((s) => s.updateTabContent);

  /**
   * Insert text at the current cursor position in the editor.
   * Falls back to appending to the active tab content if no editor view is mounted.
   */
  function insert(text: string): void {
    if (activeView) {
      const { from, to } = activeView.state.selection.main;
      activeView.dispatch({
        changes: { from, to, insert: text },
        selection: { anchor: from + text.length },
      });
      activeView.focus();
      return;
    }

    // Fallback: append to active tab content
    if (activeTabId) {
      const activeContent = tabs.find((t) => t.id === activeTabId)?.content ?? '';
      updateTabContent(activeTabId, activeContent + '\n' + text);
    }
  }

  /**
   * Insert text wrapping any currently selected text.
   * `before` and `after` are placed around the selection (or `placeholder` if nothing selected).
   */
  function insertWrapped(before: string, after: string, placeholder = 'texto'): void {
    if (activeView) {
      const { from, to } = activeView.state.selection.main;
      const selected = activeView.state.doc.sliceString(from, to);
      const wrapped = `${before}${selected || placeholder}${after}`;
      activeView.dispatch({
        changes: { from, to, insert: wrapped },
        selection: { anchor: from + wrapped.length },
      });
      activeView.focus();
      return;
    }

    if (activeTabId) {
      const activeContent = tabs.find((t) => t.id === activeTabId)?.content ?? '';
      updateTabContent(activeTabId, activeContent + '\n' + before + placeholder + after);
    }
  }

  return { insert, insertWrapped };
}
