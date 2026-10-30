# Screens

> Governs a screen's place in the tree, its pieces and its navigation.

## General

### screen-loads-its-data-and-composes-the-page → delivery-unit-stays-thin · SHOULD

A screen receives its parsed address from its registration, loads the data its pieces render, and composes the page from widgets and from pieces private to it.

| Why |
|---|
| the screen is the one place that knows its data, and one loading point shows one loading state and one error instead of a page that fills in piece by piece. |

### screen-lives-in-composition → delivery-unit-beside-what-it-serves · SHOULD

Every screen lives in the screens of a composition module's presentation, whatever features it uses today; a feature offers its widgets, components and binding units, never a screen.

| Why |
|---|
| a screen is a place in the product, not an operation of a feature, and it does not move when it starts showing a second feature. |

## Pieces

### screen-piece-receives-data-and-callbacks · SHOULD

A screen's piece receives data and `on<Event>` callbacks and never knows which screen it sits on; where one loading point hurts its screen it becomes a widget with a binding unit of its own.

| Why |
|---|
| a piece that knows only its data is reused and tested alone. |

## Navigation

### ui-never-touches-navigation · MUST

Only the root imports the navigation library: no screen, widget or component imports a navigation or route-parameter primitive or knows an address.

| Why |
|---|
| addresses are then known in the root alone, so a change of the navigation library or of a path never reaches a screen, and a piece that navigates by itself can neither hide its behaviour from what composes it nor render without the router. |

### navigation-passed-by-slot · SHOULD

Navigation reaches a screen, a widget or a component as props: its parameters as values, its links as slots that render them, its transitions and any other action as `on<Event>` callbacks; the screen's registration hands them to the screen, which passes them on.

| Why |
|---|
| the interface stays free of navigation, and the link stays a real link the platform can open, share and announce. |
