/**
 * Normalizes a string for Pokémon name matching.
 * Strips accents, punctuation, spaces, hyphens — all ASCII-safe.
 */
export function normalizeName(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip accents
    .replace(/[^a-z0-9]/g, '');      // strip non-alphanumeric
}

/**
 * Builds a key lookup map from the pokemon index.
 * Each entry is indexed by its normalized key plus any aliases.
 */
export function buildNormalizedIndex<T extends { aliases?: string[] }>(
  index: Record<string, T>
): Map<string, string> {
  const map = new Map<string, string>();
  for (const [key, entry] of Object.entries(index)) {
    const norm = normalizeName(key);
    map.set(norm, key);
    if (entry.aliases) {
      for (const alias of entry.aliases) {
        map.set(normalizeName(alias), key);
      }
    }
    // Also index by name
    if ('name' in entry) {
      map.set(normalizeName((entry as unknown as { name: string }).name), key);
    }
  }
  return map;
}
