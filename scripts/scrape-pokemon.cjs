/**
 * PxG Wiki Pokémon Move Scraper (v2 - uses MediaWiki API for wikitext)
 * Fetches raw wikitext for all Pokémon and extracts moves into JSON
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// =============================================
// ELEMENT NORMALIZATION (wiki file names)
// =============================================
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

// =============================================
// HTTP Fetcher with retry and rate limit
// =============================================
function fetchUrl(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (n) => {
      https.get(url, {
        headers: {
          'User-Agent': 'PxGWikiScraper/1.0 (educational purpose)',
          'Accept': 'application/json'
        }
      }, (res) => {
        // Handle redirects
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          const redirectUrl = res.headers.location.startsWith('http')
            ? res.headers.location
            : `https://wiki.pokexgames.com${res.headers.location}`;
          console.log(`  → Redirect to ${redirectUrl}`);
          attempt(n); // follow redirect
          return;
        }
        
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve(data));
        res.on('error', reject);
      }).on('error', (err) => {
        if (n > 0) {
          setTimeout(() => attempt(n - 1), 2000);
        } else {
          reject(err);
        }
      });
    };
    attempt(retries);
  });
}

// =============================================
// MediaWiki API: get raw wikitext
// =============================================
async function getWikitext(title) {
  const encodedTitle = encodeURIComponent(title);
  const url = `https://wiki.pokexgames.com/api.php?action=parse&page=${encodedTitle}&prop=wikitext&formatversion=2&format=json`;
  const raw = await fetchUrl(url);
  try {
    const json = JSON.parse(raw);
    if (json.parse && json.parse.wikitext) {
      return json.parse.wikitext;
    }
    return null;
  } catch {
    return null;
  }
}

// =============================================
// MediaWiki API: get all pages in a category
// =============================================
async function getAllPokemonPages() {
  // First get all page links from the Pokémon index page
  const url = `https://wiki.pokexgames.com/api.php?action=parse&page=Pok%C3%A9mon&prop=links&limit=500&formatversion=2&format=json`;
  const raw = await fetchUrl(url);
  try {
    const json = JSON.parse(raw);
    if (json.parse && json.parse.links) {
      return json.parse.links
        .filter(l => l.ns === 0) // main namespace only
        .map(l => l.title)
        .filter(name => 
          name &&
          !name.includes('(TM)') && !name.includes('(TR)') &&
          !name.startsWith('Technical') && !name.startsWith('Tier') &&
          !name.startsWith('Clã') && !name.startsWith('Level') &&
          !name.includes('Shiny') && !name.includes('Mega') &&
          !name.includes('Alolan') && !name.includes('Galarian') && 
          !name.includes('Hisuian') && !name.includes('listagem')
        );
    }
  } catch (e) {
    console.error('Error fetching page list:', e.message);
  }
  return [];
}

// =============================================
// Parse moves from wikitext
// =============================================
function parseWikitextMoves(wikitext) {
  const moves = [];
  
  // Find PvP and PvE sections
  const pvpMatch = wikitext.match(/Movimentos\s*PVP[\s\S]*?\{\|([\s\S]*?)\|\}/i);
  const pveMatch = wikitext.match(/Movimentos\s*PVE[\s\S]*?\{\|([\s\S]*?)\|\}/i);
  const singleMovesMatch = wikitext.match(/==\s*'''Movimentos'''\s*==[\s\S]*?\{\|([\s\S]*?)\|\}/i);
  
  function parseSection(sectionText, isPvE) {
    if (!sectionText) return;
    
    // Split by |- to get rows
    const rawRows = sectionText.split(/\|-/);
    for (let i = 1; i < rawRows.length; i += 2) {
      const row1 = rawRows[i] || '';
      const row2 = rawRows[i + 1] || '';
      
      if (!row1.trim()) continue;
      
      // Slot
      const slotMatch = row1.match(/!\s*(?:rowspan="2"\s*)?\|\s*([A-Z0-9]+)\s*(?:\n|\|)/i);
      if (!slotMatch) continue;
      const slot = slotMatch[1].trim();
      
      // Name & Cooldown
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
      
      // Icons
      const iconsMatch = row1.match(/\|\s*(?:rowspan="2"\s*align="right"|align="right"\s*rowspan="2")\s*\|([\s\S]*?)(?=\n\||$)/i);
      const icons = [];
      if (iconsMatch) {
        const iconRegex = /\[\[(?:Arquivo|File):([A-Za-z0-9_\-]+)\.(?:png|gif)/gi;
        let im;
        while ((im = iconRegex.exec(iconsMatch[1])) !== null) {
          let iconName = im[1].trim();
          if (iconName.toLowerCase() === 'poison' || iconName.toLowerCase() === 'poison_icon') {
            iconName = 'Poison1';
          }
          icons.push(iconName);
        }
      }
      
      // Element & Clan
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
      
      // Level
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
  
  parseSection(pvpMatch ? pvpMatch[0] : null, false);
  parseSection(pveMatch ? pveMatch[0] : null, true);
  parseSection(singleMovesMatch && !pvpMatch ? singleMovesMatch[0] : null, false);
  
  // Merge PvP and PvE into a single move list
  const merged = new Map();
  for (const move of moves) {
    const key = `${move.slot}-${move.name}`;
    if (!merged.has(key)) {
      merged.set(key, {
        slot: move.slot,
        name: move.name,
        cooldownPvP: move.isPvE ? '' : move.cooldown,
        cooldownPvE: move.isPvE ? move.cooldown : move.cooldown,
        level: move.level,
        icons: move.icons,
        element: move.element,
        clan: move.clan,
        isDifferentPvE: move.isDifferentPvE
      });
    } else {
      const existing = merged.get(key);
      if (move.isPvE) {
        existing.cooldownPvE = move.cooldown;
        if (move.isDifferentPvE) existing.isDifferentPvE = true;
      } else {
        existing.cooldownPvP = move.cooldown;
      }
    }
  }
  
  return Array.from(merged.values());
}

// =============================================
// Parse general info from wikitext
// =============================================
function parseGeneralInfo(wikitext) {
  const info = {};
  
  const nameMatch = wikitext.match(/'''Nome:'''\s*(.*?)(?:<br|==|\n)/i);
  if (nameMatch) info.name = nameMatch[1].replace(/<[^>]+>/g, '').replace(/'''/g,'').trim();
  
  const levelMatch = wikitext.match(/'''Level:'''\s*(.*?)(?:<br|==|\n)/i);
  if (levelMatch) info.level = levelMatch[1].replace(/<[^>]+>/g, '').trim();
  
  const elementMatch = wikitext.match(/'''Elemento:'''\s*(.*?)(?:<br|==|\n)/i);
  if (elementMatch) info.element = elementMatch[1].replace(/<[^>]+>/g, '').trim();
  
  const abilitiesMatch = wikitext.match(/'''Habilidades:'''\s*(.*?)(?:<br|==|\n)/i);
  if (abilitiesMatch) info.abilities = abilitiesMatch[1].replace(/<[^>]+>/g, '').trim();
  
  const boostMatch = wikitext.match(/'''Boost:'''\s*(.*?)(?:<br|==|\n)/i);
  if (boostMatch) info.boost = boostMatch[1].replace(/<[^>]+>/g, '').trim();
  
  const materiaMatch = wikitext.match(/'''Materia:'''\s*(.*?)(?:<br|==|\n)/i);
  if (materiaMatch) info.materia = materiaMatch[1].replace(/<[^>]+>/g, '').trim();
  
  // Extract dex number from file reference
  const dexMatch = wikitext.match(/\[\[(?:file|arquivo):(\d{3})\s*-\s*/i);
  if (dexMatch) info.number = dexMatch[1];
  
  return info;
}

