import { resolveWikiImageUrl } from '../../pokedex/builder/utils/helpers';
import { Col, GridRow, NpcPokemon } from './types';

const TYPE_FILE: Record<string, string> = {
  Normal: 'Normal1.png',
  Poison: 'Poison1.png',
  Ghost: 'Ghost1.png',
  Dark: 'Dark1.png',
  Neutral: 'NeutralICON.png',
};

export function typeFile(t: string) { return TYPE_FILE[t] ?? `${t}.png`; }
export function typeIcon(t: string) { return `[[Arquivo:${typeFile(t)}|link=]]`; }
export function typesToIcons(types: string[]) { return types.map(typeIcon).join(' '); }
export function wikiUrl(file: string) { return resolveWikiImageUrl(file); }

export function gridToWiki(cols: Col[], rows: GridRow[]): string {
  let out = '{| class="wikitable" style="text-align:center;"\n|-\n';
  out += '! ' + cols.map(c => c.name).join(' !! ') + '\n';
  rows.forEach(row => {
    out += '|-\n| ' + cols.map(c => row.cells[c.id] ?? '').join(' || ') + '\n';
  });
  return out + '|}';
}

export function npcToWiki(npcName: string, npcImage: string, npcWidth: string, pokemon: NpcPokemon[]): string {
  if (!pokemon.length) return '';
  const n = pokemon.length;
  let out = '<center>\n';
  out += '{| class="wikitable" width="55%" style="text-align:center;"\n';
  out += '|-\n';
  out += `! width="10%" | ${npcName}\n`;
  out += `! colspan="2" width="20%" | Pokémon\n`;
  out += `! width="15%" | Elemento\n`;
  out += `! width="25%" | Efetivo Contra\n`;
  out += '|-\n';
  // NPC card image with rowspan on first row
  if (npcImage) {
    out += `| rowspan="${n}" style="vertical-align:middle;" |\n[[Arquivo:${npcImage}|64px|link=]]\n`;
  } else {
    out += `| rowspan="${n}" style="vertical-align:middle;" |\n`;
  }
  // First Pokémon on same row
  const p0 = pokemon[0];
  out += `| [[Arquivo:${p0.image}|link=${p0.name}]]\n`;
  out += `| [[${p0.name}]]\n`;
  out += `| ${typesToIcons(p0.types)}\n`;
  out += `| ${typesToIcons(p0.weaknesses)}\n`;
  // Rest of Pokémon
  for (let i = 1; i < pokemon.length; i++) {
    const p = pokemon[i];
    out += '|-\n';
    out += `| [[Arquivo:${p.image}|link=${p.name}]]\n`;
    out += `| [[${p.name}]]\n`;
    out += `| ${typesToIcons(p.types)}\n`;
    out += `| ${typesToIcons(p.weaknesses)}\n`;
  }
  out += '|}\n</center>';
  return out;
}

export function rewardsToWiki(rows: GridRow[], xpText: string): string {
  let out = '<center>\n{| class="wikitable" style="text-align: center;"\n';
  out += '! colspan="2" | Recompensas\n';
  rows.forEach(row => {
    if (row.isXpRow) {
      out += `|-\n! colspan="2" | [[Arquivo:Exp_icon.png|30px|link=]] ${row.cells['item'] ?? ''}\n`;
    } else {
      out += `|-\n| ${row.cells['item'] ?? ''} || ${row.cells['qty'] ?? ''}\n`;
    }
  });
  if (xpText.trim()) {
    out += `|-\n! colspan="2" | [[Arquivo:Exp_icon.png|30px|link=]] ${xpText}\n`;
  }
  out += '|}\n</center>';
  return out;
}
