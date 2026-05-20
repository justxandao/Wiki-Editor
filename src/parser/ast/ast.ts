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
  | 'Newline'
  | 'Center'
  | 'HTMLTag';

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
        const parts = inner.split('|');
        const filename = parts[0].replace(/^(Arquivo|File|Image|Ficheiro):/i, '').trim();
        const attrs: Record<string, string> = { filename };
        for (const p of parts.slice(1)) {
          const trimP = p.trim();
          if (trimP.startsWith('link=')) attrs['link'] = trimP.slice(5);
          else if (trimP.startsWith('thumb')) attrs['thumb'] = 'true';
          else if (trimP === 'right' || trimP === 'left' || trimP === 'center') attrs['align'] = trimP;
          else if (/^\d+px$/.test(trimP)) attrs['width'] = trimP;
          else attrs['caption'] = trimP;
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
            const split = splitCellContent(t.value);
            tableChildren.push({
              type: 'TableHeader',
              value: split.content,
              children: buildAST(tokenizeInline(split.content, t.line)).children,
              attrs: { raw: split.attrs },
              line: t.line
            });
          } else if (t.type === 'table_cell') {
            const split = splitCellContent(t.value);
            tableChildren.push({
              type: 'TableCell',
              value: split.content,
              children: buildAST(tokenizeInline(split.content, t.line)).children,
              attrs: { raw: split.attrs },
              line: t.line
            });
          } else if (t.type === 'table_caption') {
            tableChildren.push({ type: 'TableCaption', value: t.value, line: t.line });
          }
          i++;
        }
        children.push({ type: 'Table', children: tableChildren, attrs: { raw: token.value }, line: token.line });
        i++; // skip table_end
        break;
      }

      case 'list_item':
        children.push({
          type: 'ListItem',
          value: token.value,
          children: buildAST(tokenizeInline(token.value, token.line)).children,
          attrs: { prefix: token.prefix ?? '*' },
          line: token.line
        });
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

      case 'html_tag': {
        const tag = token.value.toLowerCase();
        if (tag === '<center>') {
          const innerTokens: Token[] = [];
          i++;
          while (i < tokens.length) {
            const t = tokens[i];
            if (t.type === 'html_tag' && t.value.toLowerCase() === '</center>') {
              i++; // skip </center>
              break;
            }
            innerTokens.push(t);
            i++;
          }
          children.push({
            type: 'Center',
            children: buildAST(innerTokens).children,
            line: token.line
          });
        } else if (tag === '<br>' || tag === '<br/>' || tag === '<br />') {
          children.push({ type: 'HTMLTag', value: 'br', line: token.line });
          i++;
        } else {
          i++;
        }
        break;
      }

      default:
        i++;
    }
  }

  return { type: 'Document', children };
}

function splitCellContent(rawStr: string): { attrs: string; content: string } {
  let pipeIdx = -1;
  let bracketDepth = 0;
  let braceDepth = 0;
  
  for (let i = 0; i < rawStr.length; i++) {
    const char = rawStr[i];
    if (char === '[' && rawStr[i+1] === '[') { bracketDepth++; i++; }
    else if (char === ']' && rawStr[i+1] === ']') { bracketDepth--; i++; }
    else if (char === '{' && rawStr[i+1] === '{') { braceDepth++; i++; }
    else if (char === '}' && rawStr[i+1] === '}') { braceDepth--; i++; }
    else if (char === '|' && bracketDepth === 0 && braceDepth === 0) {
      pipeIdx = i;
      break;
    }
  }
  
  if (pipeIdx !== -1) {
    return {
      attrs: rawStr.slice(0, pipeIdx).trim(),
      content: rawStr.slice(pipeIdx + 1).trim()
    };
  }
  
  return { attrs: '', content: rawStr.trim() };
}
