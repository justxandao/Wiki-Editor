import React, { useMemo } from 'react';
import { parseWikiText } from '../../parser';
import { renderAST } from '../../parser/renderer/renderer';
import { Eye, ExternalLink } from 'lucide-react';

interface LivePreviewProps {
  content: string;
}

export function LivePreview({ content }: LivePreviewProps) {
  // Pre-process raw Wikitext to ensure clean tokenization for standard elements
  const processedWikitext = useMemo(() => {
    return content
      // Remove double and triple single-quotes inside headings (since headings are bold anyway)
      .replace(/==\s*''?'?(.+?)''?'?\s*==/gi, '== $1 ==')
      .replace(/===\s*''?'?(.+?)''?'?\s*===/gi, '=== $1 ===')
      // Strip center tags so we don't render them as raw tags
      .replace(/<center>\s*([\s\S]*?)\s*<\/center>/gi, '$1')
      // Replace raw br and invalid br tags with simple newlines
      .replace(/<\/?br\s*\/?>/gi, '\n')
      // Replace escaped newlines
      .replace(/\\n/gi, '\n');
  }, [content]);

  const rendered = useMemo(() => {
    try {
      const ast = parseWikiText(processedWikitext);
      return renderAST(ast, { theme: 'light' });
    } catch (e) {
      return (
        <div className="text-red-500 font-mono text-xs p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
          ⚠️ Erro de compilação: {String(e)}
        </div>
      );
    }
  }, [processedWikitext]);

  return (
    <div className="flex flex-col h-full bg-white text-neutral-900 overflow-hidden select-text relative">
      {/* Visual top bar of the live preview panel */}
      <div className="sticky top-0 bg-neutral-50 border-b border-neutral-200/80 px-4 py-3 z-10 flex justify-between items-center shadow-sm">
        <span className="text-[10px] font-extrabold text-neutral-500 uppercase tracking-widest flex items-center gap-1.5 font-outfit">
          <Eye size={12} className="text-accent-primary" /> Live Preview
        </span>
        <a 
          href="https://wiki.pokexgames.com" 
          target="_blank" 
          rel="noreferrer"
          className="text-[10px] font-bold text-neutral-500 hover:text-accent-primary flex items-center gap-1 transition"
        >
          WikiPokexGames <ExternalLink size={10} />
        </a>
      </div>

      {/* Styled Render Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6 leading-relaxed text-sm wiki-render-styles">
        {/* Style injection for exact MediaWiki tables and styles */}
        <style>{`
          .wiki-render-styles {
            font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            color: #2D3748;
          }
          .wiki-render-styles h2 {
            font-size: 1.25rem;
            font-weight: 700;
            color: #1A202C;
            border-bottom: 1px solid #E2E8F0;
            padding-bottom: 0.25rem;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-family: Outfit, sans-serif;
          }
          .wiki-render-styles h3 {
            font-size: 1.05rem;
            font-weight: 700;
            color: #2D3748;
            margin-top: 1.25rem;
            margin-bottom: 0.5rem;
          }
          .wiki-render-styles p {
            margin-bottom: 0.75rem;
          }
          .wiki-render-styles strong {
            color: #1A202C;
            font-weight: 700;
          }
          .wiki-render-styles table.wikitable {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.85rem;
          }
          .wiki-render-styles table.wikitable th {
            background-color: #F7FAFC;
            border: 1px solid #E2E8F0;
            padding: 0.5rem 0.75rem;
            font-weight: 700;
            color: #4A5568;
            text-align: left;
          }
          .wiki-render-styles table.wikitable td {
            border: 1px solid #E2E8F0;
            padding: 0.5rem 0.75rem;
            color: #4A5568;
          }
          .wiki-render-styles table.wikitable tr:nth-child(even) {
            background-color: #F7FAFC;
          }
          /* Custom styled move lists collapse elements */
          .wiki-render-styles table[style*="border-collapse"] {
            width: 100% !important;
            border: 1px solid #E2E8F0 !important;
            border-radius: 8px !important;
            overflow: hidden !important;
          }
          .wiki-render-styles table[style*="border-collapse"] td,
          .wiki-render-styles table[style*="border-collapse"] th {
            padding: 0.65rem 0.75rem !important;
            font-size: 0.8rem !important;
            color: #4A5568 !important;
          }
          .wiki-render-styles hr {
            border: 0;
            border-top: 1px solid #E2E8F0;
            margin: 1.5rem 0;
          }
        `}</style>

        {rendered}
      </div>
    </div>
  );
}
