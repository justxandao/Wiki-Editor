import { PokedexSchema } from '../types/schema';

export function renderDescription(schema: PokedexSchema): string {
  if (!schema.description) return '';
  return `\n== \'\'\'Descrição:\'\'\' ==\n${schema.description}\n`;
}
