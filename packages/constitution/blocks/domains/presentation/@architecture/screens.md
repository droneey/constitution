# Screens

> Governs a screen's place in the tree, its screen pieces and its navigation.

## Vocabulary

A **screen piece** is a presentational component a screen's layout is composed of.

## General

### screen-loads-what-its-pieces-render → delivery-unit-stays-thin · SHOULD

Every screen loads the data its own screen pieces render, from the parsed screen address its registration hands it.

| Why |
|---|
| a screen whose screen pieces load their own data fills in one screen piece at a time, with a loading state and an error for each. |

### screen-composed-only-of-widgets-or-its-own-pieces · SHOULD

Every screen's layout is composed only of widgets and of screen pieces of its own.

| Why |
|---|
| markup a screen lays out outside its screen pieces is proven only through the screen and its loading, never alone with the data it is handed. |

### screen-piece-knows-no-screen · SHOULD

Every screen piece takes data and event callbacks and knows no screen, its own included.

| Why |
|---|
| a screen piece that knows its screen can be neither reused nor tested alone. |

### slow-piece-becomes-a-widget · SHOULD

Every screen piece whose loading would hold back its screen becomes a widget that loads its own data through a binding unit.

| Why |
|---|
| a slow screen piece loaded by its screen holds the whole screen behind its wait, though the rest has its data. |

### screen-lives-in-the-programs-presentation → delivery-unit-beside-what-it-serves · SHOULD

Every screen is a page of the program, in the program's presentation, whatever features it shows. A feature and a composition module offer their widgets, components and binding units, never a screen.

| Why |
|---|
| a screen is a place in the product, not an operation of a feature nor a rule of the business, so one kept in a feature must move the day it shows a second. |

## Navigation

### ui-never-touches-navigation → layer-imports-dependencies-by-its-role · MUST

Only the root imports the navigation library: no screen, widget or component imports a navigation or route-parameter primitive.

| Why |
|---|
| a screen, widget or component that imports the navigation library is tied to it and cannot render without the router, and one that navigates by itself hides its behaviour from what composes it. |

### ui-knows-no-address · SHOULD

No screen, widget or component knows a screen address of the program.

| Why |
|---|
| a screen address known outside the root ties a screen, widget or component to the navigation's paths, so a change of a path reaches it. |

### navigation-passed-by-slot · MUST

All navigation reaches the interface as props. A screen, a widget or a component takes its parameters as values, its links as slot props that render them, and its transitions and every other action as event callbacks; the screen's registration hands them to the screen, which passes them on.

| Why |
|---|
| navigation reached any other way ties the screen, widget or component to the router, and a link turned into a press handler can no longer be opened, shared or announced as a link. |
