# Themes

> Governs the theme modes of an interface: how a component is written for all of them, and how one is chosen and applied.

## General

### component-written-once-for-every-mode · SHOULD

Every component is written once for every theme mode, never branching on the theme mode it is shown in.

#### Why

A component written per theme mode doubles every style, and the one a change forgets ships broken.

#### Examples

```pseudo title="Avoid"
component PriceTag({ amount })
  let color = theme.mode is Dark ? tokens.color.textOnDark : tokens.color.textOnLight

  return Text(formatMoney(amount), style: { color })
```

```pseudo title="Prefer"
component PriceTag({ amount })
  return Text(formatMoney(amount), style: { color: tokens.color.text.default })
```

## Choice

### theme-follows-system-until-chosen · SHOULD

Every interface shows the theme mode the system prefers until its user chooses one.

#### Why

An interface that ignores the system's preference shows a light screen to a user who asked every program for a dark one.

#### Examples

```pseudo title="Avoid"
function resolveThemeMode(stored)
  return stored ?? Light
```

```pseudo title="Prefer"
function resolveThemeMode(stored, system)
  return stored ?? system.preferredThemeMode()
```

### theme-choice-persists · SHOULD

Every theme mode its user chooses persists across runs and visits.

#### Why

A choice lost on reload is a choice the user makes every visit.

#### Examples

```pseudo title="Avoid"
function chooseThemeMode(mode)
  call setThemeMode(mode)  # forgotten on the next visit
```

```pseudo title="Prefer"
let THEME_MODE_KEY = "theme-mode"

function chooseThemeMode(mode)
  call preferences.write(THEME_MODE_KEY, mode)
  call setThemeMode(mode)
```

### theme-applied-before-the-first-paint · SHOULD

Every theme mode, the user's choice or the system's preference, is applied before the interface's first paint.

#### Why

A theme mode applied after the first paint flashes the wrong one at every load.

#### Examples

```pseudo title="Avoid"
component App()
  onMounted(function()
    applyThemeMode(resolveThemeMode(preferences.read(THEME_MODE_KEY), system)))

  return AppShell()
```

```pseudo title="Prefer"
function start()
  applyThemeMode(resolveThemeMode(preferences.read(THEME_MODE_KEY), system))

  render(App())
```
