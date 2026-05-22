import React from 'react';

interface TableLayoutProps {
  topbar?: React.ReactNode;
  viewport: React.ReactNode;
  inspector?: React.ReactNode;
}

export const TableLayout: React.FC<TableLayoutProps> = ({ topbar, viewport, inspector }) => {
  return (
    <div className="flex flex-col w-full h-full relative">
      {topbar && (
        <div className="flex-none border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 z-10">
          {topbar}
        </div>
      )}
      
      <div className="flex flex-1 min-h-0 relative">
        <div className="flex-1 flex min-w-0 bg-neutral-50 dark:bg-neutral-950">
          {viewport}
        </div>
        
        {inspector && (
          <div className="w-80 border-l border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 shadow-xl z-20">
            {inspector}
          </div>
        )}
      </div>
    </div>
  );
};
