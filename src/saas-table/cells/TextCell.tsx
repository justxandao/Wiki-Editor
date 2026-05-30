import React from 'react';

interface TextCellProps {
  value: any;
}

export const TextCell: React.FC<TextCellProps> = ({ value }) => {
  return (
    <div className="w-full h-full px-3 flex items-center overflow-hidden whitespace-nowrap text-ellipsis text-sm text-[var(--text-primary)]">
      {value != null ? String(value) : ''}
    </div>
  );
};
