# Vitthal's Terminal Garden

A portfolio that mixes a digital-garden layout (file tree, search, graph view, notes) with a working terminal.

Built with **Vite**, **React 19**, **TypeScript**, **Tailwind CSS v4** and **lucide-react**. Fonts are self-hosted through Fontsource, so the site makes no third-party requests.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-checks, then builds to dist/
npm run preview    # serve the built site locally
npm test           # unit tests for the terminal and content (no extra dependencies)
```

Needs Node 20.19 or newer.

## Change what the site says

Everything on the page, in search, in the graph and in the terminal comes from one file:

- `src/data/notes.ts` holds every note (about, skills, projects, contact), your links and your email.
- `src/data/graph.ts` holds the node positions for the graph view. If you add a note, give it a position there.

Text in a note can use `` `code` ``, `[label](note:about)` to open another note, and `[label](https://...)` for an external link.

To add a project, add a note with `parent: 'projects'`, add its id to the `NoteId` type, list it in the projects `index` block, and give it a graph position. `npm test` checks that the tree, graph and notes agree.

## Change the look

The colours are CSS variables at the top of `src/index.css`. Dark is the default, light follows the visitor's system setting, and the theme button overrides it and remembers the choice. Tailwind utilities such as `bg-panel`, `text-muted`, `border-line` and `text-accent` read those variables, so a theme change needs no class edits.

## Deploy to GitHub Pages

1. Put these files in your repo (replace the old `index.html`, delete `main.html`, and replace the old workflow in `.github/workflows`).
2. In the repo, open Settings, then Pages, and set Source to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` tests, builds and publishes it.

`vite.config.ts` uses `base: './'`, so the build works from any path, including `https://<user>.github.io/portfolio_ME/`.

## Project layout

```
src/
  App.tsx              page shell, navigation, search, drawer
  components/          Header, Explorer, NoteView, Terminal, GraphView, Rail, ...
  data/notes.ts        all content
  data/graph.ts        graph layout
  lib/terminal.ts      terminal commands (plain functions, tested)
  lib/inline.ts        tiny inline markup parser
  hooks/               useTheme, useMediaQuery
  index.css            theme variables and Tailwind setup
```

## Things to know

- The page is rendered in the browser. Search engines that run JavaScript will read it, and `index.html` carries the title, description, social tags and a `<noscript>` summary. If you want every note in the raw HTML, add pre-rendering later.
- lucide-react 1.x no longer includes brand logos, so the GitHub and LinkedIn icons are drawn in `src/components/BrandIcons.tsx` in the same outline style.
- The terminal prints text only. Anything a visitor types is shown as plain text and never inserted as HTML.
