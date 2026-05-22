import React from 'react';

export const TableToolbar: React.FC = () => {
  return (
    <div className="flex items-center justify-between px-4 py-2 w-full h-12 text-sm">
      <div className="flex items-center space-x-4">
        <span className="font-semibold text-neutral-800 dark:text-neutral-200">All Tasks</span>
        <div className="h-4 w-px bg-neutral-200 dark:bg-neutral-800" />
        <button className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          Filter
        </button>
        <button className="text-neutral-500 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors">
          Sort
        </button>
      </div>
      <div className="flex items-center space-x-2">
        <button className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-white rounded text-xs font-medium transition-colors">
          New Record
        </button>
      </div>
    </div>
  );
};
