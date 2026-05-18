import { tokenize } from './lexer/lexer';
import { buildAST, DocumentNode } from './ast/ast';

export function parseWikiText(source: string): DocumentNode {
  const tokens = tokenize(source);
  return buildAST(tokens);
}
