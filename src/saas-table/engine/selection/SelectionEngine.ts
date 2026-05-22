import { useTableStore } from '../../store/tableStore';
import { Table } from '@tanstack/react-table';

export class SelectionEngine {
  static handleMouseDown(e: React.MouseEvent, rowId: string, columnId: string) {
    if (e.shiftKey) {
      // Logic for range selection would go here
      // For now, we just set the focus
    }
  }

  static copyToClipboard(table: Table<any>) {
    const { focusedCell, data } = useTableStore.getState();
    if (!focusedCell) return;
    
    // Simplistic clipboard copy for single cell
    const row = data.find(r => r.id === focusedCell.rowId);
    if (row) {
      const value = row[focusedCell.columnId];
      navigator.clipboard.writeText(String(value || ''));
    }
  }
}
