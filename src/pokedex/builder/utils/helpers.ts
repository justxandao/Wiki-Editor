import { EffectivenessData, PokedexSchema } from '../../types/schema';
import { TYPE_CHART, ALL_ATTACK_TYPES } from './constants';

export function getBaseMultiplier(attacker: string, defender: string): number {
  return TYPE_CHART[attacker]?.[defender] ?? 1;
}

export function calculateEffectiveness(elements: string[]): EffectivenessData {
  const result: EffectivenessData = {
    veryEffective: '',
    effective: '',
    normal: '',
    ineffective: '',
    veryIneffective: '',
    nulo: ''
  };

  if (elements.length === 0) return result;

  const buckets: Record<string, string[]> = {
    veryEffective: [],
    effective: [],
    normal: [],
    ineffective: [],
    veryIneffective: [],
    nulo: []
  };

  for (const atk of ALL_ATTACK_TYPES) {
    if (elements.length === 1) {
      const mult = getBaseMultiplier(atk, elements[0]);
      if (mult >= 2)   buckets.veryEffective.push(atk);
      else if (mult === 0) buckets.nulo.push(atk);
      else if (mult <= 0.5) buckets.veryIneffective.push(atk);
      else buckets.normal.push(atk);
    } else {
      const m1 = getBaseMultiplier(atk, elements[0]);
      const m2 = getBaseMultiplier(atk, elements[1]);
      let combined = m1 * m2;

      if (combined === 0) buckets.nulo.push(atk);
      else if (combined >= 2) buckets.veryEffective.push(atk);
      else if (combined === 1.75 || (m1 === 2 && m2 === 1) || (m1 === 1 && m2 === 2)) buckets.effective.push(atk);
      else if (combined === 1) buckets.normal.push(atk);
      else if (combined === 0.75 || (m1 === 0.5 && m2 === 1) || (m1 === 1 && m2 === 0.5)) buckets.ineffective.push(atk);
      else if (combined <= 0.5) buckets.veryIneffective.push(atk);
      else buckets.normal.push(atk);
    }
  }

  const fmt = (arr: string[]) => {
    if (arr.length === 0) return '';
    if (arr.length === 1) return `${arr[0]}.`;
    const last = arr[arr.length - 1];
    return `${arr.slice(0, -1).join(', ')} and ${last}.`;
  };

  result.veryEffective = fmt(buckets.veryEffective);
  result.effective = fmt(buckets.effective);
  result.normal = fmt(buckets.normal);
  result.ineffective = fmt(buckets.ineffective);
  result.veryIneffective = fmt(buckets.veryIneffective);
  result.nulo = fmt(buckets.nulo);

  return result;
}

export function resolveWikiImageUrl(filename: string): string {
  let name = filename.trim();
  if (name.toLowerCase() === 'poison.png') name = 'Poison1.png';
  if (name.toLowerCase() === 'ghost.png') name = 'Ghost1.png';
  if (name.toLowerCase() === 'dark.png') name = 'Dark1.png';
  const encoded = encodeURIComponent(name.replace(/ /g, '_'));
  return `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encoded}`;
}

