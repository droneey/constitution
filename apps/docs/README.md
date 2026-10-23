# Site

> The Constitution's site: its documentation and its blocks, rendered from the repository.

The site reads the repository's Markdown as GitHub shows it — the README, `docs/`, `PROJECT.md`'s glossary, `DECISIONS.md`, `CONTRIBUTING.md` and the blocks — and prerenders every page into a static site. The README's Documentation section is its sidebar; a link between two files becomes a link between their pages, and a link to a file the site does not render leads to GitHub.

## Run it

```bash
bun --cwd=apps/docs run dev       # the site with live reload, at localhost:3000
bun --cwd=apps/docs run build     # the static site, in apps/docs/.output/public
```

The site builds from its own folder, two levels below the repository's root, where it finds the files it renders.

### In Docker

```bash
apps/docs/scripts/run.sh dev up     # the site with live reload, on the working tree
apps/docs/scripts/run.sh prod up    # the built site, served as files by static-web-server
apps/docs/scripts/run.sh dev down   # stops and removes the containers
```

Both listen on `127.0.0.1:3000`, or on `DOCS_PORT`. The image builds from the repository's root, which the site reads; the development containers keep the dependencies installed for Linux in volumes, made again when `bun.lock` changes.

## How it is laid out

| Folder | Holds |
|---|---|
| `src/root` | the routes, the router and the document, which hand each screen its data |
| `src/composition/docs` | the documentation's screens, widgets and components, and the styles of rendered rules |
| `src/features/content` | the content pipeline: the collections, the loader, the remark plugins, the sidebar read from the README |
| `src/features/versions` | the releases the version menu lists, read from `versions.json` |
| `src/libs/ui` | the Fumadocs components the site composes, from the library it installs, and its skin: the stylesheets that map Fumadocs onto the design system's tokens, and `keepOneLayout` |
| `content/examples` | one example per rule, `<slug>.md`, shown at the foot of its card |
| `docker`, `compose.yaml`, `scripts` | the image, its Compose services and the script that runs them |

The site's look is `@droneey/design-web`'s: its stylesheet, its Tailwind theme and its components, icons and popover through `@droneey/design-web/react-dom`, with the site's own Fumadocs skin over them, and the repository's accent, `brand.tokens.json` at its root, which the root route hands to its `ThemeProvider`.
