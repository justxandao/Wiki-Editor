import { create } from 'zustand';
import { TableState, RowData, ColumnSchema } from '../types/schema';

export const useTableStore = create<TableState>()((set) => ({
  // --- Data State ---
  columns: [],
  data: [],

  // --- UI / Ephemeral State ---
  focusedCell: null,
  isEditing: false,

  // --- Actions ---
  setFocusedCell: (rowId, columnId) =>
    set(() => {
      if (!rowId || !columnId) return { focusedCell: null, isEditing: false };
      return { focusedCell: { rowId, columnId } };
    }),

  setIsEditing: (isEditing) =>
    set(() => ({ isEditing })),

  updateRecord: (rowId, columnId, value) =>
    set((state) => {
      // Immer-like immutable update for a specific cell
      const newData = state.data.map((row) => {
        if (row.id === rowId) {
          return { ...row, [columnId]: value };
        }
        return row;
      });
      return { data: newData };
    }),
}));

// Utility to initialize store if needed via a provider or directly
export const initTableStore = (initialColumns: ColumnSchema[], initialData: RowData[]) => {
  useTableStore.setState({
    columns: initialColumns,
    data: initialData,
    focusedCell: null,
    isEditing: false,
  });
};
