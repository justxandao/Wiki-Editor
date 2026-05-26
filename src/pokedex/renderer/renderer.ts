import { PokedexSchema, MoveEntry } from '../types/schema';
import { FORM_ATTRIBUTES } from '../builder/utils/constants';

export function renderPokedexWikitext(schema: PokedexSchema): string {
  const { generalInfo, evolutions, moves, effectiveness, altVersions } = schema;

  let code = `<center>[[file:${generalInfo.number} - ${generalInfo.name}.png|link=]]</center>\n\n`;
  
  // General Info
  code += `== '''Informações Gerais''' ==\n\n`;
  code += `'''Nome:''' ${generalInfo.name}<br />\n`;
  code += `'''Level:''' ${generalInfo.level}<br />\n`;
  code += `'''Elemento:''' ${generalInfo.element}<br />\n`;
  code += `'''Habilidades:''' ${generalInfo.abilities}<br />\n`;
  code += `'''Boost:''' ${generalInfo.boost}<br />\n`;
  code += `'''Materia:''' ${generalInfo.materia}<br />\n\n`;

  // Evolutions
  code += `== '''Evoluções''' ==\n\n`;
  evolutions.forEach((evo, index) => {
    code += `'''${evo.name}''' precisa de Level ${evo.level}.`;
    if (index < evolutions.length - 1) code += `</br>\n`;
    else code += `\n\n`;
  });

  // Description
  code += `== '''Descrição:''' ==\n`;
  code += `${generalInfo.description}\n\n`;

  // Moves
  code += `== '''Movimentos''' ==\n\n`;

  // Helper to generate a move row
  const generateMoveRow = (move: MoveEntry, isPvE: boolean, index: number) => {
    const bgColor = index % 2 === 0 ? ' style="background-color: #E6E6FA;"' : '';
    
    // Handle bolding for PvE differences if requested
    let moveNameDisplay = move.name;
    const cooldown = isPvE ? move.cooldownPvE : (move.cooldownPvP || move.cooldownPvE);
    if (cooldown) moveNameDisplay += ` (${cooldown})`;
    if (isPvE && move.isDifferentPvE) {
      moveNameDisplay = `'''${moveNameDisplay}'''`;
    }

    let row = `|- align="center"${bgColor}\n`;
    row += `! rowspan="2" | ${move.slot}\n`;
    row += `| width="10px" |\n`;
    row += `| align="left" | ${moveNameDisplay}\n`;
    row += `| width="50px" rowspan="2" |\n`;
    
    // Icons
    const iconsStr = move.icons.map(icon => {
      const attr = FORM_ATTRIBUTES.find(a => a.id === icon);
      const filename = attr ? attr.file : `${icon}.png`;
      return `[[Arquivo:${filename}|${icon}]]`;
    }).join(' ');
    row += `| rowspan="2" align="right" | ${iconsStr} \n`;
    
    // Element/Clan
    let elemFile = move.element || 'Normal1';
    if (elemFile === 'Poison') elemFile = 'Poison1';
    if (elemFile === 'Ghost') elemFile = 'Ghost1';
    if (elemFile === 'Dark') elemFile = 'Dark1';
    row += `| rowspan="2" | [[Arquivo:${elemFile}.png|${elemFile.replace('1', '')}|link=${move.clan}]]\n`;
    
    // Second row: wild-only label OR level
    row += `|- align="center"${bgColor}\n`;
    row += `| width="10px" |\n`;
    if (move.wildOnly) {
      row += `| align="left" | '''(Usado apenas por Pokémon selvagem)'''\n\n`;
    } else {
      row += `| align="left" | Level ${move.level}\n\n`;
    }
    
    return row;
  };

  const hasPvPVariation = moves.some(move => {
    const pvpCooldown = (move.cooldownPvP || '').trim();
    const pveCooldown = (move.cooldownPvE || '').trim();
    const hasDifferentCooldown = pvpCooldown !== '' && pvpCooldown !== pveCooldown;
    return hasDifferentCooldown || move.isDifferentPvE;
  });

  if (hasPvPVariation) {
    // PvP Moves
    code += `==='''Movimentos PvP'''===\n\n`;
    code += `{| border="0" style="border-collapse:collapse"\n`;
    moves.forEach((move, index) => {
      code += generateMoveRow(move, false, index);
    });
    code += `|}\n\n`;

    // PvE Moves
    code += `==='''Movimentos PvE'''===\n\n`;
    code += `{| border="0" style="border-collapse:collapse"\n`;
    moves.forEach((move, index) => {
      code += generateMoveRow(move, true, index);
    });
    code += `|}\n`;
  } else {
    code += `{| border="0" style="border-collapse:collapse"\n`;
    moves.forEach((move, index) => {
      code += generateMoveRow(move, true, index); // True uses PvE formatting which is the base
    });
    code += `|}\n\n`;
  }

  // Effectiveness
  code += `== '''Efetividades''' ==\n\n`;
  code += `'''Muito Efetivo:''' ${effectiveness.veryEffective}<br />\n`;
  code += `'''Efetivo:''' ${effectiveness.effective}<br />\n`;
  code += `'''Normal:''' ${effectiveness.normal}<br />\n`;
  code += `'''Inefetivo:''' ${effectiveness.ineffective}<br />\n`;
  code += `'''Muito Inefetivo:''' ${effectiveness.veryIneffective}<br />\n`;
  if (effectiveness.nulo) {
    code += `'''Nulo:''' ${effectiveness.nulo}<br />\n`;
  }
  code += `\n`;

  // Alternate Versions
  code += `== '''Outras Versões''' ==\n\n`;
  code += `{| class="wikitable"\n`;
  code += `|- style="vertical-align:top; text-align=center;"\n`;
  
  // First row (images)
  altVersions.forEach(alt => {
    code += `| style="width:50px; text-align:center;" | <b>[[Arquivo:${alt.imagePrefix}${alt.name.replace('Shiny ', '')}.png|link=${alt.name}]]</b>\n`;
  });
  code += `|-\n`;
  
  // Second row (names)
  altVersions.forEach(alt => {
    code += `| style="width:150px; text-align:center;" | <b>'''[[${alt.name}]]'''</b>\n`;
  });
  code += `|}`;

  return code;
}
