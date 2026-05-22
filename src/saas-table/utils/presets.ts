import { ColumnSchema, RowData } from '../types/schema';
import { nanoid } from 'nanoid';

export interface TablePreset {
  id: string;
  name: string;
  description: string;
  columns: ColumnSchema[];
  data: RowData[];
}

export const TABLE_PRESETS: TablePreset[] = [
  {
    id: 'duelo_npc',
    name: 'Duelo NPC',
    description: 'Tabela de informações de times de NPCs, incluindo ícones, tipos e fraquezas.',
    columns: [
      { id: 'pokemon', name: 'Pokémon', type: 'text', width: 200 },
      { id: 'tipagem', name: 'Tipagem', type: 'text', width: 150 },
      { id: 'efetivo_contra', name: 'Efetivo Contra', type: 'text', width: 300 },
    ],
    data: [
      {
        id: nanoid(),
        pokemon: '[[Arquivo:110-Weezing.png]] Weezing',
        tipagem: '[[Arquivo:Poison1.png]]',
        efetivo_contra: '[[Arquivo:Psychic.png]]',
      },
      {
        id: nanoid(),
        pokemon: '[[Arquivo:057-Primeape.png]] Primeape',
        tipagem: '[[Arquivo:Fighting.png]]',
        efetivo_contra: '[[Arquivo:Psychic.png]] [[Arquivo:Fairy.png]] [[Arquivo:Flying.png]]',
      },
      {
        id: nanoid(),
        pokemon: '[[Arquivo:068-Machamp.png]] Machamp',
        tipagem: '[[Arquivo:Fighting.png]]',
        efetivo_contra: '[[Arquivo:Psychic.png]] [[Arquivo:Fairy.png]] [[Arquivo:Flying.png]]',
      },
      {
        id: nanoid(),
        pokemon: '[[Arquivo:336-Seviper.png]] Seviper',
        tipagem: '[[Arquivo:Poison1.png]]',
        efetivo_contra: '[[Arquivo:Psychic.png]] [[Arquivo:Ground.png]]',
      },
      {
        id: nanoid(),
        pokemon: '[[Arquivo:024-Arbok.png]] Arbok',
        tipagem: '[[Arquivo:Poison1.png]]',
        efetivo_contra: '[[Arquivo:Psychic.png]] [[Arquivo:Ground.png]]',
      },
      {
        id: nanoid(),
        pokemon: '[[Arquivo:335-Zangoose.png]] Zangoose',
        tipagem: '[[Arquivo:Normal1.png]]',
        efetivo_contra: '[[Arquivo:Fighting.png]]',
      },
    ],
  },
  {
    id: 'recompensas',
    name: 'Recompensas',
    description: 'Tabela padrão de prêmios de baús e quests da Wiki.',
    columns: [
      { id: 'item_icone', name: 'Item', type: 'text', width: 120 },
      { id: 'quantidade_nome', name: 'Quantidade / Nome', type: 'text', width: 280 },
    ],
    data: [
      {
        id: nanoid(),
        item_icone: '[[Arquivo:Premier-ball%281%29.png|link=Pokébolas]]',
        quantidade_nome: '4 Premier Balls',
      },
      {
        id: nanoid(),
        item_icone: '[[Arquivo:Net-ball.png|link=Pokébolas]]',
        quantidade_nome: '20 Net Balls',
      },
      {
        id: nanoid(),
        item_icone: '[[Arquivo:Scythe1.png|link=]]',
        quantidade_nome: '2 Scythes',
      },
      {
        id: nanoid(),
        item_icone: '[[Arquivo:Cocoon_stone.gif|link=]]',
        quantidade_nome: '1 Cocoon Stone',
      },
    ],
  },
];
