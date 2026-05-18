import { EditorView, WidgetType, Decoration, DecorationSet, ViewPlugin, ViewUpdate } from '@codemirror/view';
import { RangeSetBuilder } from '@codemirror/state';
import { pokemonIndex, getPokemonSpriteUrl, WIKI_ICONS, normalizedIndex } from '../../pokemon/pokemon-service';
import { normalizeName } from '../../pokemon/pokemon-normalizer';

// =============================================
// Pokemon Inline Widget
// =============================================

class PokemonWidget extends WidgetType {
  constructor(
    private name: string,
    private spriteUrl: string,
    private dex: number
  ) {
    super();
  }

  toDOM() {
    const span = document.createElement('span');
    span.className = 'cm-pokemon-widget';
    span.title = `#${String(this.dex).padStart(3, '0')} ${this.name}`;

    const img = document.createElement('img');
    img.src = this.spriteUrl;
    img.alt = this.name;
    img.width = 20;
    img.height = 20;

    const text = document.createElement('span');
    text.textContent = this.name;

    span.appendChild(img);
    span.appendChild(text);
    return span;
  }

  ignoreEvent() { return false; }

  eq(other: PokemonWidget) {
    return other.name === this.name;
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const doc = view.state.doc;
  const { from, to } = view.viewport;

  // Only decorate visible range for performance
  const startLine = doc.lineAt(from).number;
  const endLine = doc.lineAt(to).number;

  // Build map dynamically since pokemonIndex loads asynchronously
  const imageToEntry = new Map(
    Object.values(pokemonIndex).map(entry => [entry.image, entry])
  );

  for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
    const line = doc.line(lineNum);
    const text = line.text;

    const fileRegex = /\[\[(?:Arquivo|File):([^|\]]+\.(?:png|gif))[^\]]*\]\]/gi;
    const linkRegex = /\[\[([^\]|:]+)(?:\|[^\]]+)?\]\]/gi;
    
    const lineDecorations: Array<{from: number, to: number, deco: Decoration}> = [];

    let match: RegExpExecArray | null;

    // 1. Process File inclusions
    while ((match = fileRegex.exec(text)) !== null) {
      const filename = match[1].trim();
      const entry = imageToEntry.get(filename);
      
      const name = entry ? entry.name : filename.replace(/\.[^/.]+$/, '');
      const dex = entry ? (entry.dex ?? 0) : 0;
      
      const encoded = encodeURIComponent(filename.replace(/ /g, '_'));
      const spriteUrl = `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encoded}`;

      lineDecorations.push({
        from: line.from + match.index,
        to: line.from + match.index + match[0].length,
        deco: Decoration.replace({
          widget: new PokemonWidget(name, spriteUrl, dex),
        })
      });
    }

    // 2. Process Internal Links (Pokemon, Elements, Clans)
    while ((match = linkRegex.exec(text)) !== null) {
      const target = match[1].trim();
      
      const normTargetRaw = normalizeName(target);
      const normTarget = normalizedIndex.get(normTargetRaw) || normTargetRaw;
      const pokemon = pokemonIndex[normTarget];
      const iconFile = WIKI_ICONS[normTargetRaw];

      if (pokemon || iconFile) {
        const imageUrl = pokemon 
          ? `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(pokemon.image)}`
          : `https://wiki.pokexgames.com/index.php?title=Special:FilePath/${encodeURIComponent(iconFile)}`;
        
        const dex = pokemon ? (pokemon.dex ?? 0) : 0;
        const name = pokemon ? pokemon.name : target;

        lineDecorations.push({
          from: line.from + match.index,
          to: line.from + match.index,
          deco: Decoration.widget({
            widget: new PokemonWidget(name, imageUrl, dex),
            side: -1
          })
        });
      }
    }

    // Sort to satisfy RangeSetBuilder ascending order rule
    lineDecorations.sort((a, b) => a.from - b.from);
    for (const d of lineDecorations) {
      builder.add(d.from, d.to, d.deco);
    }
  }

  return builder.finish();
}

export const pokemonDecorations = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: v => v.decorations }
);