// =============================================
// MAIN SCRAPER
// =============================================
async function main() {
  console.log('🔍 Fetching Pokémon page list via MediaWiki API...');
  const pokemonNames = await getAllPokemonPages();
  console.log(`📋 Found ${pokemonNames.length} Pokémon pages`);
  
  if (pokemonNames.length === 0) {
    console.log('⚠️ No pages found. Trying alternative method...');
    // Fallback: use a known list from Gen 1-2
    pokemonNames.push(...KNOWN_POKEMON);
  }
  
  const dataDir = path.join(__dirname, '..', 'src', 'pokedex', 'data');
  fs.mkdirSync(dataDir, { recursive: true });
  const outputPath = path.join(dataDir, 'pokemon-moves.json');
  
  // Load existing data if available to resume
  let allPokemon = [];
  if (fs.existsSync(outputPath)) {
    try {
      const existing = fs.readFileSync(outputPath, 'utf8');
      allPokemon = JSON.parse(existing);
      if (!Array.isArray(allPokemon)) allPokemon = [];
      console.log(`Loaded ${allPokemon.length} existing Pokémon from cache.`);
    } catch {
      allPokemon = [];
    }
  }
  
  const existingSlugs = new Set(allPokemon.map(p => p.slug));
  const errors = [];
  const noMoves = [];
  const DELAY_MS = 600;
  
  for (let i = 0; i < pokemonNames.length; i++) {
    const name = pokemonNames[i];
    
    if (existingSlugs.has(name)) {
      continue;
    }
    
    process.stdout.write(`[${i+1}/${pokemonNames.length}] ${name}...`);
    
    try {
      const wikitext = await getWikitext(name);
      
      if (!wikitext) {
        console.log(` ⚠️ No wikitext (redirect or missing)`);
        noMoves.push(name);
        continue;
      }
      
      if (!wikitext.includes('Movimentos') && !wikitext.includes('Golpes')) {
        console.log(` ⏭  No moves section`);
        noMoves.push(name);
        continue;
      }
      
      const generalInfo = parseGeneralInfo(wikitext);
      const moves = parseWikitextMoves(wikitext);
      
      console.log(` ✅ ${moves.length} moves`);
      
      allPokemon.push({
        name: name,
        moves: moves.map(m => {
          delete m.level;
          return m;
        })
      });
      
      // Save progress incrementally
      fs.writeFileSync(outputPath, JSON.stringify(allPokemon, null, 2), 'utf8');
      
    } catch (err) {
      console.log(` ❌ ${err.message}`);
      errors.push({ name, error: err.message });
    }
    
    // Rate limit
    await new Promise(r => setTimeout(r, DELAY_MS));
  }
  
  console.log(`\n✨ Done! Total ${allPokemon.length} Pokémon in dataset.`);
  console.log(`⏭  ${noMoves.length} skipped this run`);
  console.log(`❌ ${errors.length} errors this run`);
  
  if (errors.length > 0) {
    const errPath = path.join(__dirname, 'scraper-errors.json');
    fs.writeFileSync(errPath, JSON.stringify(errors, null, 2), 'utf8');
    console.log(`📝 Errors logged: ${errPath}`);
  }
}

