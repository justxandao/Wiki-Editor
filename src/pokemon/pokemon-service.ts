import Fuse from 'fuse.js';
import { normalizeName, buildNormalizedIndex } from './pokemon-normalizer';

export interface PokemonEntry {
  dex?: number;
  name: string;
  image: string;
  wikilink: string;
  types: string[];
  aliases?: string[];
}

export const WIKI_ELEMENTS = [
  'Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying',
  'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'
];

export const WIKI_CLANS = [
  'Volcanic', 'Seavell', 'Orebound', 'Wingeon', 'Malefic', 'Gardestrike', 'Psycraft', 'Naturia', 'Raibolt', 'Ironhard'
];

export const WIKI_ICONS: Record<string, string> = {};
[...WIKI_ELEMENTS, ...WIKI_CLANS].forEach(name => {
  WIKI_ICONS[normalizeName(name)] = `${name}.png`;
});

export type PokemonIndex = Record<string, PokemonEntry>;

// Mutable state, starts empty
export let pokemonIndex: PokemonIndex = {};

// Fuse.js for fuzzy search
export let fuse = new Fuse<any>([], {
  keys: ['name', 'key', 'aliases'],
  threshold: 0.4,
  includeScore: true,
});

export let isPokemonIndexLoaded = false;
export let normalizedIndex = new Map<string, string>();

/**
 * Update the internal search indexes after changing the pokemonIndex.
 */
function rebuildIndexes() {
  normalizedIndex = buildNormalizedIndex(pokemonIndex);
  
  const fuseList = Object.entries(pokemonIndex).map(([key, entry]) => ({
    key,
    name: entry.name,
    dex: entry.dex ?? 9999,
    aliases: entry.aliases ?? [],
  }));

  // Inject elements and clans as searchable entries
  [...WIKI_ELEMENTS, ...WIKI_CLANS].forEach(name => {
    const key = normalizeName(name);
    if (!pokemonIndex[key]) {
      pokemonIndex[key] = {
        name,
        image: `${name}.png`,
        wikilink: name,
        types: []
      };
    }
    fuseList.push({ key, name, dex: 9999, aliases: [] });
  });
  
  fuse.setCollection(fuseList);
}

/**
 * Initializes the Pokemon index by fetching directly from the WikiPokexGames API.
 * Uses localStorage caching to ensure fast consecutive loads.
 */
export async function initializePokemonIndex() {
  if (isPokemonIndexLoaded) return;

  try {
    // 1. Try loading from cache first for instantaneous UI
    const cached = localStorage.getItem('wikipxg_pokemon_cache');
    if (cached) {
      pokemonIndex = JSON.parse(cached);
      rebuildIndexes();
      isPokemonIndexLoaded = true;
    }

    // 2. Fetch fresh data from the wiki API asynchronously
    const apiUrl = 'https://wiki.pokexgames.com/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&titles=Pok%C3%A9mon&format=json&origin=*';
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    const pages = data.query.pages;
    const page = pages[Object.keys(pages)[0]];
    const text = page.revisions[0].slots.main['*'];

    const newIndex: PokemonIndex = {};
    
    // Parses patterns like: [[Arquivo:001-Bulbasaur.png|link=Bulbasaur]]
    const linkRegex = /\[\[(?:Arquivo|File):([^|\]]+\.(?:png|gif))[^\]]*?link=([^\]|]+)\]\]/gi;
    let match;
    
    while ((match = linkRegex.exec(text)) !== null) {
      const image = match[1].trim();
      let name = match[2].trim();
      
      if (name.toLowerCase() === 'pokémon' || !name) continue;

      let dex: number | undefined;
      const dexMatch = image.match(/^(\d+)/);
      if (dexMatch) dex = parseInt(dexMatch[1], 10);

      const id = normalizeName(name);
      if (!newIndex[id]) {
        const aliases: string[] = [];
        if (name.includes('(Mega)')) aliases.push(`Mega ${name.replace(' (Mega)', '')}`);
        if (name.includes('(Alola)')) aliases.push(`Alolan ${name.replace(' (Alola)', '')}`);
        newIndex[id] = { dex, name, image, wikilink: name, types: [], aliases };
      }
    }

    // Parses patterns without link= but followed by [[Name]]
    const noLinkRegex = /\[\[(?:Arquivo|File):([^|\]]+\.(?:png|gif))\]\]\s*\|\s*(?:#\d+|###)?\s*\|\s*(?:'''?)?\[\[([^\]|]+)\]\]/gi;
    let match2;
    while ((match2 = noLinkRegex.exec(text)) !== null) {
      const image = match2[1].trim();
      let name = match2[2].trim();
      
      if (name.toLowerCase() === 'pokémon' || !name) continue;

      let dex: number | undefined;
      const dexMatch = image.match(/^(\d+)/);
      if (dexMatch) dex = parseInt(dexMatch[1], 10);

      const id = normalizeName(name);
      if (!newIndex[id]) {
        const aliases: string[] = [];
        if (name.includes('(Mega)')) aliases.push(`Mega ${name.replace(' (Mega)', '')}`);
        if (name.includes('(Alola)')) aliases.push(`Alolan ${name.replace(' (Alola)', '')}`);
        newIndex[id] = { dex, name, image, wikilink: name, types: [], aliases };
      }
    }

    // 3. Update active index and cache
    pokemonIndex = newIndex;
    rebuildIndexes();
    isPokemonIndexLoaded = true;
    localStorage.setItem('wikipxg_pokemon_cache', JSON.stringify(newIndex));

    console.log(`Loaded ${Object.keys(newIndex).length} Pokémon from Wiki API.`);
  } catch (error) {
    console.error('Failed to load Pokémon index from Wiki API:', error);
  }
}

/**
 * Resolve a slash command input like "ursaluna", "mr mime", "mrmime" to a PokemonEntry.
 */
export function resolvePokemon(input: string): PokemonEntry | null {
  const norm = normalizeName(input);

  // Direct normalized match first
  const directKey = normalizedIndex.get(norm);
  if (directKey && pokemonIndex[directKey]) {
    return pokemonIndex[directKey];
  }

  // Fuzzy search fallback
  const results = fuse.search(input);
  if (results.length > 0) {
    const bestKey = results[0].item.key;
    return pokemonIndex[bestKey] ?? null;
  }

  return null;
}

/**
 * Search pokémon by partial name - returns top N results.
 */
export function searchPokemon(query: string, limit = 10): Array<{ key: string; entry: PokemonEntry }> {
  if (!query.trim()) {
    // Return first `limit` entries sorted by dex
    return Object.entries(pokemonIndex)
      .sort(([, a], [, b]) => (a.dex ?? 9999) - (b.dex ?? 9999))
      .slice(0, limit)
      .map(([key, entry]) => ({ key, entry }));
  }

  const results = fuse.search(query, { limit });
  return results.map(r => ({ key: r.item.key, entry: pokemonIndex[r.item.key] }));
}

/**
 * Build WikiText syntax from a PokemonEntry.
 */
export function buildPokemonWikiText(entry: PokemonEntry): string {
  return `[[Arquivo:${entry.image}|link=${entry.wikilink}]] '''[[${entry.wikilink}]]'''`;
}

/**
 * Get sprite URL for a pokemon using the Wiki's native Special:FilePath redirector.
 * This guarantees we get the exact image (Shiny, Mega, Alolan) without needing MD5 hashes.
 */
export function getPokemonSpriteUrl(entry: PokemonEntry): string {
  if (!entry.image) return '';
  return `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(entry.image)}`;
}
