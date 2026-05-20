const https = require('https');

function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function main() {
  const url = 'https://wiki.pokexgames.com/api.php?action=parse&page=Venusaur&prop=wikitext&formatversion=2&format=json';
  console.log('Fetching live wikitext for Venusaur...');
  const raw = await fetchUrl(url);
  const data = JSON.parse(raw);
  const wikitext = data.parse.wikitext;
  
  console.log('Wikitext Length:', wikitext.length);
  
  const ELEMENT_NORMALIZE = {
    'normal': 'Normal1',
    'fire': 'Fire',
    'water': 'Water',
    'grass': 'Grass',
    'electric': 'Electric',
    'ice': 'Ice',
    'fighting': 'Fighting',
    'poison': 'Poison1',
    'ground': 'Ground',
    'flying': 'Flying',
    'psychic': 'Psychic',
    'bug': 'Bug',
    'rock': 'Rock',
    'ghost': 'Ghost1',
    'dragon': 'Dragon',
    'dark': 'Dark1',
    'steel': 'Steel',
    'fairy': 'Fairy',
    'crystal': 'Crystal',
    'neutral': 'Normal1',
  };

  function normalizeElement(raw) {
    if (!raw) return 'Normal1';
    const key = raw.trim().replace(/\d+$/, '').toLowerCase();
    return ELEMENT_NORMALIZE[key] || (raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase());
  }

  function parseWikitextMoves(wikitext) {
    const moves = [];
    
    const pvpMatch = wikitext.match(/Movimentos\s*PVP[\s\S]*?\{\|([\s\S]*?)\|\}/i);
    const pveMatch = wikitext.match(/Movimentos\s*PVE[\s\S]*?\{\|([\s\S]*?)\|\}/i);
    const singleMovesMatch = wikitext.match(/==\s*'''Movimentos'''\s*==[\s\S]*?\{\|([\s\S]*?)\|\}/i);
    
    function parseSection(sectionText, isPvE) {
      if (!sectionText) return;
      
      const rawRows = sectionText.split(/\|-/);
      for (let i = 1; i < rawRows.length; i += 2) {
        const row1 = rawRows[i] || '';
        const row2 = rawRows[i + 1] || '';
        
        if (!row1.trim()) continue;
        
        const slotMatch = row1.match(/!\s*(?:rowspan="2"\s*)?\|\s*([A-Z0-9]+)\s*(?:\n|\|)/i);
        if (!slotMatch) continue;
        const slot = slotMatch[1].trim();
        
        let moveName = '';
        let cooldown = '';
        let isDifferentPvE = false;
        
        const nameMatch = row1.match(/\|\s*align="left"\s*\|\s*(''')?(.+?)(?:''')?(?:\n|\|)/);
        if (nameMatch) {
          isDifferentPvE = !!nameMatch[1];
          let raw = nameMatch[2].replace(/'''/g, '').trim();
          const cdMatch = raw.match(/^(.*?)\s*\(([^)]+)\)\s*$/);
          if (cdMatch) {
            moveName = cdMatch[1].trim();
            cooldown = cdMatch[2].trim();
          } else {
            moveName = raw;
          }
        }
        
        const iconsMatch = row1.match(/\|\s*(?:rowspan="2"\s*align="right"|align="right"\s*rowspan="2")\s*\|([\s\S]*?)(?=\n\||$)/i);
        const icons = [];
        if (iconsMatch) {
          const iconRegex = /\[\[(?:Arquivo|File):([A-Za-z0-9_\-]+)\.(?:png|gif)/gi;
          let im;
          while ((im = iconRegex.exec(iconsMatch[1])) !== null) {
            let iconName = im[1].trim();
            if (iconName.toLowerCase() === 'poison' || iconName.toLowerCase() === 'poison_icon') {
              iconName = 'Poison';
            }
            icons.push(iconName);
          }
        }
        
        let element = 'Normal1';
        let clan = '';
        const row1WithoutIcons = iconsMatch ? row1.replace(iconsMatch[0], '') : row1;
        const elementMatch = row1WithoutIcons.match(/\[\[(?:Arquivo|File):([A-Za-z0-9]+)\.(?:png|gif)[^\]]*\]\]/i);
        if (elementMatch) {
          element = normalizeElement(elementMatch[1]);
          const linkMatch = elementMatch[0].match(/link=([A-Za-z0-9]+)/i);
          if (linkMatch) {
            clan = linkMatch[1];
          }
        }
        
        const levelMatch = row2.match(/\|\s*align="left"\s*\|\s*Level\s*(\d+)/i) || 
                           row2.match(/Level\s*(\d+)/i) || 
                           row2.match(/Lv\.?\s*(\d+)/i);
        const level = levelMatch ? levelMatch[1] : '100';
        
        if (moveName) {
          moves.push({
            slot,
            name: moveName,
            cooldown,
            level,
            icons,
            element,
            clan,
            isDifferentPvE,
            isPvE
          });
        }
      }
    }
    
    if (pvpMatch) parseSection(pvpMatch[1], false);
    if (pveMatch) parseSection(pveMatch[1], true);
    if (singleMovesMatch && !pvpMatch) parseSection(singleMovesMatch[1], false);
    
    return moves;
  }

  const parsed = parseWikitextMoves(wikitext);
  console.log('Parsed moves count:', parsed.length);
  console.log('Moves sample (first 3):', JSON.stringify(parsed.slice(0, 3), null, 2));
}

main().catch(console.error);
