import Fuse from 'fuse.js';
import { normalizeName } from './pokemon-normalizer';
import berriesData from './berries.json';

export interface BerryEntry {
  name: string;
  image: string;
  wikilink: string;
  category: string;
  description: string;
}

// Fuse.js for fuzzy search on Berries
export const fuseBerries = new Fuse<BerryEntry>(berriesData, {
  keys: ['name', 'description', 'category'],
  threshold: 0.4,
});

/**
 * Searches for berries based on a query using fuzzy matching.
 */
export function searchBerries(query: string, limit = 10): BerryEntry[] {
  if (!query.trim()) {
    return berriesData.slice(0, limit);
  }
  const results = fuseBerries.search(query, { limit });
  return results.map(r => r.item);
}

/**
 * Builds the WikiText representation for a Berry.
 */
export function buildBerryWikiText(entry: BerryEntry): string {
  return `[[Arquivo:${entry.image}|link=${entry.wikilink}]] '''[[${entry.wikilink}]]'''`;
}

/**
 * Resolves the sprite URL for a berry using Wiki's FilePath.
 */
export function getBerrySpriteUrl(entry: BerryEntry): string {
  if (!entry.image) return '';
  return `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(entry.image)}`;
}

/**
 * Directly looks up a berry by its normalized name.
 */
export function resolveBerry(input: string): BerryEntry | null {
  const normInput = normalizeName(input);
  // Match direct normalized name
  const directMatch = berriesData.find(b => normalizeName(b.name) === normInput || normalizeName(b.name.replace(' Berry', '')) === normInput);
  if (directMatch) return directMatch;

  // Fuzzy fallback
  const results = fuseBerries.search(input, { limit: 1 });
  if (results.length > 0) {
    return results[0].item;
  }
  return null;
}
