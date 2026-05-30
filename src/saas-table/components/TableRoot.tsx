import React, { useEffect, useMemo } from 'react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getFilteredRowModel } from '@tanstack/react-table';
import { useTableStore, initTableStore } from '../store/tableStore';
import { ColumnSchema, RowData } from '../types/schema';

// React Context for TanStack Table instance
export const TableEngineContext = React.createContext<any>(null);

interface TableRootProps {
  initialColumns: ColumnSchema[];
  initialData: RowData[];
  children: React.ReactNode;
}

export const TableRoot: React.FC<TableRootProps> = ({ initialColumns, initialData, children }) => {
  // Initialize store on mount (in a real app, this might come from a backend query)
  useEffect(() => {
    initTableStore(initialColumns, initialData);
  }, [initialColumns, initialData]);

  // Subscribe to raw data for the table engine
  const data = useTableStore((s) => s.data);
  const columns = useTableStore((s) => s.columns);

  // Define TanStack Table Columns based on our Schema
  const tableColumns = useMemo(() => {
    return columns.map((col) => ({
      accessorKey: col.id,
      header: col.name,
      size: col.width || 150,
      meta: { type: col.type, options: col.options }, // Store schema in meta
    }));
  }, [columns]);

  // Initialize TanStack Headless Engine
  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    // Important for resize/column visibility features later
    columnResizeMode: 'onChange',
  });

  return (
    <TableEngineContext.Provider value={table}>
      <div className="flex flex-col w-full h-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden font-sans border border-[var(--border-subtle)]">
        {children}
      </div>
    </TableEngineContext.Provider>
  );
};
