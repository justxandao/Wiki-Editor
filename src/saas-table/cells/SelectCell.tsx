import React from 'react';

interface SelectCellProps {
  value: any;
  type: 'select' | 'tag';
}

export const SelectCell: React.FC<SelectCellProps> = ({ value, type }) => {
  if (!value) return null;

  // Simple pseudo-random color based on string length for tags
  const getColor = (str: string) => {
    const colors = [
      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
      'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
      'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    ];
    return colors[str.length % colors.length];
  };

  const stringValue = String(value);

  if (type === 'tag') {
    return (
      <div className="w-full h-full px-3 flex items-center overflow-hidden">
        <span className={`px-2 py-0.5 rounded text-xs font-medium whitespace-nowrap ${getColor(stringValue)}`}>
          {stringValue}
        </span>
      </div>
    );
  }

  // Regular select (Notion style, slightly less pronounced than a tag)
  return (
    <div className="w-full h-full px-3 flex items-center overflow-hidden">
      <span className="px-2 py-0.5 rounded text-xs whitespace-nowrap bg-[#1e1e2e] text-[#e2e2e8]">
        {stringValue}
      </span>
    </div>
  );
};
