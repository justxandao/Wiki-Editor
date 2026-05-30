export interface Col { id: string; name: string; width: number; }
export interface GridRow { id: string; cells: Record<string, string>; isXpRow?: boolean; }

export interface NpcPokemon {
  id: string;
  image: string;   // wiki image file e.g. "430-Shiny_Honchkrow.png"
  name: string;    // wiki link name
  types: string[];
  weaknesses: string[];
}
