import { ColumnSchema, RowData } from '../types/schema';
import { nanoid } from 'nanoid';

export const mockColumns: ColumnSchema[] = [
  { id: 'task', name: 'Task Name', type: 'text', width: 250 },
  { id: 'status', name: 'Status', type: 'select', width: 150, options: ['To Do', 'In Progress', 'Done'] },
  { id: 'priority', name: 'Priority', type: 'tag', width: 120, options: ['Low', 'Medium', 'High', 'Urgent'] },
  { id: 'dueDate', name: 'Due Date', type: 'date', width: 140 },
  { id: 'storyPoints', name: 'Story Points', type: 'number', width: 120 },
];

export const generateMockData = (count: number): RowData[] => {
  const statuses = ['To Do', 'In Progress', 'Done'];
  const priorities = ['Low', 'Medium', 'High', 'Urgent'];
  
  return Array.from({ length: count }).map((_, i) => ({
    id: nanoid(),
    task: `Task Feature ${i + 1}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    priority: priorities[Math.floor(Math.random() * priorities.length)],
    dueDate: new Date(Date.now() + Math.random() * 10000000000).toISOString().split('T')[0],
    storyPoints: Math.floor(Math.random() * 13) + 1,
  }));
};

export const initialMockData = generateMockData(100);
