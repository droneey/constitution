# Architecture — mobile

> What a **device application** adds to the client anatomy. The client `architecture` chapter is the law; this chapter will bind its screen and state rules to a device. **Skeleton:** the sections below are the questions the first mobile project must answer. A `TODO:` is an honest gap, not a rule — until it is filled, the client chapter alone applies.

---

## 1. Navigation state is view state
TODO: which view state survives navigation and app restarts, where filters and selection live without a URL, how deep links map onto screens and their params, and what the screen owns versus what its pieces receive.

---

## 2. Screens under a navigator
TODO: the screen folder convention, layouts as stacks and tabs, co-located screen-private pieces, guards and redirects for authenticated areas, and the name of the screens layer where the navigator's own folder name collides with the feature `app` layer.

---

## 3. Offline and persistence
TODO: which cached server data persists across restarts and for how long, the reconciliation policy when the network returns, and how a write made offline is queued, retried or refused.

---

## 4. Platform capabilities
TODO: permissions and their prompts, push notifications, background execution, lifecycle events (foreground, background, termination), secure storage for tokens, and where each capability sits in the layers — an adapter behind a port, never in a screen.

---

## 5. Delivery
TODO: over-the-air updates versus store releases, build channels and their environments, and how a release is versioned against the store.
