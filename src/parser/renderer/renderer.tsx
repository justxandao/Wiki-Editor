import React from 'react';
import { ASTNode, DocumentNode } from '../ast/ast';
import { getPokemonSpriteUrl, pokemonIndex, WIKI_ICONS, normalizedIndex } from '../../pokemon/pokemon-service';
import { normalizeName } from '../../pokemon/pokemon-normalizer';

// =============================================
// WikiText AST → React elements
// =============================================

interface RenderContext {
  theme: 'dark' | 'light';
}

export function renderAST(doc: DocumentNode, ctx: RenderContext = { theme: 'dark' }): React.ReactNode {
  return React.createElement(
    'div',
    { className: 'wiki-preview' },
    ...groupParagraphs(doc.children).map((node, i) => renderNode(node, i, ctx))
  );
}

/** Group consecutive Text/Inline nodes into paragraphs */
function groupParagraphs(nodes: ASTNode[]): ASTNode[] {
  const result: ASTNode[] = [];
  let para: ASTNode[] = [];

  const flushPara = () => {
    if (para.length > 0) {
      result.push({ type: 'Paragraph', children: [...para] });
      para = [];
    }
  };

  for (const node of nodes) {
    if (node.type === 'Newline') {
      if (para.length > 0) {
        // Two newlines = paragraph break
        flushPara();
      }
      continue;
    }

    const isBlock = ['Heading', 'Table', 'HorizontalRule', 'ListItem', 'Comment', 'Category'].includes(node.type);
    if (isBlock) {
      flushPara();
      result.push(node);
    } else {
      para.push(node);
    }
  }

  flushPara();
  return result;
}

