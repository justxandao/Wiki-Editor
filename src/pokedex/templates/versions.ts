import { PokedexSchema } from '../types/schema';

export function renderVersions(schema: PokedexSchema): string {
  if (!schema.versions.length) return '';
  
  let out = `\n== \'\'\'Outras Versões\'\'\' ==\n\n`;
  out += `{| class="wikitable"\n`;
  out += `|- style="vertical-align:top; text-align=center;"\n`;
  
  schema.versions.forEach((v, idx) => {
    if (idx > 0 && idx % 3 === 0) {
      out += `|-\n`;
    }
    const safePokemon = v.pokemon.replace(/ /g, '_');
    out += `| style="width:50px; text-align:center;" | <b>[[Arquivo:000-${safePokemon}.png|link=${v.pokemon}]]</b>\n`;
    out += `| style="width:150px; text-align:center;" | <b>\'\'\'[[${v.pokemon}]]\'\'\'</b>\n`;
  });
  
  out += `|}\n`;
  return out;
}
