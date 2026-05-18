import Fuse from 'fuse.js';
import { normalizeName, buildNormalizedIndex } from './pokemon-normalizer';
import defaultPokemonData from './pokemon.json';

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

// Estado mutável, começa vazio
export let pokemonIndex: PokemonIndex = {};

// Fuse.js para busca difusa (aproximada)
export let fuse = new Fuse<any>([], {
  keys: ['name', 'key', 'aliases'],
  threshold: 0.4,
  includeScore: true,
});

export let isPokemonIndexLoaded = false;
export let normalizedIndex = new Map<string, string>();

/**
 * Atualiza os índices de busca internos após alterar o pokemonIndex.
 */
function rebuildIndexes() {
  normalizedIndex = buildNormalizedIndex(pokemonIndex);
  
  const fuseList = Object.entries(pokemonIndex).map(([key, entry]) => ({
    key,
    name: entry.name,
    dex: entry.dex ?? 9999,
    aliases: entry.aliases ?? [],
  }));

  // Injeta elementos e clãs como entradas pesquisáveis
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
 * Inicializa o índice de Pokémon buscando diretamente da API da WikiPokexGames.
 * Usa cache no localStorage e compara IDs de revisão para evitar downloads redundantes.
 */
export async function initializePokemonIndex() {
  if (isPokemonIndexLoaded) return;

  try {
    // 1. Tenta carregar do cache primeiro ou recorre ao pokemon.json embutido para uma UI instantânea
    let currentLastRevId = 0;
    const cached = localStorage.getItem('wikipxg_pokemon_cache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed && typeof parsed === 'object' && 'lastrevid' in parsed && 'index' in parsed) {
          pokemonIndex = parsed.index;
          currentLastRevId = parsed.lastrevid;
        } else {
          // Formato de cache antigo (legado)
          pokemonIndex = parsed;
          currentLastRevId = 0;
        }
      } catch (e) {
        console.warn('[PokemonService] Falha ao analisar o índice de Pokémon em cache, recorrendo ao JSON embutido', e);
        pokemonIndex = (defaultPokemonData as any).index;
        currentLastRevId = (defaultPokemonData as any).lastrevid;
      }
    } else {
      pokemonIndex = (defaultPokemonData as any).index;
      currentLastRevId = (defaultPokemonData as any).lastrevid;
    }

    rebuildIndexes();
    isPokemonIndexLoaded = true;

    // 2. Busca o ID da última revisão assincronamente a partir da API da wiki (checagem leve)
    const revApiUrl = 'https://wiki.pokexgames.com/api.php?action=query&prop=revisions&titles=Pok%C3%A9mon&rvprop=ids&format=json&origin=*';
    const revResponse = await fetch(revApiUrl);
    const revData = await revResponse.json();

    const pages = revData.query.pages;
    const page = pages[Object.keys(pages)[0]];
    const latestRevId = page.revisions?.[0]?.revid;

    if (latestRevId && latestRevId === currentLastRevId) {
      console.log(`[PokemonService] O índice de Pokémon está atualizado (Revisão: ${latestRevId}).`);
      return;
    }

    console.log(`[PokemonService] Nova revisão encontrada: ${latestRevId} (Atual: ${currentLastRevId}). Buscando atualizações...`);

    // 3. Busca dados novos na API da wiki assincronamente, já que a revisão mudou
    const apiUrl = 'https://wiki.pokexgames.com/api.php?action=query&prop=revisions&rvprop=content&rvslots=main&titles=Pok%C3%A9mon&format=json&origin=*';
    const response = await fetch(apiUrl);
    const data = await response.json();
    
    const fullPages = data.query.pages;
    const fullPage = fullPages[Object.keys(fullPages)[0]];
    const text = fullPage.revisions[0].slots.main['*'];

    const newIndex: PokemonIndex = {};
    
    // Analisa padrões como: [[Arquivo:001-Bulbasaur.png|link=Bulbasaur]]
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

    // Analisa padrões sem link= mas seguidos por [[Nome]]
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

    // 4. Atualiza o índice ativo e o cache
    pokemonIndex = newIndex;
    rebuildIndexes();
    isPokemonIndexLoaded = true;
    localStorage.setItem('wikipxg_pokemon_cache', JSON.stringify({ lastrevid: latestRevId || currentLastRevId, index: newIndex }));

    console.log(`[PokemonService] Atualizado com sucesso para a revisão ${latestRevId}. Carregados ${Object.keys(newIndex).length} Pokémon.`);
  } catch (error) {
    console.error('[PokemonService] Falha ao carregar o índice de Pokémon da API da Wiki:', error);
  }
}

/**
 * Resolve a entrada de um comando barra como "ursaluna", "mr mime", "mrmime" para um PokemonEntry.
 */
export function resolvePokemon(input: string): PokemonEntry | null {
  const norm = normalizeName(input);

  // Primeiro tenta a correspondência direta normalizada
  const directKey = normalizedIndex.get(norm);
  if (directKey && pokemonIndex[directKey]) {
    return pokemonIndex[directKey];
  }

  // Busca difusa (aproximada) como alternativa secundária
  const results = fuse.search(input);
  if (results.length > 0) {
    const bestKey = results[0].item.key;
    return pokemonIndex[bestKey] ?? null;
  }

  return null;
}

/**
 * Pesquisa pokémon por nome parcial - retorna os N melhores resultados.
 */
export function searchPokemon(query: string, limit = 10): Array<{ key: string; entry: PokemonEntry }> {
  if (!query.trim()) {
    // Retorna as primeiras entradas (até o limite) ordenadas pela dex
    return Object.entries(pokemonIndex)
      .sort(([, a], [, b]) => (a.dex ?? 9999) - (b.dex ?? 9999))
      .slice(0, limit)
      .map(([key, entry]) => ({ key, entry }));
  }

  const results = fuse.search(query, { limit });
  return results.map(r => ({ key: r.item.key, entry: pokemonIndex[r.item.key] }));
}

/**
 * Constrói a sintaxe WikiText a partir de um PokemonEntry.
 */
export function buildPokemonWikiText(entry: PokemonEntry): string {
  return `[[Arquivo:${entry.image}|link=${entry.wikilink}]] '''[[${entry.wikilink}]]'''`;
}

/**
 * Obtém a URL do sprite de um pokémon usando o redirecionador nativo Special:FilePath da Wiki.
 * Isso garante a imagem exata (Shiny, Mega, Alolan) sem a necessidade de hashes MD5.
 */
export function getPokemonSpriteUrl(entry: PokemonEntry): string {
  if (!entry.image) return '';
  return `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(entry.image)}`;
}
