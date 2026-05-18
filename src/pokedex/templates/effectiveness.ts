import { PokedexSchema } from '../types/schema';

export function renderEffectiveness(schema: PokedexSchema): string {
  const { effectiveness } = schema;
  let out = `\n== \'\'\'Efetividades\'\'\' ==\n\n`;
  
  if (effectiveness.veryEffective.length) out += `\'\'\'Muito Efetivo:\'\'\' ${effectiveness.veryEffective.join(' and ')}.<br />\n`;
  if (effectiveness.effective.length) out += `\'\'\'Efetivo:\'\'\' ${effectiveness.effective.join(' and ')}.<br />\n`;
  if (effectiveness.normal.length) out += `\'\'\'Normal:\'\'\' ${effectiveness.normal.join(', ')}.\\n`;
  if (effectiveness.ineffective.length) out += `\'\'\'Inefetivo:\'\'\' ${effectiveness.ineffective.join(' and ')}.<br />\n`;
  if (effectiveness.veryIneffective.length) out += `\'\'\'Muito Inefetivo:\'\'\' ${effectiveness.veryIneffective.join(' and ')}.<br />\n`;
  if (effectiveness.immune.length) out += `\'\'\'Imune:\'\'\' ${effectiveness.immune.join(' and ')}.<br />\n`;
  
  return out;
}
