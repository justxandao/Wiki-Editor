export type ColumnType = 'text' | 'number' | 'select' | 'checkbox' | 'date' | 'tag';

export interface ColumnSchema {
  id: string;
  name: string;
  type: ColumnType;
  width?: number;
  options?: any[]; // For select/tag columns
}

export interface RowData {
  id: string;
  [columnId: string]: any;
}

export interface TableState {
  // Data State
  columns: ColumnSchema[];
  data: RowData[];
  
  // UI / Ephemeral State
  focusedCell: { rowId: string; columnId: string } | null;
  isEditing: boolean;
  
  // Actions
  setFocusedCell: (rowId: string | null, columnId: string | null) => void;
  setIsEditing: (isEditing: boolean) => void;
  updateRecord: (rowId: string, columnId: string, value: any) => void;
}
