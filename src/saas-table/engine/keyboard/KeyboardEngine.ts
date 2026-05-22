import { Table } from '@tanstack/react-table';
import { useTableStore } from '../../store/tableStore';

export class KeyboardEngine {
  /**
   * Handles cell keyboard navigation.
   * Prevents default scrolling behavior for arrow keys.
   */
  static handleCellKeyDown(
    e: React.KeyboardEvent,
    table: Table<any>,
    rowId: string,
    columnId: string,
    isEditing: boolean
  ) {
    if (isEditing) return; // Let the EditableCell handle its own keys

    const { setFocusedCell, setIsEditing } = useTableStore.getState();

    // Enter to edit
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault();
      setIsEditing(true);
      return;
    }

    // Navigation Keys
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.key)) {
      e.preventDefault(); // Stop browser scrolling

      const { rows } = table.getRowModel();
      const visibleColumns = table.getVisibleLeafColumns();

      const rowIndex = rows.findIndex((r) => r.id === rowId);
      const colIndex = visibleColumns.findIndex((c) => c.id === columnId);

      if (rowIndex === -1 || colIndex === -1) return;

      let nextRowIndex = rowIndex;
      let nextColIndex = colIndex;

      switch (e.key) {
        case 'ArrowUp':
          nextRowIndex = Math.max(0, rowIndex - 1);
          break;
        case 'ArrowDown':
          nextRowIndex = Math.min(rows.length - 1, rowIndex + 1);
          break;
        case 'ArrowLeft':
          if (e.shiftKey) break; // Range select handled in SelectionEngine
          nextColIndex = Math.max(0, colIndex - 1);
          break;
        case 'ArrowRight':
        case 'Tab':
          if (e.shiftKey) {
            nextColIndex = Math.max(0, colIndex - 1);
          } else {
            nextColIndex = Math.min(visibleColumns.length - 1, colIndex + 1);
          }
          break;
      }

      if (nextRowIndex !== rowIndex || nextColIndex !== colIndex) {
        const nextRow = rows[nextRowIndex];
        const nextCol = visibleColumns[nextColIndex];
        setFocusedCell(nextRow.id, nextCol.id);
        
        // Ensure the browser scroll brings the focused cell into view
        // In a real app with TanStack Virtual, you'd use virtualizer.scrollToIndex
        // but for now, DOM focus handles basic native scrolling if we had a hidden input
      }
    }
  }
}
