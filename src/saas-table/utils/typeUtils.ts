import { TYPE_CHART, ALL_ATTACK_TYPES } from '../../pokedex/builder/utils/constants';
import { resolveWikiImageUrl } from '../../pokedex/builder/utils/helpers';

export interface TypeWeakness {
  type: string;
  multiplier: number;
}

/**
 * Returns the types that are super-effective (≥2×) against the given defender types.
 */
export function getWeaknesses(defenderTypes: string[]): string[] {
  const weaknesses: string[] = [];

  for (const atk of ALL_ATTACK_TYPES) {
    let combined = 1;
    for (const def of defenderTypes) {
      const m = TYPE_CHART[atk]?.[def] ?? 1;
      combined *= m;
    }
    if (combined >= 2) {
      weaknesses.push(atk);
    }
  }

  return weaknesses;
}

/**
 * Returns WikiText image links for a list of type names.
 */
export function typesToWikiIcons(types: string[]): string {
  return types
    .map((t) => {
      // map type names to the file format used in the wiki
      const fileMap: Record<string, string> = {
        Normal: 'Normal1.png',
        Poison: 'Poison1.png',
        Ghost: 'Ghost1.png',
        Dark: 'Dark1.png',
      };
      const file = fileMap[t] ?? `${t}.png`;
      return `[[Arquivo:${file}|link=]]`;
    })
    .join(' ');
}

/**
 * Returns the Wiki sprite URL for a Pokémon image file.
 */
export function pokemonSpriteUrl(imageFile: string): string {
  return resolveWikiImageUrl(imageFile);
}
