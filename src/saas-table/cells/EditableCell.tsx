import React, { useState, useEffect, useRef } from 'react';
import { useTableStore } from '../store/tableStore';
import { ColumnSchema } from '../types/schema';

interface EditableCellProps {
  column: ColumnSchema;
  initialValue: any;
  rowId: string;
  onCommit: () => void;
  onCancel: () => void;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  column,
  initialValue,
  rowId,
  onCommit,
  onCancel,
}) => {
  const [localValue, setLocalValue] = useState(initialValue || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const updateRecord = useTableStore((s) => s.updateRecord);

  // Focus input automatically when mounted
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Select all text if it's a text input
      if (inputRef.current.type === 'text') {
        inputRef.current.select();
      }
    }
  }, []);

  const handleCommit = () => {
    if (localValue !== initialValue) {
      updateRecord(rowId, column.id, localValue);
    }
    onCommit();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation(); // Prevent Row from stealing event
      handleCommit();
    } else if (e.key === 'Escape') {
      e.stopPropagation();
      onCancel();
    }
  };

  if (column.type === 'select' || column.type === 'tag') {
    return (
      <select
        ref={inputRef as any}
        className="w-full h-full px-2 py-1 bg-[#16161f] border-2 border-violet-500 rounded outline-none text-[#e2e2e8]"
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        onBlur={handleCommit}
        onKeyDown={handleKeyDown}
      >
        <option value="" className="bg-[#111118]">Select...</option>
        {column.options?.map((opt) => (
          <option key={opt} value={opt} className="bg-[#111118]">
            {opt}
          </option>
        ))}
      </select>
    );
  }

  return (
    <input
      ref={inputRef}
      type={column.type === 'number' ? 'number' : 'text'}
      className="w-full h-full px-2 py-1 bg-[#16161f] border-2 border-violet-500 rounded outline-none text-sm text-[#e2e2e8]"
      value={localValue}
      onChange={(e) => setLocalValue(e.target.value)}
      onBlur={handleCommit}
      onKeyDown={handleKeyDown}
    />
  );
};
