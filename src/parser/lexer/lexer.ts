// =============================================
// WikiText Lexer
// Tokenizes raw wikitext into typed tokens
// =============================================

export type TokenType =
  | 'heading'
  | 'bold'
  | 'italic'
  | 'bold_italic'
  | 'link_open'
  | 'link_close'
  | 'link_text'
  | 'link_target'
  | 'file_link'
  | 'template_open'
  | 'template_close'
  | 'template_name'
  | 'template_param'
  | 'table_start'
  | 'table_end'
  | 'table_row'
  | 'table_header'
  | 'table_cell'
  | 'table_caption'
  | 'list_item'
  | 'hr'
  | 'html_tag'
  | 'category'
  | 'parser_func'
  | 'comment'
  | 'text'
  | 'newline';

export interface Token {
  type: TokenType;
  value: string;
  raw: string;
  line: number;
  col: number;
  level?: number; // for headings
  depth?: number; // for templates
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const lines = input.split('\n');

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    let col = 0;

    // Headings: == Title ==
    const headingMatch = line.match(/^(={1,6})\s*(.+?)\s*\1\s*$/);
    if (headingMatch) {
      tokens.push({
        type: 'heading',
        value: headingMatch[2],
        raw: line,
        line: lineIdx,
        col: 0,
        level: headingMatch[1].length,
      });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }

    // Horizontal rule
    if (/^-{4,}$/.test(line.trim())) {
      tokens.push({ type: 'hr', value: '----', raw: line, line: lineIdx, col: 0 });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }

    // Tables
    if (line.startsWith('{|')) {
      tokens.push({ type: 'table_start', value: line.slice(2).trim(), raw: line, line: lineIdx, col: 0 });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }
    if (line.startsWith('|}')) {
      tokens.push({ type: 'table_end', value: '', raw: line, line: lineIdx, col: 0 });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }
    if (line.startsWith('|-')) {
      tokens.push({ type: 'table_row', value: line.slice(2).trim(), raw: line, line: lineIdx, col: 0 });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }
    if (line.startsWith('!')) {
      tokens.push({ type: 'table_header', value: line.slice(1).trim(), raw: line, line: lineIdx, col: 0 });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }
    if (line.startsWith('|+')) {
      tokens.push({ type: 'table_caption', value: line.slice(2).trim(), raw: line, line: lineIdx, col: 0 });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }
    if (line.startsWith('|') && !line.startsWith('|-') && !line.startsWith('|+') && !line.startsWith('|}')) {
      tokens.push({ type: 'table_cell', value: line.slice(1).trim(), raw: line, line: lineIdx, col: 0 });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }

    // List items
    if (/^[*#;:]/.test(line)) {
      tokens.push({ type: 'list_item', value: line, raw: line, line: lineIdx, col: 0 });
      tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
      continue;
    }

    // HTML comments
    if (line.includes('<!--')) {
      const commentMatch = line.match(/<!--[\s\S]*?-->/);
      if (commentMatch) {
        tokens.push({ type: 'comment', value: commentMatch[0], raw: commentMatch[0], line: lineIdx, col: line.indexOf('<!--') });
      }
    }

    // Parse inline tokens
    const inlineTokens = tokenizeInline(line, lineIdx);
    tokens.push(...inlineTokens);
    tokens.push({ type: 'newline', value: '\n', raw: '\n', line: lineIdx, col: line.length });
  }

  return tokens;
}

export function tokenizeInline(text: string, lineIdx: number): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  let buffer = '';
  let col = 0;

  const flush = () => {
    if (buffer) {
      tokens.push({ type: 'text', value: buffer, raw: buffer, line: lineIdx, col });
      col += buffer.length;
      buffer = '';
    }
  };

  while (i < text.length) {
    // File / Category links [[Arquivo:...]] [[Categoria:...]]
    if (text.startsWith('[[', i)) {
      flush();
      const end = text.indexOf(']]', i + 2);
      if (end !== -1) {
        const inner = text.slice(i + 2, end);
        const raw = text.slice(i, end + 2);
        if (/^(Arquivo|File|Image|Ficheiro):/i.test(inner)) {
          tokens.push({ type: 'file_link', value: inner, raw, line: lineIdx, col: i });
        } else if (/^(Categoria|Category):/i.test(inner)) {
          tokens.push({ type: 'category', value: inner, raw, line: lineIdx, col: i });
        } else {
          tokens.push({ type: 'link_target', value: inner, raw, line: lineIdx, col: i });
        }
        col = i + raw.length;
        i = end + 2;
        continue;
      }
    }

    // Templates {{...}}
    if (text.startsWith('{{', i)) {
      flush();
      // Find matching }}
      let depth = 1;
      let j = i + 2;
      while (j < text.length && depth > 0) {
        if (text.startsWith('{{', j)) { depth++; j += 2; }
        else if (text.startsWith('}}', j)) { depth--; j += 2; }
        else j++;
      }
      const raw = text.slice(i, j);
      const inner = text.slice(i + 2, j - 2);
      const isParserFunc = inner.includes(':') && !inner.includes('\n');
      tokens.push({
        type: isParserFunc ? 'parser_func' : 'template_name',
        value: inner,
        raw,
        line: lineIdx,
        col: i,
      });
      col = j;
      i = j;
      continue;
    }

    // Bold+italic
    if (text.startsWith("'''''", i)) {
      flush();
      const end = text.indexOf("'''''", i + 5);
      if (end !== -1) {
        tokens.push({ type: 'bold_italic', value: text.slice(i + 5, end), raw: text.slice(i, end + 5), line: lineIdx, col: i });
        i = end + 5; col = i; continue;
      }
    }

    // Bold
    if (text.startsWith("'''", i)) {
      flush();
      const end = text.indexOf("'''", i + 3);
      if (end !== -1) {
        tokens.push({ type: 'bold', value: text.slice(i + 3, end), raw: text.slice(i, end + 3), line: lineIdx, col: i });
        i = end + 3; col = i; continue;
      }
    }

    // Italic
    if (text.startsWith("''", i)) {
      flush();
      const end = text.indexOf("''", i + 2);
      if (end !== -1) {
        tokens.push({ type: 'italic', value: text.slice(i + 2, end), raw: text.slice(i, end + 2), line: lineIdx, col: i });
        i = end + 2; col = i; continue;
      }
    }

    buffer += text[i];
    i++;
  }

  flush();
  return tokens;
}
