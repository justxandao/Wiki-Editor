import { ColumnSchema, RowData } from '../types/schema';

export function tableToWikitext(columns: ColumnSchema[], data: RowData[]): string {
  if (columns.length === 0) return '';

  let wikitext = '{| class="wikitable"\n';

  // Header row
  wikitext += '! ' + columns.map((col) => col.name).join(' !! ') + '\n';

  // Data rows
  data.forEach((row) => {
    wikitext += '|-\n';
    wikitext += '| ' + columns.map((col) => {
      const val = row[col.id];
      return val != null ? String(val) : '';
    }).join(' || ') + '\n';
  });

  wikitext += '|}';
  return wikitext;
}