export function parseWikitextToSchema(text: string): PokedexSchema {
  // Simplified version of the massive parsing function, moved here.
  const schema: PokedexSchema = {
    generalInfo: { name: '', number: '', level: '', element: '', abilities: '', boost: '', materia: '', description: '' },
    evolutions: [],
    moves: [],
    effectiveness: { veryEffective: '', effective: '', normal: '', ineffective: '', veryIneffective: '', nulo: '' },
    altVersions: []
  };

  const nameMatch = text.match(/'''Nome:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (nameMatch) schema.generalInfo.name = nameMatch[1].trim();

  const levelMatch = text.match(/'''Level:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (levelMatch) schema.generalInfo.level = levelMatch[1].trim();

  const elementMatch = text.match(/'''Elemento:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (elementMatch) schema.generalInfo.element = elementMatch[1].trim();

  const abilitiesMatch = text.match(/'''Habilidades:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (abilitiesMatch) schema.generalInfo.abilities = abilitiesMatch[1].trim();

  const boostMatch = text.match(/'''Boost:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (boostMatch) schema.generalInfo.boost = boostMatch[1].trim();

  const materiaMatch = text.match(/'''Materia:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (materiaMatch) schema.generalInfo.materia = materiaMatch[1].trim();

  const imageMatch = text.match(/\[\[(?:file|arquivo):(\d+)\s*-\s*.*?\.png/i);
  if (imageMatch) schema.generalInfo.number = imageMatch[1].trim();

  const descMatch = text.match(/==\s*'''Descrição:?'''\s*==\s*\n+([\s\S]*?)(?:\n+==|\n+{|\[\[Categoria)/i);
  if (descMatch) schema.generalInfo.description = descMatch[1].trim();

  const evoRegex = /'''(.*?)'''\s*precisa de Level\s*(\d+)/gi;
  let match;
  while ((match = evoRegex.exec(text)) !== null) {
    schema.evolutions.push({ name: match[1].trim(), level: match[2].trim() });
  }

  const veryEff = text.match(/'''Muito Efetivo:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (veryEff) schema.effectiveness.veryEffective = veryEff[1].trim();

  const eff = text.match(/'''Efetivo:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (eff) schema.effectiveness.effective = eff[1].trim();

  const norm = text.match(/'''Normal:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (norm) schema.effectiveness.normal = norm[1].trim();

  const ineff = text.match(/'''Inefetivo:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (ineff) schema.effectiveness.ineffective = ineff[1].trim();

  const veryIneff = text.match(/'''Muito Inefetivo:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (veryIneff) schema.effectiveness.veryIneffective = veryIneff[1].trim();

  const nulo = text.match(/'''Nulo:'''\s*(.*?)(?:<br\s*\/?>|\n)/i);
  if (nulo) schema.effectiveness.nulo = nulo[1].trim();

  const tablePart = text.match(/==\s*'''Outras Versões'''\s*==\s*\n+([\s\S]*?)$/i);
  if (tablePart) {
    const tableContent = tablePart[1];
    const imageLines = tableContent.match(/\| style="width:50px;[^|]*\|\s*<b>\[\[(?:Arquivo|File):(.*?)\.png\|link=(.*?)\]\]<\/b>/gi) || [];
    const nameLines = tableContent.match(/\| style="width:150px;[^|]*\|\s*<b>'''\[\[(.*?)\]\]'''<\/b>/gi) || [];
    
    imageLines.forEach((imgLine, idx) => {
      const imgMatch = imgLine.match(/\[\[(?:Arquivo|File):(.*?)\.png\|link=(.*?)\]\]/i);
      const nameMatch2 = nameLines[idx] ? nameLines[idx].match(/\[\[(.*?)\]\]/i) : null;
      if (imgMatch) {
        const fullImgName = imgMatch[1];
        const linkName = imgMatch[2] || (nameMatch2 ? nameMatch2[1] : '');
        const baseName = linkName.replace('Shiny ', '');
        const prefix = fullImgName.split(baseName)[0] || '';
        schema.altVersions.push({ name: linkName, imagePrefix: prefix });
      }
    });
  }

  const pvpSection = text.match(/===\s*'''Movimentos PvP'''\s*===\s*\n+\{\|\s*border="0"[\s\S]*?\|}/gi);
  const pveSection = text.match(/===\s*'''Movimentos PvE'''\s*===\s*\n+\{\|\s*border="0"[\s\S]*?\|}/gi);
  const singleMovesSection = text.match(/==\s*'''Movimentos'''\s*==\s*\n+\{\|\s*border="0"[\s\S]*?\|}/gi);

  const movesMap = new Map<string, typeof schema.moves[0]>();

  const parseMovesTable = (tableText: string, isPvE: boolean) => {
    const rows = tableText.split(/\|-\s*align="center"/gi);
    for (let i = 1; i < rows.length; i += 2) {
      const row1 = rows[i];
      const row2 = rows[i + 1] || '';
      
      const slotMatch = row1.match(/!\s*rowspan="2"\s*\|\s*(\w+)/i);
      const nameCdMatch = row1.match(/\|\s*align="left"\s*\|\s*(.*?)(?:\n|\|)/i);
      const iconsMatch = row1.match(/\|\s*rowspan="2"\s*align="right"\s*\|\s*(.*?)(?:\n|\|)/i);
      const elementMatch = row1.match(/\|\s*rowspan="2"\s*\|\s*\[\[(?:Arquivo|File):(.*?)\.png/i);
      const clanMatch = row1.match(/link=(\w+)/i);
      const levelMatch = row2.match(/\|\s*align="left"\s*\|\s*Level\s*(\d+)/i);

      if (slotMatch) {
        const slot = slotMatch[1].trim();
        let nameAndCd = nameCdMatch ? nameCdMatch[1].trim() : '';
        const isBold = nameAndCd.startsWith("'''") && nameAndCd.endsWith("'''");
        nameAndCd = nameAndCd.replace(/'''/g, '');
        
        let moveName = nameAndCd;
        let cooldown = '';
        const cdMatch = nameAndCd.match(/(.*?)\s*\((.*?)\)/);
        if (cdMatch) {
          moveName = cdMatch[1].trim();
          cooldown = cdMatch[2].trim();
        }

        const icons: string[] = [];
        if (iconsMatch) {
          const iconRegex = /\[\[(?:Arquivo|File):(.*?)\.png/gi;
          let im;
          while ((im = iconRegex.exec(iconsMatch[1])) !== null) {
            icons.push(im[1].trim());
          }
        }

        const element = elementMatch ? elementMatch[1].trim() : 'Normal1';
        const clan = clanMatch ? clanMatch[1].trim() : 'Gardestrike';
        const level = levelMatch ? levelMatch[1].trim() : '100';

        const key = `${slot}-${moveName}`;
        let move = movesMap.get(key);
        if (!move) {
          move = {
            id: movesMap.size + 1,
            slot,
            name: moveName,
            cooldownPvP: isPvE ? '' : cooldown,
            cooldownPvE: isPvE ? cooldown : '',
            level,
            icons,
            element,
            clan,
            isDifferentPvE: isBold
          };
          movesMap.set(key, move);
        } else {
          if (isPvE) {
            move.cooldownPvE = cooldown;
            move.isDifferentPvE = isBold || move.isDifferentPvE;
          } else {
            move.cooldownPvP = cooldown;
          }
        }
      }
    }
  };

  if (pvpSection && pvpSection[0]) parseMovesTable(pvpSection[0], false);
  if (pveSection && pveSection[0]) parseMovesTable(pveSection[0], true);
  if (singleMovesSection && singleMovesSection[0]) parseMovesTable(singleMovesSection[0], false);

  schema.moves = Array.from(movesMap.values());
  return schema;
}
