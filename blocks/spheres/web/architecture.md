# Architecture — web

> What a **browser application** adds to the client anatomy. The client `architecture` chapter is the law; this chapter binds its screen and state rules to the web. Router mechanics and folder conventions are the `stack` chapter's.

---

## 1. The URL is view state
- **View state that should survive reload and sharing — filters, sorting, pagination, selection that a link should reproduce — lives in the URL.** Nothing else does: server data stays in the cache, ephemeral UI state in the component.
- **Merge URL params on write; never overwrite the whole set.** A screen that owns three params updates one without touching the other two.
- **Only the route knows its own path.** The route reads and validates its search params, runs its loader, and composes the page. A co-located piece **never** imports a navigation or params primitive — it would have to hardcode the route's path; it writes URL state by calling a callback the route passed down.

---

## 2. Screens are routes
- Routes are **file-based**; the route tree is generated and never hand-edited.
- **Page-private co-location.** A screen's non-reusable pieces live beside the route in a folder the router excludes from route generation, private to the page. They are not reusable components and never travel; reusable UI goes through the client `architecture` §8 tree.
- A **layout** is a pathless route rendering the outlet for its children; layout chrome (header, sidebar) is a co-located piece of the layout.
- **The default: the route loads data and passes it down; its pieces are dumb** — they receive data and `on*` callbacks and render. This default is the simplest starting point and is **revisable per screen, not globally**: if a single loading point hurts as a screen grows, a piece may take ownership of its own `app` binding unit (the cache dedupes by key).
- Route-level access control (guards, redirects) lives in the route's guard or loader using a feature's public non-reactive composition.

---

## 3. Server rendering is delivery, not architecture
The application is a **client application**: no server functions, no server routes, no database access from the application — the web tier never runs backend logic or talks to a database. Server rendering may be enabled for render speed and first paint; it must never be used to move business logic or data access to the server. Revisit only if the product's nature changes, and record that as a decision.

---

## 4. The document belongs to the screen
- Document metadata — title, description, links — is declared by the screen or component that owns it, inline, never through a global side-effect mechanism.
- Third-party scripts are declared where they are used, as ordinary elements; no imperative script-tag management.
- The `framework` chapter says how the framework hoists and dedupes these.

---

## 5. Errors at the edge
The global unauthorized rule of the client `architecture` §6 is implemented once, in `root`'s data layer: the cache's error handlers translate an `UnauthorizedError` into session state through the auth feature's public API. Feature binding units surface `DomainError`s through their error state; `ui` renders error states; app-wide error boundaries live in `root`.
