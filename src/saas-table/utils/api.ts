const POKEAPI_TYPE_MAP: Record<string, string> = {
  normal: 'Normal', fire: 'Fire', water: 'Water', grass: 'Grass', electric: 'Electric',
  ice: 'Ice', fighting: 'Fighting', poison: 'Poison', ground: 'Ground', flying: 'Flying',
  psychic: 'Psychic', bug: 'Bug', rock: 'Rock', ghost: 'Ghost', dragon: 'Dragon',
  dark: 'Dark', steel: 'Steel', fairy: 'Fairy'
};

const VALID_ELEMENTS = ['Bug', 'Dark', 'Dragon', 'Electric', 'Fairy', 'Fighting', 'Fire', 'Flying', 'Ghost', 'Grass', 'Ground', 'Ice', 'Normal', 'Poison', 'Psychic', 'Rock', 'Steel', 'Water'];

export async function fetchPokemonTypes(name: string): Promise<string[]> {
  try {
    // 1. Try fetching directly from the PokeXGames Wiki to get accurate custom elements (like Pure Steel Shiny Mawile)
    const url = `https://wiki.pokexgames.com/api.php?action=query&prop=revisions&titles=${encodeURIComponent(name)}&rvprop=content&rvslots=main&format=json&origin=*`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query?.pages;
    
    if (pages) {
      const pageId = Object.keys(pages)[0];
      if (pageId !== '-1') {
        const text = pages[pageId].revisions?.[0]?.slots?.main?.['*'];
        if (text) {
          const match = text.match(/'''Elementos?:'''(.*?)(?:<br|\n)/i);
          if (match && match[1]) {
            const typesString = match[1];
            const foundTypes: string[] = [];
            VALID_ELEMENTS.forEach(el => {
              const regex = new RegExp(`\\b${el}\\b`, 'i');
              if (regex.test(typesString)) foundTypes.push(el);
            });
            if (foundTypes.length > 0) return foundTypes;
          }
        }
      }
    }
  } catch (e) {
    console.error("Wiki fetch failed, falling back to PokeAPI", e);
  }

  // 2. Fallback to PokeAPI (with Shiny and Mega prefixes stripped)
  return fetchPokeApiTypes(name);
}

export async function fetchPokeApiTypes(name: string): Promise<string[]> {
  try {
    let apiName = name.toLowerCase()
      .replace(/^shiny\s+/i, '')
      .replace(/^mega\s+(.*)/i, '$1-mega') // Try official mega first
      .replace(/\s*\(mega\)\s*/i, '-mega')
      .replace(/\s*\(alola\)\s*/i, '-alola')
      .replace(/[^a-z0-9-]/g, '');
      
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${apiName}`);
    if (!res.ok) {
      if (apiName.includes('-')) {
        const baseName = apiName.split('-')[0];
        const resBase = await fetch(`https://pokeapi.co/api/v2/pokemon/${baseName}`);
        if (resBase.ok) {
          const data = await resBase.json();
          return data.types.map((t: any) => POKEAPI_TYPE_MAP[t.type.name] || t.type.name);
        }
      }
      
      if (name.toLowerCase().startsWith('mega ')) {
        const pureBase = name.toLowerCase().replace(/^mega\s+/i, '').replace(/[^a-z0-9-]/g, '');
        const resPure = await fetch(`https://pokeapi.co/api/v2/pokemon/${pureBase}`);
        if (resPure.ok) {
          const data = await resPure.json();
          return data.types.map((t: any) => POKEAPI_TYPE_MAP[t.type.name] || t.type.name);
        }
      }
      return [];
    }
    const data = await res.json();
    return data.types.map((t: any) => POKEAPI_TYPE_MAP[t.type.name] || t.type.name);
  } catch {
    return [];
  }
}
