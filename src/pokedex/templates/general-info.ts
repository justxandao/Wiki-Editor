import { PokedexSchema } from '../types/schema';

export function renderGeneralInfo(schema: PokedexSchema): string {
  const { pokemon, image, general } = schema;
  const elements = general.types.join(' and ') || 'None';
  const abilities = general.abilities.map(a => a.trim()).join(', ') || 'None';
  const boost = general.boost.join(' ou ') || 'None';
  const materia = general.materia.join(' ou ') || 'None';

  return `<center>[[file:${image || pokemon + '.png'}|link=]]</center>

== '''Informações Gerais''' ==

'''Nome:''' ${pokemon || 'Unknown'}<br />
'''Level:''' ${general.level || 100}<br />
'''Elemento:''' ${elements}<br />
'''Habilidades:''' ${abilities}.<br />
'''Boost:''' ${boost}<br />
'''Materia:''' ${materia}<br />`;
}
