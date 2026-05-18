import React, { useMemo } from 'react';
import { parseWikiText } from '../../parser';
import { renderAST } from '../../parser/renderer/renderer';

interface WikiPreviewRawProps {
  content: string;
}

/**
 * Versão sem header do WikiPreview, para uso em modais e builders.
 */
export function WikiPreviewRaw({ content }: WikiPreviewRawProps) {
  const rendered = useMemo(() => {
    try {
      const ast = parseWikiText(content);
      return renderAST(ast, { theme: 'light' });
    } catch (e) {
      return (
        <div style={{ color: 'red', padding: 16, fontFamily: 'monospace', fontSize: 13 }}>
          ⚠️ Erro ao renderizar: {String(e)}
        </div>
      );
    }
  }, [content]);

  return <>{rendered}</>;
}
