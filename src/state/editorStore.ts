import { create } from 'zustand';
import { saveTab, loadAllTabs, deleteTab, saveSetting, loadSetting, Tab } from '../services/persistence';

interface EditorTab extends Tab {
  isDirty: boolean;
}

type EditorMode = 'code' | 'preview' | 'split';
type Theme = 'dark' | 'light';
type SidebarPanel = 'library' | 'outline' | 'search' | null;

interface EditorState {
  // Tabs
  tabs: EditorTab[];
  activeTabId: string | null;

  // UI state
  mode: EditorMode;
  theme: Theme;
  sidebarPanel: SidebarPanel;
  sidebarWidth: number;
  isLoading: boolean;
  isTableBuilderOpen: boolean;

  // Notifications
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;

  // Actions
  createTab: (title?: string, content?: string) => string;
  closeTab: (id: string) => void;
  setActiveTab: (id: string) => void;
  updateTabContent: (id: string, content: string) => void;
  renameTab: (id: string, title: string) => void;
  setMode: (mode: EditorMode) => void;
  setTheme: (theme: Theme) => void;
  setSidebarPanel: (panel: SidebarPanel) => void;
  setSidebarWidth: (w: number) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  dismissToast: () => void;
  loadPersistedState: () => Promise<void>;
  persistTab: (id: string) => Promise<void>;
  setTableBuilderOpen: (open: boolean) => void;
}

const DEFAULT_CONTENT = '';

// Module-level map for auto-save debounce timers (replaces window-based hack)
const autosaveTimers = new Map<string, ReturnType<typeof setTimeout>>();

function generateId(): string {
  return `tab-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  mode: 'split',
  theme: 'dark',
  sidebarPanel: 'library',
  sidebarWidth: 280,
  isLoading: true,
  toast: null,
  isTableBuilderOpen: false,

  setTableBuilderOpen: (open) => set({ isTableBuilderOpen: open }),

  createTab: (title = 'Nova Página', content = DEFAULT_CONTENT) => {
    const id = generateId();
    const newTab: EditorTab = {
      id,
      title,
      content,
      savedAt: Date.now(),
      history: [content],
      historyIndex: 0,
      isDirty: false,
    };
    set(s => ({
      tabs: [...s.tabs, newTab],
      activeTabId: id,
    }));
    return id;
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const idx = tabs.findIndex(t => t.id === id);
    const newTabs = tabs.filter(t => t.id !== id);

    let newActive = activeTabId;
    if (activeTabId === id) {
      if (newTabs.length === 0) {
        newActive = null;
      } else {
        newActive = newTabs[Math.min(idx, newTabs.length - 1)].id;
      }
    }

    deleteTab(id).catch(console.error);
    set({ tabs: newTabs, activeTabId: newActive });

    if (newTabs.length === 0) {
      get().createTab();
    }
  },

  setActiveTab: (id) => set({ activeTabId: id }),

  updateTabContent: (id, content) => {
    set(s => ({
      tabs: s.tabs.map(t => {
        if (t.id !== id) return t;
        const history = t.history.slice(0, t.historyIndex + 1);
        history.push(content);
        return {
          ...t,
          content,
          history: history.slice(-100), // keep last 100
          historyIndex: Math.min(history.length - 1, 99),
          isDirty: true,
        };
      }),
    }));

    // Auto-save debounced
    clearTimeout(autosaveTimers.get(id));
    autosaveTimers.set(id, setTimeout(() => {
      autosaveTimers.delete(id);
      get().persistTab(id);
    }, 1500));
  },

  renameTab: (id, title) => {
    set(s => ({
      tabs: s.tabs.map(t => t.id === id ? { ...t, title } : t),
    }));
  },

  setMode: (mode) => {
    set({ mode });
    saveSetting('mode', mode).catch(console.error);
  },

  setTheme: (theme) => {
    set({ theme });
    document.documentElement.setAttribute('data-theme', theme);
    saveSetting('theme', theme).catch(console.error);
  },

  setSidebarPanel: (panel) => set(s => ({ sidebarPanel: s.sidebarPanel === panel ? null : panel })),

  setSidebarWidth: (w) => {
    set({ sidebarWidth: w });
    saveSetting('sidebarWidth', w).catch(console.error);
  },

  showToast: (message, type = 'info') => {
    set({ toast: { message, type } });
    setTimeout(() => get().dismissToast(), 3000);
  },

  dismissToast: () => set({ toast: null }),

  persistTab: async (id) => {
    const tab = get().tabs.find(t => t.id === id);
    if (!tab) return;
    await saveTab(tab);
    set(s => ({
      tabs: s.tabs.map(t => t.id === id ? { ...t, isDirty: false } : t),
    }));
  },

  loadPersistedState: async () => {
    try {
      const [storedTabs, storedTheme, storedMode, storedSidebarWidth] = await Promise.all([
        loadAllTabs(),
        loadSetting<Theme>('theme'),
        loadSetting<EditorMode>('mode'),
        loadSetting<number>('sidebarWidth'),
      ]);

      const tabs: EditorTab[] = storedTabs.map(t => ({ ...t, isDirty: false }));

      if (storedTheme) {
        document.documentElement.setAttribute('data-theme', storedTheme);
      }

      set({
        tabs: tabs.length > 0 ? tabs : [],
        activeTabId: tabs.length > 0 ? tabs[0].id : null,
        theme: storedTheme ?? 'dark',
        mode: storedMode ?? 'split',
        sidebarWidth: storedSidebarWidth ?? 280,
        isLoading: false,
      });

      if (tabs.length === 0) {
        get().createTab();
      }
    } catch (e) {
      console.error('Failed to load persisted state:', e);
      set({ isLoading: false });
      get().createTab();
    }
  },
}));

export type { EditorTab, EditorMode, Theme, SidebarPanel };
