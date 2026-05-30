import React from 'react';
import { flexRender } from '@tanstack/react-table';

interface TableHeaderProps {
  header: any;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ header }) => {
  return (
    <div
      className="flex items-center px-3 text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] select-none group border-r border-[var(--border-subtle)] transition-colors"
      style={{
        width: header.getSize(),
        height: '100%',
        position: 'relative',
      }}
    >
      {header.isPlaceholder ? null : (
        <div className="flex items-center w-full overflow-hidden whitespace-nowrap text-ellipsis">
          {flexRender(
            header.column.columnDef.header,
            header.getContext()
          )}
        </div>
      )}
      {/* Resize Handle */}
      <div 
        onMouseDown={header.getResizeHandler()}
        onTouchStart={header.getResizeHandler()}
        className={`absolute right-0 top-0 h-full w-1 cursor-col-resize bg-violet-500 opacity-0 group-hover:opacity-100 ${
          header.column.getIsResizing() ? 'opacity-100 w-2' : ''
        }`} 
        style={{ zIndex: 10, touchAction: 'none' }}
      />
    </div>
  );
};
