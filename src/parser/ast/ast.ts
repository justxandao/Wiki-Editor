import { Token, tokenizeInline } from '../lexer/lexer';

// =============================================
// AST Node Types
// =============================================

export type ASTNodeType =
  | 'Document'
  | 'Heading'
  | 'Paragraph'
  | 'Bold'
  | 'Italic'
  | 'BoldItalic'
  | 'InternalLink'
  | 'FileLink'
  | 'Category'
  | 'Template'
  | 'ParserFunction'
  | 'Table'
  | 'TableRow'
  | 'TableCell'
  | 'TableHeader'
  | 'TableCaption'
  | 'ListItem'
  | 'HorizontalRule'
  | 'Comment'
  | 'Text'
  | 'Newline';

export interface ASTNode {
  type: ASTNodeType;
  children?: ASTNode[];
  value?: string;
  attrs?: Record<string, string>;
  level?: number; // heading level
  line?: number;
}

export interface DocumentNode extends ASTNode {
  type: 'Document';
  children: ASTNode[];
}

// =============================================
// Parser: Token[] → AST
// =============================================

export function buildAST(tokens: Token[]): DocumentNode {
  const children: ASTNode[] = [];
  let i = 0;

  while (i < tokens.length) {
    const token = tokens[i];

    switch (token.type) {
      case 'heading':
        children.push({
          type: 'Heading',
          value: token.value,
          level: token.level ?? 1,
          line: token.line,
        });
        i++;
        break;

      case 'bold':
        children.push({ 
          type: 'Bold', 
          value: token.value, 
          children: buildAST(tokenizeInline(token.value, token.line)).children,
          line: token.line 
        });
        i++;
        break;

      case 'italic':
        children.push({ 
          type: 'Italic', 
          value: token.value, 
          children: buildAST(tokenizeInline(token.value, token.line)).children,
          line: token.line 
        });
        i++;
        break;

      case 'bold_italic':
        children.push({ 
          type: 'BoldItalic', 
          value: token.value, 
          children: buildAST(tokenizeInline(token.value, token.line)).children,
          line: token.line 
        });
        i++;
        break;

      case 'link_target': {
        const inner = token.value;
        const parts = inner.split('|');
        const target = parts[0].trim();
        const display = parts[1]?.trim() ?? target;
        children.push({
          type: 'InternalLink',
          value: display,
          attrs: { target, display },
          line: token.line,
        });
        i++;
        break;
      }

      case 'file_link': {
        const inner = token.value;
        // [[Arquivo:filename.png|link=X|caption]]
        const parts = inner.split('|');
        const filename = parts[0].replace(/^(Arquivo|File|Image|Ficheiro):/i, '').trim();
        const attrs: Record<string, string> = { filename };
        for (const p of parts.slice(1)) {
          if (p.startsWith('link=')) attrs['link'] = p.slice(5);
          else if (p.startsWith('thumb')) attrs['thumb'] = 'true';
          else if (p.startsWith('right') || p.startsWith('left') || p.startsWith('center')) attrs['align'] = p;
          else attrs['caption'] = p;
        }
        children.push({ type: 'FileLink', attrs, line: token.line });
        i++;
        break;
      }

      case 'category':
        children.push({ type: 'Category', value: token.value, line: token.line });
        i++;
        break;

      case 'template_name': {
        const inner = token.value;
        const parts = inner.split('|');
        const name = parts[0].trim();
        const params: Record<string, string> = {};
        let pIdx = 1;
        for (const p of parts.slice(1)) {
          const eq = p.indexOf('=');
          if (eq !== -1) {
            params[p.slice(0, eq).trim()] = p.slice(eq + 1).trim();
          } else {
            params[String(pIdx++)] = p.trim();
          }
        }
        children.push({ type: 'Template', value: name, attrs: params, line: token.line });
        i++;
        break;
      }

      case 'parser_func':
        children.push({ type: 'ParserFunction', value: token.value, line: token.line });
        i++;
        break;

      case 'table_start': {
        const tableChildren: ASTNode[] = [];
        i++;
        while (i < tokens.length && tokens[i].type !== 'table_end') {
          const t = tokens[i];
          if (t.type === 'table_row') {
            tableChildren.push({ type: 'TableRow', value: t.value, line: t.line });
          } else if (t.type === 'table_header') {
            tableChildren.push({ type: 'TableHeader', value: t.value, line: t.line });
          } else if (t.type === 'table_cell') {
            tableChildren.push({ type: 'TableCell', value: t.value, line: t.line });
          } else if (t.type === 'table_caption') {
            tableChildren.push({ type: 'TableCaption', value: t.value, line: t.line });
          }
          i++;
        }
        children.push({ type: 'Table', children: tableChildren, attrs: { class: token.value }, line: token.line });
        i++; // skip table_end
        break;
      }

      case 'list_item':
        children.push({ type: 'ListItem', value: token.value, line: token.line });
        i++;
        break;

      case 'hr':
        children.push({ type: 'HorizontalRule', line: token.line });
        i++;
        break;

      case 'comment':
        children.push({ type: 'Comment', value: token.value, line: token.line });
        i++;
        break;

      case 'text':
        children.push({ type: 'Text', value: token.value, line: token.line });
        i++;
        break;

      case 'newline':
        children.push({ type: 'Newline', line: token.line });
        i++;
        break;

      default:
        i++;
    }
  }

  return { type: 'Document', children };
}
