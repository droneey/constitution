# TanStack Router

> **Vocabulary:** folder `routes`, the delivery layer of a browser application.

## screens-are-file-routes · SHOULD
Screens are file routes under `routes/`, the delivery layer, from which the router generates `routeTree.gen.ts`; `router.tsx` creates the router.

| Why | Check | Tags |
|---|---|---|
| the file tree is the route tree, so a screen is found by its URL. | review | [] |

## routes-folder-holds-file-routes → screens-are-file-routes
`routes/` holds only file routes, their groups and parameters, and their dash folders.

| Why | Check | Tags |
|---|---|---|
| the file tree is then the route tree. | tool/names | [] |

## route-owns-its-url → screen-composes-the-page
A route owns its URL: it reads and validates its search, runs its loader, and composes the page.

| Why | Check | Tags |
|---|---|---|
| the one place that knows the address is the one that turns it into data. | review | [] |

## router-primitives-only-in-screens-and-widgets → pieces-never-touch-navigation
Router primitives — `Link`, `useNavigate`, `useSearch`, `useParams` — are imported only by route files, their private hooks and widgets. A presentational component receives a link slot or a callback.

| Why | Check | Tags |
|---|---|---|
| a presentational component that navigates works on one screen only. | tool/imports | [] |

## search-params-validated-by-schema → untrusted-input-parsed-at-edge
Every route with search parameters validates them by a schema in `validateSearch`.

| Why | Check | Tags |
|---|---|---|
| the URL is input anyone can type, and an unvalidated parameter reaches the screen as whatever was typed. | review | [] |

## search-params-merged-on-write → url-holds-shareable-view-state
A write to the search merges with the current parameters, never replaces them.

| Why | Check | Tags |
|---|---|---|
| a screen that changes its page must keep the filter another piece set. | review | [] |

## screen-private-pieces-in-dash-folders → screen-private-pieces-beside-screen
A screen's private pieces live beside its route in `-components/`, its private binding units in `-hooks/`, and the specs of both in the `__tests__/` of those folders, never in a `__tests__/` of the route folder.

| Why | Check | Tags |
|---|---|---|
| the dash keeps them out of the route tree, and beside the screen they serve; the generator takes a `__tests__/` outside a dash folder for routes and warns on every run. | review | [] |

## screen-pieces-in-dash-folders → screen-private-pieces-in-dash-folders
A screen's private folders beside its route are `-components/` and `-hooks/`: `-components/` holds component folders and a surface, as `components/` does, and `-hooks/` holds hooks files and a surface.

| Why | Check | Tags |
|---|---|---|
| the dash keeps them out of the route tree. | tool/names | [] |

## guard-reaches-features-outside-react → screen-guards-through-auth-surface
A route's guard reaches the feature that decides access through the feature's composition outside React, never through the UI layer.

| Why | Check | Tags |
|---|---|---|
| `beforeLoad` runs before any component renders, so a guard that needs a hook or a component's context has nothing to read. | review | [] |

## document-head-declared-by-route → document-metadata-owned-by-screen
A route declares its document metadata in `head`.

| Why | Check | Tags |
|---|---|---|
| the metadata changes with the route that owns it. | review | [ux] |

## route-pieces-reach-the-route-by-its-api → screen-private-pieces-beside-screen
A route's private pieces reach its params and search through `getRouteApi('<route id>')`, never by importing the route file.

| Why | Check | Tags |
|---|---|---|
| a piece that imports its route file pulls the whole route into its module and ties the two into a cycle. | tool/imports | [] |

## libs-import-no-router → libs-import-no-application-code
`libs/` never imports the router.

| Why | Check | Tags |
|---|---|---|
| what `libs/` wraps is one vendor's client; the application's navigation stays out. | tool/imports | [] |

## routes-imported-only-by-the-router → dependencies-point-inward
Nothing under `features/`, `shared/`, `libs/`, `kernel/`, `contracts/` or `composition/` imports a file of `routes/`.

| Why | Check | Tags |
|---|---|---|
| these are the layers the router's screens sit above. | tool/imports | [] |

## screen-reads-start-in-the-loader → route-owns-its-url
A screen's reads start together in its route's loader, before it renders, never one after another as its components mount.

| Why | Check | Tags |
|---|---|---|
| reads started in a loader run in parallel and before the first paint; reads in components wait for each other. | review | [] |

## services-reach-loaders-through-router-context → one-explicit-composition-root
Every service the providers build — the adapters, the cache client, analytics, the configuration — reaches loaders and guards through the router's context.

| Why | Check | Tags |
|---|---|---|
| a loader then reads through the same services as the screens, and a spec replaces them in one place. | review | [] |
