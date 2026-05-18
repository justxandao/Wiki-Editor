import React, { useMemo } from 'react';
import { parseWikiText } from '../../parser';
import { renderAST } from '../../parser/renderer/renderer';
import { useEditorStore } from '../../state/editorStore';

interface WikiPreviewProps {
  content: string;
}

export function WikiPreview({ content }: WikiPreviewProps) {
  const theme = useEditorStore(s => s.theme);

  const rendered = useMemo(() => {
    try {
      const ast = parseWikiText(content);
      return renderAST(ast, { theme });
    } catch (e) {
      return (
        <div style={{ color: 'var(--accent-danger)', padding: 16, fontFamily: 'monospace', fontSize: 13 }}>
          ⚠️ Erro ao renderizar: {String(e)}
        </div>
      );
    }
  }, [content, theme]);

  return (
    <div style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {/* Preview header */}
      <div style={{
        padding: '8px 16px',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        flexShrink: 0,
        background: 'var(--bg-secondary)',
      }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>👁</span>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>Preview Visual</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-muted)' }}>
          WikiPokexGames · Render em tempo real
        </span>
      </div>

      {/* Rendered content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {rendered}
      </div>
    </div>
  );
}
