# Themes

> Governs the theme modes of an interface: how a component is written for all of them, and how one is chosen and applied.

## General

### component-written-once-for-every-mode · SHOULD

Every component is written once for every theme mode, never branching on the theme mode it is shown in.

| Why |
|---|
| a component written per theme mode doubles every style, and the one a change forgets ships broken. |

## Choice

### theme-follows-system-until-chosen · SHOULD

Every interface shows the theme mode the system prefers until its user chooses one.

| Why |
|---|
| an interface that ignores the system's preference shows a light screen to a user who asked every program for a dark one. |

### theme-choice-persists · SHOULD

Every theme mode its user chooses persists across runs and visits.

| Why |
|---|
| a choice lost on reload is a choice the user makes every visit. |

### theme-applied-before-the-first-paint · SHOULD

Every theme mode, the user's choice or the system's preference, is applied before the interface's first paint.

| Why |
|---|
| a theme mode applied after the first paint flashes the wrong one at every load. |
