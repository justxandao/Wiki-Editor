import React, { useRef, useState } from 'react';
import { useEditorStore } from '../../state/editorStore';
import { X, FileText, Circle } from 'lucide-react';

export function TabBar() {
  const { tabs, activeTabId, setActiveTab, closeTab, createTab, renameTab } = useEditorStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const startEdit = (id: string, title: string) => {
    setEditingId(id);
    setEditValue(title);
    setTimeout(() => inputRef.current?.select(), 50);
  };

  const commitEdit = () => {
    if (editingId && editValue.trim()) {
      renameTab(editingId, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div style={{
      height: 36,
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-subtle)',
      display: 'flex',
      alignItems: 'stretch',
      overflowX: 'auto',
      overflowY: 'hidden',
      flexShrink: 0,
    }}>
      {tabs.map(tab => {
        const isActive = tab.id === activeTabId;
        return (
          <div
            key={tab.id}
            className={`editor-tab ${isActive ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
            onDoubleClick={() => startEdit(tab.id, tab.title)}
            title={tab.title}
          >
            <FileText size={12} style={{ flexShrink: 0, opacity: 0.6 }} />

            {editingId === tab.id ? (
              <input
                ref={inputRef}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={commitEdit}
                onKeyDown={e => {
                  if (e.key === 'Enter') commitEdit();
                  if (e.key === 'Escape') setEditingId(null);
                  e.stopPropagation();
                }}
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: '1px solid var(--accent-primary)',
                  color: 'var(--text-primary)',
                  fontSize: 13,
                  fontFamily: 'Inter, sans-serif',
                  width: Math.max(60, editValue.length * 8),
                  borderRadius: 2,
                  padding: '0 2px',
                }}
                onClick={e => e.stopPropagation()}
              />
            ) : (
              <span style={{
                maxWidth: 140,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontSize: 13,
              }}>
                {tab.isDirty && <span style={{ color: 'var(--accent-warning)', marginRight: 2 }}>●</span>}
                {tab.title}
              </span>
            )}

            <span
              className="tab-close"
              onClick={e => { e.stopPropagation(); closeTab(tab.id); }}
            >
              <X size={11} />
            </span>
          </div>
        );
      })}

      {/* Add tab button */}
      <button
        onClick={() => createTab()}
        title="Nova aba"
        style={{
          width: 36, minWidth: 36,
          background: 'none',
          border: 'none',
          borderRight: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          transition: 'all 0.15s',
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-primary)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-overlay)'; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'; (e.currentTarget as HTMLButtonElement).style.background = 'none'; }}
      >
        +
      </button>
    </div>
  );
}
