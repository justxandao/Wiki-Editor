import { MoveEntry } from '../types/schema';

// Maps element types to clans
const TYPE_TO_CLAN: Record<string, string> = {
  'Normal': 'Gardestrike',
  'Fire': 'Volcanic',
  'Water': 'Seavell',
  'Grass': 'Naturia',
  'Electric': 'Raibolt',
  'Ice': 'Naturia',
  'Fighting': 'Gardestrike',
  'Poison': 'Malefic',
  'Ground': 'Orebound',
  'Flying': 'Wingeon',
  'Psychic': 'Psycraft',
  'Bug': 'Naturia',
  'Rock': 'Orebound',
  'Ghost': 'Malefic',
  'Dragon': 'Wingeon',
  'Dark': 'Malefic',
  'Steel': 'Ironhard',
  'Fairy': 'Psycraft'
};

export function renderMoveTable(moves: MoveEntry[], title: string): string {
  if (!moves.length) return '';

  let out = `\n===\'\'\'${title}\'\'\'===\n\n`;
  out += `{| border="0" style="border-collapse:collapse"\n`;

  moves.forEach((move, index) => {
    const isEven = index % 2 === 0;
    const bgStyle = isEven ? ` style="background-color: #E6E6FA;"` : '';
    
    // Categories
    const categoriesStr = move.categories.map(c => `[[Arquivo:${c}.png|${c}]]`).join(' ');
    
    // Type/Clan
    const typeIcon = move.type === 'Normal' ? 'Normal1' : move.type;
    const clan = TYPE_TO_CLAN[move.type] || '';
    const typeStr = clan ? `[[Arquivo:${typeIcon}.png|${move.type}|link=${clan}]]` : `[[Arquivo:${typeIcon}.png|${move.type}]]`;
    
    // Move name bold logic
    const moveNameStr = move.isBold ? `\'\'\'${move.name} (${move.cooldown})\'\'\'` : `${move.name} (${move.cooldown})`;

    out += `|- align="center"${bgStyle}\n`;
    out += `! rowspan="2" | ${move.slot}\n`;
    out += `| width="10px" |\n`;
    out += `| align="left" | ${moveNameStr}\n`;
    out += `| width="50px" rowspan="2" |\n`;
    out += `| rowspan="2" align="right" | ${categoriesStr} \n`;
    out += `| rowspan="2" | ${typeStr}\n`;
    
    out += `|- align="center"${bgStyle}\n`;
    out += `| width="10px" |\n`;
    out += `| align="left" | Level ${move.level || 100}\n\n`;
  });

  out += `|}\n`;
  return out;
}
