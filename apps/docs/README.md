# Site

> The Constitution's site: its documentation and its blocks, rendered from the repository.

The site reads the repository's Markdown as GitHub shows it — the README, `docs/`, `PROJECT.md`'s glossary, `DECISIONS.md`, `CONTRIBUTING.md` and the blocks — and prerenders every page into a static site. The README's Documentation section is its sidebar; a link between two files becomes a link between their pages, and a link to a file the site does not render leads to GitHub.

## Run it

```bash
bun --cwd=apps/docs run dev       # the site with live reload, at localhost:3000
bun --cwd=apps/docs run build     # the static site, in apps/docs/.output/public
bun --cwd=apps/docs run build:release   # the same, served under /v<version>/, as a release ships it
```

The site builds from its own folder, two levels below the repository's root, where it finds the files it renders.

### In Docker

```bash
apps/docs/scripts/run.sh dev up     # the site with live reload, on the working tree
apps/docs/scripts/run.sh prod up    # the built site, served as files by static-web-server
apps/docs/scripts/run.sh dev down   # stops and removes the containers
```

Both listen on `127.0.0.1:3000`, or on `DOCS_PORT`. The image builds from the repository's root, which the site reads; the development containers keep the dependencies installed for Linux in volumes, made again when `bun.lock` changes.

### Versions

Each release attaches its site, built under `/v<version>/`, as `constitution-docs.tar.gz` with its checksum. The production image keeps the last ten releases that carry one, each unpacked under its version, and the working tree's build where no release carries its version; `scripts/fetch-releases.sh` lays them out at the image's build. It writes `versions.json`, which the version menu of every release's site reads at the host's root, listing every release but the pre-releases, redirects `/`, `/docs/…` and `llms*.txt` to the release GitHub calls the latest, and answers an address with no file with the app shell of the release it names, so each release shows its own not-found page. `scripts/run.sh prod up` serves the working tree alone; `DOCS_KEPT_RELEASES=10` keeps the releases beside it. A build with `--secret id=github_token,env=GITHUB_TOKEN` lifts the API's limit of 60 requests an hour, and `--no-cache-filter releases` reads the releases again after one is promoted.

## How it is laid out

| Folder | Holds |
|---|---|
| `src/root` | the wiring of every adapter and use case, the routes, the router and the document, which hand each screen its data |
| `src/composition/docs` | the documentation's screens, widgets and components, the styles of rendered rules, and the document's frame, which the sidebar marks |
| `src/features/content` | the pages and their search, behind ports: `adapters/fumadocs-mdx` compiles the collections at build time — the remark plugins, the repository's sidebar, the schema — `adapters/fumadocs` serves them on the server, and `adapters/fumadocs-browser` loads their bodies and searches their index in the tab |
| `src/features/versions` | the releases the version menu lists, read from the host's `versions.json` |
| `src/libs/ui` | the Fumadocs components the site composes, from the library it installs, and its skin: the stylesheets that map Fumadocs onto the design system's tokens, and `keepOneLayout` |
| `content/examples` | one example per rule, `<slug>.md`, shown at the foot of its card |
| `docker`, `compose.yaml`, `scripts` | the image, its Compose services, the script that runs them and the one that lays out the releases' sites |

The site's look is `@droneey/design-browser`'s: its stylesheet, its Tailwind theme and its components, icons and popover through `@droneey/design-browser/react-dom`, with the site's own Fumadocs skin over them, and the repository's accent, `brand.tokens.json` at its root, which the root route hands to its `ThemeProvider`.
