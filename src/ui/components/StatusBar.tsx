import React from 'react';
import wikiLogo from '../../assets/wiki.png';
import { useEditorStore } from '../../state/editorStore';
import { Save, FileCode } from 'lucide-react';

export function StatusBar() {
  const { tabs, activeTabId, mode, theme, persistTab, showToast } = useEditorStore();
  const activeTab = tabs.find(t => t.id === activeTabId);

  const lineCount = activeTab?.content.split('\n').length ?? 0;
  const charCount = activeTab?.content.length ?? 0;
  const isDirty = activeTab?.isDirty ?? false;

  const handleSave = async () => {
    if (!activeTabId) return;
    await persistTab(activeTabId);
    showToast('Salvo com sucesso!', 'success');
  };

  return (
    <div className="status-bar">
      {/* Left */}
      <div className="status-bar-item" onClick={handleSave} title="Ctrl+S para salvar">
        <Save size={10} />
        <span>{isDirty ? '● Não salvo' : 'Salvo'}</span>
      </div>

      <div style={{ width: 1, height: 12, background: 'var(--border-subtle)' }} />

      <div className="status-bar-item">
        <FileCode size={10} />
        <span>WikiText</span>
      </div>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Right */}
      <div className="status-bar-item">
        <span>{lineCount} linhas</span>
      </div>

      <div className="status-bar-item">
        <span>{charCount.toLocaleString()} chars</span>
      </div>

      <div className="status-bar-item" style={{
        color: 'var(--accent-primary)',
        fontWeight: 600,
      }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <img 
            src={wikiLogo} 
            alt="Wiki" 
            style={{ 
              width: 12, 
              height: 12, 
              objectFit: 'contain', 
              backgroundColor: '#353671',
              borderRadius: 3,
              boxShadow: '0 0 8px rgba(168, 85, 247, 0.25)'
            }} 
          />
          WikiPokexGames Editor
        </span>
      </div>
    </div>
  );
}
