# Vitta — sistema pessoal

Central de organização pessoal: finanças, agenda, tarefas do dia, metas e hábitos
em uma única tela. Aplicação de página única, sem framework e sem backend — os
dados ficam no `localStorage` do próprio navegador.

## Rodando

Requer Node.js `>=22.13.0`.

```bash
npm install
npm run dev
```

`npm run build` gera a versão estática em `dist/`, e `npm start` serve esse build.

## Estrutura

```
index.html          casca da página e carregamento dos assets
assets/app.js       estado, telas e renderização (sem dependências)
assets/styles.css   tema visual — preto, branco e azul
vite.config.ts      servidor de desenvolvimento
```

Não há build step além do Vite: `app.js` roda direto no navegador como módulo.

## Módulos

| Módulo | O que faz |
| --- | --- |
| Visão geral | Saldo, receitas e despesas do mês, movimentação dos últimos 12 dias, foco do dia, próximos compromissos e metas |
| Finanças | Lançamentos com abas Todos / Receitas / Despesas / Contas em aberto |
| Agenda | Compromissos filtrados por Hoje / Semana / Mês |
| Meu dia | Tarefas do dia, pendentes e concluídas |
| Metas | Acompanhamento por progresso, financeiras ou pessoais |
| Hábitos | Ritmo do dia e sequência de cada hábito |
| Relatórios | Taxa de economia, produtividade, progresso médio das metas e exportação |

## Dados

Tudo é gravado em duas chaves do `localStorage`:

- `vitta-html-records` — os registros
- `vitta-html-profile` — nome, e-mail e moeda

Na primeira visita o app carrega um conjunto de exemplo com datas relativas ao
dia atual. Para começar do zero, limpe essas chaves pelo DevTools. O botão
**Exportar dados** baixa tudo em JSON.

## Atalhos

| Tecla | Ação |
| --- | --- |
| `/` ou `Ctrl`/`⌘` + `K` | Focar a busca |
| `N` | Novo registro no módulo aberto |
| `Esc` | Fechar modal ou notificações |
