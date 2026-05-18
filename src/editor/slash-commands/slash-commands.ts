import { EditorState, Transaction } from '@codemirror/state';
import { EditorView, KeyBinding } from '@codemirror/view';
import { resolvePokemon, buildPokemonWikiText } from '../../pokemon/pokemon-service';

// =============================================
// Slash Command Definitions
// =============================================

export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: string;
  category: 'pokemon' | 'template' | 'structure' | 'format';
  keywords: string[];
  execute: (view: EditorView, query: string) => boolean;
}

// Snippets for structure commands
const SNIPPETS: Record<string, string> = {
  table: `{| class="wikitable"
! Pokémon
! Tipo
! Nível
|-
| [[Pikachu]]
| Elétrico
| 50
|}
`,
  sprite: `[[Arquivo:025_-_Pikachu.png|link=Pikachu]]`,
  link: `[[Nome da Página|Texto do Link]]`,
  heading2: `== Título da Seção ==\n`,
  heading3: `=== Sub-seção ===\n`,
  bold: `'''texto em negrito'''`,
  italic: `''texto em itálico''`,
  hr: `----\n`,
};

// Built-in non-pokemon commands
export const BUILTIN_COMMANDS: SlashCommand[] = [
  {
    id: 'table',
    label: 'Wikitable',
    description: 'Insere uma tabela wiki formatada',
    icon: '📊',
    category: 'structure',
    keywords: ['table', 'tabela', 'wikitable'],
    execute: (view) => insertSnippet(view, SNIPPETS.table),
  },
  {
    id: 'sprite',
    label: 'Sprite Link',
    description: 'Insere link de imagem wiki',
    icon: '🖼️',
    category: 'template',
    keywords: ['sprite', 'image', 'banner', 'imagem'],
    execute: (view) => insertSnippet(view, SNIPPETS.sprite),
  },
  {
    id: 'heading2',
    label: 'Título H2',
    description: 'Insere um título de seção',
    icon: '#️⃣',
    category: 'format',
    keywords: ['heading', 'título', 'h2', 'secao'],
    execute: (view) => insertSnippet(view, SNIPPETS.heading2),
  },
  {
    id: 'heading3',
    label: 'Sub-título H3',
    description: 'Insere um sub-título',
    icon: '##',
    category: 'format',
    keywords: ['heading', 'titulo', 'h3', 'subsecao'],
    execute: (view) => insertSnippet(view, SNIPPETS.heading3),
  },
  {
    id: 'bold',
    label: 'Negrito',
    description: "Envolve em '''texto'''",
    icon: 'B',
    category: 'format',
    keywords: ['bold', 'negrito'],
    execute: (view) => insertSnippet(view, SNIPPETS.bold),
  },
  {
    id: 'italic',
    label: 'Itálico',
    description: "Envolve em ''texto''",
    icon: 'I',
    category: 'format',
    keywords: ['italic', 'italico'],
    execute: (view) => insertSnippet(view, SNIPPETS.italic),
  },
  {
    id: 'link',
    label: 'Link Interno',
    description: 'Insere [[Link]] wiki',
    icon: '🔗',
    category: 'format',
    keywords: ['link', 'wikilink'],
    execute: (view) => insertSnippet(view, SNIPPETS.link),
  },
  {
    id: 'hr',
    label: 'Linha Horizontal',
    description: 'Insere separador ----',
    icon: '—',
    category: 'format',
    keywords: ['hr', 'linha', 'separador'],
    execute: (view) => insertSnippet(view, SNIPPETS.hr),
  },
];

function insertSnippet(view: EditorView, text: string): boolean {
  const { from, to } = view.state.selection.main;
  view.dispatch({
    changes: { from, to, insert: text },
    selection: { anchor: from + text.length },
  });
  view.focus();
  return true;
}

/**
 * Replaces a slash command range with the resolved WikiText.
 */
export function replaceSlashCommand(view: EditorView, from: number, to: number, wikitext: string): void {
  view.dispatch({
    changes: { from, to, insert: wikitext },
    selection: { anchor: from + wikitext.length },
  });
  view.focus();
}

/**
 * Detect if cursor is inside a slash command and return its range + query.
 */
export function detectSlashCommand(state: EditorState): { from: number; to: number; query: string } | null {
  const { from } = state.selection.main;
  const line = state.doc.lineAt(from);
  const lineText = line.text;
  const colInLine = from - line.from;

  // Find the last '/' before cursor on this line
  let slashPos = -1;
  let spaceCount = 0;
  for (let i = colInLine - 1; i >= 0; i--) {
    if (lineText[i] === ' ') spaceCount++;
    if (lineText[i] === '/') {
      slashPos = i;
      break;
    }
  }

  if (slashPos === -1) return null;

  const query = lineText.slice(slashPos + 1, colInLine);

  // If there are spaces, only allow it if it starts with a command that accepts arguments
  if (spaceCount > 0) {
    const qLower = query.toLowerCase();
    if (!qLower.startsWith('banner ')) {
      return null;
    }
  }

  // Query must be reasonable
  if (query.length > 60 || query.includes('\n')) return null;

  return {
    from: line.from + slashPos,
    to: from,
    query,
  };
}
