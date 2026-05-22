import React from 'react';
import { TableRoot } from '../components/TableRoot';
import { TableLayout } from '../components/TableLayout';
import { TableToolbar } from '../components/TableToolbar';
import { TableViewport } from '../components/TableViewport';
import { mockColumns, initialMockData } from '../utils/mockData';

export const DemoTableApp: React.FC = () => {
  return (
    // We add absolute inset-0 to make the table take up the entire screen/container like a real SaaS app
    <div className="absolute inset-0 flex flex-col bg-neutral-100 dark:bg-black p-4 md:p-8">
      <div className="flex-1 flex flex-col bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-200 dark:border-neutral-800 overflow-hidden">
        <TableRoot initialColumns={mockColumns} initialData={initialMockData}>
          <TableLayout 
            topbar={<TableToolbar />} 
            viewport={<TableViewport />} 
          />
        </TableRoot>
      </div>
    </div>
  );
};

export default DemoTableApp;
