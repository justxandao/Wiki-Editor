import React, { memo } from 'react';
import { ColumnSchema } from '../types/schema';
import { TextCell } from './TextCell';
import { SelectCell } from './SelectCell';
import { EditableCell } from './EditableCell';

interface CellRendererProps {
  column: ColumnSchema;
  value: any;
  rowId: string;
  isFocused: boolean;
  isEditing: boolean;
  onEditChange: (editing: boolean) => void;
}

const CellRendererBase: React.FC<CellRendererProps> = ({
  column,
  value,
  rowId,
  isFocused,
  isEditing,
  onEditChange,
}) => {
  // --- Editable View ---
  if (isFocused && isEditing) {
    return (
      <EditableCell 
        column={column} 
        initialValue={value} 
        rowId={rowId} 
        onCommit={() => onEditChange(false)}
        onCancel={() => onEditChange(false)} 
      />
    );
  }

  // --- Readonly View ---
  switch (column.type) {
    case 'text':
    case 'number':
    case 'date':
      return <TextCell value={value} />;
    case 'select':
    case 'tag':
      return <SelectCell value={value} type={column.type} />;
    default:
      return <TextCell value={value} />;
  }
};

// Extremely important for performance in massive grids
export const CellRenderer = memo(CellRendererBase, (prev, next) => {
  return (
    prev.value === next.value &&
    prev.isFocused === next.isFocused &&
    prev.isEditing === next.isEditing &&
    prev.column.id === next.column.id
  );
});
