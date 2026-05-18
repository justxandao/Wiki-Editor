import { PokedexSchema } from '../types/schema';

export function renderEvolutions(schema: PokedexSchema): string {
  if (!schema.evolutions.length) return '';
  
  let out = '\n== \'\'\'Evoluções\'\'\' ==\n\n';
  schema.evolutions.forEach(evo => {
    out += `\'\'\'${evo.pokemon}\'\'\' precisa de ${evo.requirement}.<br />\n`;
  });
  return out;
}