// Fallback list of Gen 1 Pokémon in case the API doesn't return the full list
const KNOWN_POKEMON = [
  'Bulbasaur','Ivysaur','Venusaur','Charmander','Charmeleon','Charizard',
  'Squirtle','Wartortle','Blastoise','Caterpie','Metapod','Butterfree',
  'Weedle','Kakuna','Beedrill','Pidgey','Pidgeotto','Pidgeot',
  'Rattata','Raticate','Spearow','Fearow','Ekans','Arbok',
  'Pikachu','Raichu','Sandshrew','Sandslash','Nidoranfe','Nidorina',
  'Nidoqueen','Nidoranma','Nidorino','Nidoking','Clefairy','Clefable',
  'Vulpix','Ninetales','Jigglypuff','Wigglytuff','Zubat','Golbat',
  'Oddish','Gloom','Vileplume','Paras','Parasect','Venonat','Venomoth',
  'Diglett','Dugtrio','Meowth','Persian','Psyduck','Golduck',
  'Mankey','Primeape','Growlithe','Arcanine','Poliwag','Poliwhirl',
  'Poliwrath','Abra','Kadabra','Alakazam','Machop','Machoke','Machamp',
  'Bellsprout','Weepinbell','Victreebel','Tentacool','Tentacruel',
  'Geodude','Graveler','Golem','Ponyta','Rapidash','Slowpoke','Slowbro',
  'Magnemite','Magneton','Farfetch\'D','Doduo','Dodrio','Seel','Dewgong',
  'Grimer','Muk','Shellder','Cloyster','Gastly','Haunter','Gengar',
  'Onix','Drowzee','Hypno','Krabby','Kingler','Voltorb','Electrode',
  'Exeggcute','Exeggutor','Cubone','Marowak','Hitmonlee','Hitmonchan',
  'Lickitung','Koffing','Weezing','Rhyhorn','Rhydon','Chansey',
  'Tangela','Kangaskhan','Horsea','Seadra','Goldeen','Seaking',
  'Staryu','Starmie','Mr.Mime','Scyther','Jynx','Electabuzz','Magmar',
  'Pinsir','Tauros','Magikarp','Gyarados','Lapras','Ditto',
  'Eevee','Vaporeon','Jolteon','Flareon','Porygon','Omanyte','Omastar',
  'Kabuto','Kabutops','Aerodactyl','Snorlax','Articuno','Zapdos','Moltres',
  'Dratini','Dragonair','Dragonite','Mewtwo','Mew'
];

main().catch(console.error);
