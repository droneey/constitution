# Screens

> Governs a screen's place in the tree, its pieces and its navigation.

## General

### screen-loads-its-data-and-composes-the-page → delivery-unit-stays-thin · MUST

A screen loads its data and composes its page from widgets and pieces of its own. It receives its parsed address from its registration and loads the data its pieces render. The pieces and binding units only it uses live beside it, private to it; they receive data and `on<Event>` callbacks and know no screen, and a piece whose loading would hold back its screen becomes a widget with a binding unit of its own.

| Why |
|---|
| a page whose pieces load their own data fills in piece by piece, with a loading state and an error for each, a piece that knows its screen can be neither reused nor tested alone, and one kept away from its screen changes apart from it and is reached by other screens by accident. |

### screen-lives-in-the-programs-presentation → delivery-unit-beside-what-it-serves · MUST

Every screen is a page of the program, in the program's presentation. It stays there whatever features it shows today, and a feature and a composition module offer their widgets, components and binding units, never a screen.

| Why |
|---|
| a screen is a place in the product, not an operation of a feature nor a rule of the business, so one kept in a feature must move the day it shows a second. |

## Navigation

### ui-never-touches-navigation · MUST

The interface never touches navigation. Only the root imports the navigation library: no screen, widget or component imports a navigation or route-parameter primitive or knows an address.

| Why |
|---|
| an address known outside the root ties a screen to the navigation library and its paths, so a change of either reaches it, and a piece that navigates by itself hides its behaviour from what composes it and cannot render without the router. |

### navigation-passed-by-slot · MUST

Navigation reaches the interface as props. A screen, a widget or a component takes its parameters as values, its links as slots that render them, and its transitions and any other action as `on<Event>` callbacks; the screen's registration hands them to the screen, which passes them on.

| Why |
|---|
| navigation reached any other way ties the piece to the router, and a link turned into a press handler can no longer be opened, shared or announced as a link. |