function renderNode(node: ASTNode, key: number | string, ctx: RenderContext): React.ReactNode {
  switch (node.type) {
    case 'Paragraph':
      return React.createElement('p', { key }, ...(node.children ?? []).map((c, i) => renderNode(c, i, ctx)));

    case 'Heading': {
      const tag = `h${node.level ?? 2}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
      const id = node.value?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return React.createElement(tag, { key, id }, node.value);
    }

    case 'Bold':
      return React.createElement(
        'strong', 
        { key }, 
        node.children && node.children.length > 0 
          ? node.children.map((child, i) => renderNode(child, `${key}-${i}`)) 
          : node.value
      );

    case 'Italic':
      return React.createElement(
        'em', 
        { key }, 
        node.children && node.children.length > 0 
          ? node.children.map((child, i) => renderNode(child, `${key}-${i}`)) 
          : node.value
      );

    case 'BoldItalic':
      return React.createElement(
        'strong', 
        { key }, 
        React.createElement(
          'em', 
          {}, 
          node.children && node.children.length > 0 
            ? node.children.map((child, i) => renderNode(child, `${key}-${i}`)) 
            : node.value
        )
      );

    case 'InternalLink': {
      const target = node.attrs?.target ?? node.value ?? '';
      const display = node.attrs?.display ?? target;
      const href = `https://wiki.pokexgames.com/index.php/${encodeURIComponent(target)}`;
      
      const normTargetRaw = normalizeName(target);
      const normTarget = normalizedIndex.get(normTargetRaw) || normTargetRaw;
      const pokemon = pokemonIndex[normTarget];
      const iconFile = WIKI_ICONS[normTargetRaw];

      if (pokemon || iconFile) {
        const imageUrl = pokemon 
          ? `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(pokemon.image)}`
          : `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(iconFile)}`;

        return React.createElement(
          'a',
          { 
            key, 
            href, 
            target: '_blank', 
            rel: 'noopener noreferrer', 
            title: target,
            style: { fontWeight: 'bold', color: 'var(--accent-primary)', textDecoration: 'none' }
          },
          React.createElement('img', { 
            src: imageUrl, 
            alt: target, 
            style: { width: 20, height: 20, verticalAlign: 'middle', marginRight: 4, imageRendering: 'pixelated' } 
          }),
          display
        );
      }

      return React.createElement(
        'a',
        { 
          key, 
          href, 
          target: '_blank', 
          rel: 'noopener noreferrer', 
          title: target,
          style: { color: 'var(--accent-primary)', textDecoration: 'none' }
        },
        display
      );
    }

    case 'FileLink': {
      const filename = node.attrs?.filename ?? '';
      const link = node.attrs?.link;
      const caption = node.attrs?.caption;

      // Try to find pokemon sprite via filename
      const spriteUrl = resolveImageUrl(filename);

      const img = React.createElement('img', {
        src: spriteUrl,
        alt: caption ?? filename,
        title: caption ?? filename,
        style: { maxWidth: '100%', imageRendering: 'pixelated' },
        onError: (e: React.SyntheticEvent<HTMLImageElement>) => {
          (e.target as HTMLImageElement).style.display = 'none';
        },
      });

      if (link) {
        const href = `https://wiki.pokexgames.com/index.php/${encodeURIComponent(link)}`;
        return React.createElement('a', { key, href, target: '_blank', rel: 'noopener noreferrer' }, img);
      }
      return React.createElement('span', { key, style: { display: 'inline-block' } }, img);
    }

    case 'Template': {
      const name = node.value ?? 'Template';
      const params = node.attrs ?? {};
      return React.createElement(
        'div',
        { key, className: 'template-box' },
        React.createElement('strong', {}, `{{${name}}}`),
        Object.keys(params).length > 0
          ? React.createElement(
              'div',
              { style: { marginTop: 4, fontSize: 11 } },
              Object.entries(params).map(([k, v]) =>
                React.createElement('div', { key: k }, `| ${k} = ${v}`)
              )
            )
          : null
      );
    }

    case 'ParserFunction':
      return React.createElement('code', { key, style: { color: 'var(--accent-purple)', fontSize: 12 } }, `{{${node.value}}}`);

    case 'Table': {
      const tableClass = `wikitable ${node.attrs?.class ?? ''}`.trim();
      const rows: React.ReactNode[] = [];
      let currentRow: ASTNode[] = [];
      let headers: ASTNode[] = [];
      let caption: ASTNode | null = null;

      for (const child of node.children ?? []) {
        if (child.type === 'TableCaption') {
          caption = child;
        } else if (child.type === 'TableRow') {
          if (currentRow.length > 0 || headers.length > 0) {
            rows.push(buildTableRow(headers, currentRow, rows.length));
            currentRow = [];
            headers = [];
          }
        } else if (child.type === 'TableHeader') {
          headers.push(child);
        } else if (child.type === 'TableCell') {
          currentRow.push(child);
        }
      }
      if (currentRow.length > 0 || headers.length > 0) {
        rows.push(buildTableRow(headers, currentRow, rows.length));
      }

      return React.createElement(
        'table',
        { key, className: tableClass },
        caption ? React.createElement('caption', {}, caption.value) : null,
        React.createElement('tbody', {}, ...rows)
      );
    }

    case 'ListItem': {
      const val = node.value ?? '';
      const isOrdered = val.startsWith('#');
      const isDefinition = val.startsWith(';') || val.startsWith(':');
      const text = val.replace(/^[*#;:]+/, '').trim();
      return React.createElement(isOrdered ? 'ol' : 'ul', { key, style: { margin: '4px 0 4px 24px' } },
        React.createElement('li', {}, text)
      );
    }

    case 'HorizontalRule':
      return React.createElement('hr', { key, style: { borderColor: 'var(--border-default)', margin: '16px 0' } });

    case 'Category': {
      const catName = (node.value ?? '').replace(/^(Categoria|Category):/i, '').split('|')[0].trim();
      return React.createElement(
        'div',
        { key, style: { fontSize: 12, color: 'var(--text-muted)', marginTop: 4 } },
        `📁 Categoria: ${catName}`
      );
    }

    case 'Comment':
      return null; // Don't render HTML comments

    case 'Text':
      return node.value ?? '';

    default:
      return null;
  }
}

function buildTableRow(headers: ASTNode[], cells: ASTNode[], rowKey: number): React.ReactNode {
  const headerEls = headers.map((h, i) =>
    React.createElement('th', { key: `h${i}` }, h.value ?? '')
  );
  const cellEls = cells.map((c, i) =>
    React.createElement('td', { key: `c${i}` }, c.value ?? '')
  );
  return React.createElement('tr', { key: rowKey }, ...headerEls, ...cellEls);
}

function resolveImageUrl(filename: string): string {
  const encoded = encodeURIComponent(filename.trim().replace(/ /g, '_'));
  return `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encoded}`;
}
