# WikiPokexGames Editor ⚡

Uma IDE online moderna e especializada, construída do zero para facilitar e acelerar a criação e edição de páginas para a [Wiki da PokeXGames](https://wiki.pokexgames.com/). 

Desenvolvido com inspiração em ferramentas modernas como Notion, Obsidian, VSCode e Linear, este editor traz produtividade extrema para editores e colaboradores da wiki, abandonando caixas de texto simples em favor de uma experiência rica, preditiva e dinâmica.

---

## 🎯 Principais Funcionalidades

### 🔮 Live Visual Preview
Visualize as mudanças em tempo real! O editor possui um parser embutido de WikiText que renderiza tabelas, formatações de texto, listas e, o mais importante, hiperlinks de imagens diretamente na tela de preview.

### 🦖 Pokédex Builder (Visual & Premium Editor)
Um gerador de tabelas de Pokémon totalmente reformulado com uma interface moderna estilo SaaS (inspirada em Figma, Linear e Vercel):
*   **Informações Gerais Facilitadas:** Campos intuitivos para nome, descrição, elementos e habilidades de uso do Pokémon.
*   **Busca Inteligente de Ícones:** Campo integrado que pesquisa na base de dados de Pokémon local e resolve automaticamente a imagem oficial na wiki via `Special:FilePath`.
*   **Seletor de Tiers:** Dropdown único que pré-configura o nível ideal e a matéria padrão do Pokémon baseado no tier escolhido (Tier 4, Tier 3, Tier 2, Tier 1 ou Tier Lendário).
*   **Gerenciador de Matéria de Clã:** Sistema com dropdown duplo para selecionar o Clã (Volcanic, Seavell, etc.) e o tipo da matéria (Mastered, Enhanced ou Superior) de forma ágil.
*   **Controle de Boost:** Escolha de pedras de evolução específicas e definição rápida do tier de boost (`Boost (2)` até `Boost (50)`).
*   **Lista Dinâmica de Golpes (Moveset):**
    *   Auto-complete com mais de 1.000 golpes conhecidos, diferenciando versões de golpes colidentes em `AoE` e `Target`.
    *   Ao definir o nível do Pokémon, todos os seus golpes herdam esse valor automaticamente.
    *   Ordenação interativa de golpes por meio de controles deslizantes (slider), sem a necessidade de recriar os elementos.
    *   **Golpes Selvagens:** Opção "Pokémon Selvagem" que substitui a exibição do nível requerido pelo aviso padrão `(Usado apenas por Pokémon selvagem)` na wiki.
*   **Painel Inspetor Lateral (Live Preview):** Renderizador contextual lateral em tempo real simulando o layout final da wiki em modo PvP ou PvE.

### 🌐 Integração Dinâmica com a Wiki (Source of Truth)
O editor abandona bases de dados estáticas. Sempre que é iniciado, ele faz a leitura da [página principal de Pokémon](https://wiki.pokexgames.com/index.php/Pok%C3%A9mon) para mapear todos os Pokémon (incluindo Megas e Alolas) e indexá-los automaticamente.

### 🖼️ Resolvedor de Arquivos (Special:FilePath)
Imagens hospedadas na Wiki da PXG carregam instantaneamente no seu editor. O sistema utiliza a API do MediaWiki (`Special:FilePath`) para renderizar sprites e badges sem que você precise saber o URL exato do servidor.

### 🚀 Slash Commands (`/`)
Basta digitar `/` no editor para abrir um menu de contexto inteligente que permite:
*   **Busca Ao Vivo de Arquivos:** Digite `/arquivo nome` (ex: `/arquivo fire`) para pesquisar arquivos hospedados na PXG Wiki em tempo real e inseri-los com um clique.
*   **Sugestão de Pokémon:** Digite `/pikachu` para injetar a sintaxe padrão de sprite e link do Pokémon rapidamente.
*   **Templates e Estruturas:** Insira rapidamente marcações complexas como Wikitables, Títulos de Seção, Redirects, Categorias e Linhas.

### ✨ Inline Widgets no Code Editor
Mesmo olhando apenas para o código-fonte, a experiência é rica. A engine do CodeMirror identifica links de imagens, Pokémon, Elementos ou Clãs e injeta um "Widget Visual" inline, permitindo que você enxergue o Sprite/Ícone bem ao lado do seu texto bruto sem escondê-lo.

### 💾 Persistência de Dados
Desenvolvido com Zustand, o sistema de abas e conteúdos é persistido diretamente no `localStorage` do navegador, garantindo que você nunca perca o seu progresso caso feche a aba acidentalmente.

---

## 🛠️ Tecnologias Utilizadas

A stack foi cuidadosamente escolhida para maximizar performance e modularidade:

*   **React 18** (UI e componentes)
*   **TypeScript** (Tipagem forte e segurança)
*   **Vite** (Build tool e Dev Server extremamente rápido)
*   **CodeMirror 6** (Motor do editor de código, extensão de views e widgets)
*   **Zustand** (Gerenciamento global de estado)
*   **Fuse.js** (Busca fuzzy/inteligente para Slash Commands e Pokémon)

---

## 🚀 Como Rodar o Projeto Localmente

### Pré-requisitos
*   Node.js (versão 18 ou superior)
*   NPM ou Yarn

### Instalação

1. Clone o repositório ou navegue até a pasta do projeto:
   ```bash
   cd "wiki editor"
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

4. Acesse pelo navegador na porta indicada (`http://localhost:5173`).

---

## 🏗️ Estrutura do Projeto

*   `/src/editor/`: Core do CodeMirror, lógica dos Slash Commands, atalhos de teclado e widgets decorativos.
*   `/src/parser/`: Motor de parsing (Lexer -> AST -> React Elements) responsável por interpretar o WikiText e renderizar o Preview.
*   `/src/pokemon/`: Serviços que interagem via API com o site oficial da PokéXGames (sincronização de Dex, elementos, arquivos).
*   `/src/ui/`: Layout da aplicação, painéis (Sidebar, Library) e sistema de abas.
*   `/src/state/`: Stores (Zustand) que controlam o estado atual do editor.
*   `/src/pokedex/`: Componentes, tipos, renderizadores e estilos específicos do Pokédex Builder visual.
