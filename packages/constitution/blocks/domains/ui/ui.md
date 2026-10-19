---
id: ui
summary: "Screens of declarative components: props, state, forms, accessibility."
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: ["**"]
---

# User interface

> Screens a person sees and uses, built from declarative components that take their inputs as props: how they are composed and where their state lives, how components are sourced, built and named, how forms take input, what every person must be able to do whatever their sight, hearing, movement or attention, and how an interface is proven.

The interface's look, when the product owns it, is the design system's.

**Vocabulary.** Folders: `ui` — the presentation layer of a feature or of a composition module, and `shared/ui`, `libs/ui`; `screens` — a composition module's screens; `components` — presentational; `widgets` — smart; `assets` — icons, images and fonts. Suffix: `.variants`. A feature adds `ui/{components,widgets}/`, a composition module `ui/{screens,components,widgets}/`.
