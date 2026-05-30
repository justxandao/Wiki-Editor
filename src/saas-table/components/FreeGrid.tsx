import React, { useRef, useCallback } from 'react';
import { X, PlusCircle, Trash2 } from 'lucide-react';
import { nanoid } from 'nanoid';
import { Col, GridRow } from '../utils/types';
import { SlashCell } from './SlashCell';

export function FreeGrid({ cols, rows, onColsChange, onRowsChange }: {
  cols: Col[]; rows: GridRow[];
  onColsChange: (c: Col[]) => void;
  onRowsChange: (r: GridRow[]) => void;
}) {
  const resizeRef = useRef<{ id: string; startX: number; startW: number } | null>(null);

  const startResize = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    const col = cols.find(c => c.id === id)!;
    resizeRef.current = { id, startX: e.clientX, startW: col.width };
    const move = (ev: MouseEvent) => {
      if (!resizeRef.current) return;
      const w = Math.max(80, resizeRef.current.startW + ev.clientX - resizeRef.current.startX);
      onColsChange(cols.map(c => c.id === resizeRef.current!.id ? { ...c, width: w } : c));
    };
    const up = () => { resizeRef.current = null; window.removeEventListener('mousemove', move); window.removeEventListener('mouseup', up); };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
  }, [cols, onColsChange]);

  const addRow = () => onRowsChange([...rows, { id: nanoid(4), cells: Object.fromEntries(cols.map(c => [c.id, ''])) }]);
  const addCol = () => { const id = nanoid(4); onColsChange([...cols, { id, name: `Col ${cols.length + 1}`, width: 180 }]); onRowsChange(rows.map(r => ({ ...r, cells: { ...r.cells, [id]: '' } }))); };
  const delRow = (id: string) => onRowsChange(rows.filter(r => r.id !== id));
  const delCol = (id: string) => { if (cols.length <= 1) return; onColsChange(cols.filter(c => c.id !== id)); onRowsChange(rows.map(r => { const cells = { ...r.cells }; delete cells[id]; return { ...r, cells }; })); };
  const setCell = (rowId: string, colId: string, v: string) => onRowsChange(rows.map(r => r.id === rowId ? { ...r, cells: { ...r.cells, [colId]: v } } : r));
  const setColName = (id: string, name: string) => onColsChange(cols.map(c => c.id === id ? { ...c, name } : c));

  return (
    <div className="flex-1 overflow-auto bg-[var(--bg-secondary)] custom-scrollbar" style={{ minHeight: 0 }}>
      <div style={{ minWidth: cols.reduce((a, c) => a + c.width, 0) + 60, width: 'max-content' }} className="pb-8">
        {/* Header (Sticky) */}
        <div className="flex sticky top-0 z-20 bg-[var(--bg-secondary)] border-b-2 border-[var(--border-default)] shadow-sm">
          {cols.map(col => (
            <div key={col.id} className="relative flex items-center border-r border-[var(--border-subtle)] group"
              style={{ width: col.width, height: 40, flexShrink: 0 }}>
              <input className="flex-1 px-3 text-[11px] font-bold text-[var(--accent-primary)] uppercase tracking-wider bg-transparent outline-none"
                value={col.name} onChange={e => setColName(col.id, e.target.value)} />
              <button className="absolute top-1.5 right-4 opacity-0 group-hover:opacity-100 text-[#ef4444] p-1 bg-[var(--bg-secondary)] rounded-md transition-opacity"
                onClick={() => delCol(col.id)} title="Excluir Coluna"><X size={12} /></button>
              <div className="absolute right-0 top-0 h-full w-1.5 cursor-col-resize hover:bg-[var(--accent-primary)]"
                onMouseDown={e => startResize(e, col.id)} />
            </div>
          ))}
          {/* Falsa Coluna (Adicionar Coluna) */}
          <button onClick={addCol} className="w-12 flex items-center justify-center text-[var(--text-muted)] bg-[var(--bg-tertiary)]/20 hover:bg-[var(--bg-tertiary)]/40 hover:text-[var(--accent-primary)] border-r border-[var(--border-subtle)] flex-shrink-0 transition-all group" title="Adicionar Coluna">
            <PlusCircle size={16} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
        {/* Rows */}
        {rows.map(row => (
          <div key={row.id} className="flex border-b border-[var(--border-subtle)] hover:bg-[var(--bg-tertiary)]/30 group transition-colors" style={{ minHeight: 40 }}>
            {cols.map(col => (
              <div key={col.id} className="border-r border-[var(--border-subtle)] flex items-stretch"
                style={{ width: col.width, flexShrink: 0, minHeight: 40 }}>
                <SlashCell value={row.cells[col.id] ?? ''} onChange={v => setCell(row.id, col.id, v)} placeholder={""} />
              </div>
            ))}
            <div className="w-12 flex-shrink-0 flex items-center justify-center opacity-0 group-hover:opacity-100 border-r border-[var(--border-subtle)] transition-opacity bg-transparent">
              <button className="p-1.5 rounded-md text-[var(--text-muted)] hover:text-[#ef4444] hover:bg-[#ef4444]/10 transition-all" onClick={() => delRow(row.id)} title="Excluir Linha"><Trash2 size={14} /></button>
            </div>
          </div>
        ))}
        {/* Adicionar Linha (Barra Tracejada) */}
        <div className="flex mt-3 px-3" style={{ width: cols.reduce((a, c) => a + c.width, 0) }}>
          <button onClick={addRow} className="pxg-btn-secondary flex-1 flex items-center justify-center gap-2" style={{ padding: '12px', borderStyle: 'dashed', borderWidth: '2px' }}>
            <PlusCircle size={16} /> Adicionar Nova Linha
          </button>
        </div>
      </div>
    </div>
  );
}
