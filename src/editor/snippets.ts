/**
 * snippets.ts
 *
 * Single source of truth for toolbar/library WikiText snippets.
 * Previously duplicated between TopBar.tsx and LibraryPanel.tsx.
 */
import React from 'react';
import { Bold, Italic } from 'lucide-react';

export interface Snippet {
  id: string;
  label: string;
  icon: React.ReactNode;
  code: string;
}

export const LIBRARY_SNIPPETS: Snippet[] = [
  { id: 'wikitable', label: 'Tabela', icon: '📊', code: '{| class="wikitable"\n! Col 1\n! Col 2\n|-\n| Dado\n| Dado\n|}' },
  { id: 'h2', label: 'H2', icon: '#️⃣', code: '== Título ==\n' },
  { id: 'h3', label: 'H3', icon: '##', code: '=== Sub-título ===\n' },
  { id: 'bold', label: 'Negrito', icon: React.createElement(Bold, { size: 13 }), code: "'''texto'''" },
  { id: 'italic', label: 'Itálico', icon: React.createElement(Italic, { size: 13 }), code: "''texto''" },
  { id: 'link', label: 'Link', icon: '🔗', code: '[[Página|Texto]]' },
  { id: 'ref', label: 'Ref', icon: '📌', code: '<ref>Fonte aqui</ref>' },
];
