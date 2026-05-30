import React, { useRef, useContext } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TableEngineContext } from './TableRoot';
import { TableHeader } from './TableHeader';
import { TableRow } from './TableRow';

export const TableViewport: React.FC = () => {
  const table = useContext(TableEngineContext);
  const parentRef = useRef<HTMLDivElement>(null);

  if (!table) return null;

  const { rows } = table.getRowModel();

  // Virtualizer for rows
  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36, // Fixed row height 36px (Linear style)
    overscan: 10, // Pre-render 10 items outside of the viewport
  });

  const virtualItems = rowVirtualizer.getVirtualItems();
  const totalSize = rowVirtualizer.getTotalSize();

  return (
    <div 
      ref={parentRef} 
      className="flex-1 overflow-auto relative custom-scrollbar"
      style={{ isolation: 'isolate' }}
    >
      <div 
        className="inline-block min-w-full"
        // The total height of the table must include the virtualized height + header height
        style={{ height: `${totalSize + 36}px`, position: 'relative' }} 
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 bg-[var(--bg-secondary)] border-b border-[var(--border-subtle)]" style={{ height: 36 }}>
          {table.getHeaderGroups().map((headerGroup: any) => (
            <div key={headerGroup.id} className="flex absolute top-0 w-full">
              {headerGroup.headers.map((header: any) => (
                <TableHeader key={header.id} header={header} />
              ))}
            </div>
          ))}
        </div>

        {/* Virtualized Body */}
        <div className="absolute top-[36px] left-0 w-full" style={{ pointerEvents: 'none' }}>
          {virtualItems.map((virtualRow) => {
            const row = rows[virtualRow.index];
            return (
              <TableRow 
                key={row.id} 
                row={row} 
                virtualRow={virtualRow} 
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
