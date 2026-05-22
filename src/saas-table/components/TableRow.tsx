import React, { memo } from 'react';
import { CellRenderer } from '../cells/CellRenderer';
import { useTableStore } from '../store/tableStore';
import { KeyboardEngine } from '../engine/keyboard/KeyboardEngine';

interface TableRowProps {
  row: any;
  virtualRow: any;
}

const TableRowBase: React.FC<TableRowProps> = ({ row, virtualRow }) => {
  // Check if any cell in this row is focused to highlight the row slightly
  const focusedCell = useTableStore((s) => s.focusedCell);
  const isEditing = useTableStore((s) => s.isEditing);
  const setFocusedCell = useTableStore((s) => s.setFocusedCell);
  const setIsEditing = useTableStore((s) => s.setIsEditing);

  const isRowFocused = focusedCell?.rowId === row.id;

  return (
    <div
      className={`absolute top-0 left-0 w-full flex border-b border-[#1e1e2e] hover:bg-[#16161f]/50 transition-colors ${
        isRowFocused ? 'bg-[#2d2048]/20' : ''
      }`}
      style={{
        height: `${virtualRow.size}px`,
        transform: `translateY(${virtualRow.start}px)`,
        pointerEvents: 'auto',
      }}
    >
      {row.getVisibleCells().map((cell: any) => {
        const isCellFocused = focusedCell?.rowId === row.id && focusedCell?.columnId === cell.column.id;
        
        return (
          <div
            key={cell.id}
            tabIndex={isCellFocused ? 0 : -1}
            className={`flex items-center relative border-r border-[#1e1e2e] outline-none ${
              isCellFocused ? 'ring-2 ring-violet-500 z-10 bg-[#16161f]' : ''
            }`}
            style={{ width: cell.column.getSize() }}
            onClick={() => {
              if (!isCellFocused) {
                setFocusedCell(row.id, cell.column.id);
                setIsEditing(false);
              }
            }}
            onDoubleClick={() => {
              setFocusedCell(row.id, cell.column.id);
              setIsEditing(true);
            }}
            onKeyDown={(e) => {
              KeyboardEngine.handleCellKeyDown(e, row.getVisibleCells()[0].getContext().table, row.id, cell.column.id, isEditing);
            }}
          >
            <CellRenderer
              column={cell.column.columnDef.meta}
              value={cell.getValue()}
              rowId={row.id}
              isFocused={isCellFocused}
              isEditing={isEditing}
              onEditChange={setIsEditing}
            />
          </div>
        );
      })}
    </div>
  );
};

// Strict memoization to prevent rendering 100+ rows when only one changes
export const TableRow = memo(TableRowBase, (prev, next) => {
  return prev.virtualRow.start === next.virtualRow.start && prev.row.original === next.row.original;
});
