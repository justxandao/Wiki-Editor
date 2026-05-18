import { HighlightStyle, syntaxHighlighting, LanguageSupport, StreamLanguage } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// =============================================
// WikiText Stream Language for CodeMirror 6
// =============================================

const wikitextStreamLanguage = StreamLanguage.define({
  name: 'wikitext',

  token(stream) {
    // Comments
    if (stream.match('<!--')) {
      while (!stream.match('-->') && !stream.eol()) stream.next();
      return 'comment';
    }

    // Headings at start of line
    if (stream.sol()) {
      if (stream.match(/={1,6}/)) {
        stream.skipToEnd();
        return 'heading';
      }

      // Table start/end/row
      if (stream.match('{|')) { stream.skipToEnd(); return 'keyword'; }
      if (stream.match('|}')) { stream.skipToEnd(); return 'keyword'; }
      if (stream.match('|-')) { stream.skipToEnd(); return 'keyword'; }

      // Table headers/cells
      if (stream.match('!')) { stream.skipToEnd(); return 'propertyName'; }
      if (stream.match('|')) { stream.skipToEnd(); return 'string'; }

      // List items
      if (stream.match(/[*#;:]+/)) return 'list';
    }

    // Templates {{ }}
    if (stream.match('{{')) {
      if (stream.match(/[^|}]+:/)) return 'meta'; // parser func
      stream.match(/[^|}]+/);
      return 'typeName';
    }
    if (stream.match('}}')) return 'typeName';

    // File/Image links
    if (stream.match(/\[\[(Arquivo|File|Image|Ficheiro|Categoria|Category):/i)) {
      stream.skipTo(']]');
      stream.match(']]');
      return 'literal';
    }

    // Internal links [[...]]
    if (stream.match('[[')) {
      stream.skipTo(']]');
      stream.match(']]');
      return 'link';
    }

    // Bold+italic
    if (stream.match("'''''")) return 'strong';

    // Bold
    if (stream.match("'''")) return 'strong';

    // Italic
    if (stream.match("''")) return 'em';

    // HTML tags
    if (stream.match(/<\/?[a-z][a-z0-9]*/i)) {
      stream.skipTo('>');
      stream.next();
      return 'tagName';
    }

    stream.next();
    return null;
  },
});

export const wikitextLanguage = new LanguageSupport(wikitextStreamLanguage);

// =============================================
// Highlight Style (dark theme)
// =============================================

export const wikitextHighlightStyle = HighlightStyle.define([
  { tag: tags.heading, color: '#79c0ff', fontWeight: '700' },
  { tag: tags.strong, color: '#e6edf3', fontWeight: '700' },
  { tag: tags.emphasis, color: '#d2a8ff', fontStyle: 'italic' },
  { tag: tags.link, color: '#58a6ff', textDecoration: 'underline' },
  { tag: tags.string, color: '#7ee787' },
  { tag: tags.literal, color: '#56d364' },
  { tag: tags.typeName, color: '#ffa657', fontWeight: '600' },
  { tag: tags.meta, color: '#bc8cff' },
  { tag: tags.keyword, color: '#e3b341', fontWeight: '700' },
  { tag: tags.propertyName, color: '#e3b341' },
  { tag: tags.tagName, color: '#7ee787' },
  { tag: tags.comment, color: '#6e7681', fontStyle: 'italic' },
  { tag: tags.list, color: '#f78166' },
]);

export const wikitextHighlighting = syntaxHighlighting(wikitextHighlightStyle);
