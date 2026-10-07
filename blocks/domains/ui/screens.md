# Screens

> Governs a screen: its states, its address and view state, loading and response.

## States

### data-view-shows-every-state · MUST
A data view shows each state its data can have: loading, failure, content, and the empty or not-found state where its data can be empty or missing.

| Why | Tags |
|---|---|
| an empty view cannot otherwise be told from a slow or a broken one, and the user does not know what to do. | [ux, a11y] |

### failure-contained-to-its-screen · MUST
A failure while a screen loads or renders costs that screen alone: the screen shows it in its own place, and the rest of the application stays usable.

| Why | Tags |
|---|---|
| the user is never left with a blank page, and the parts that still work stay in reach. | [errors, ux] |

### empty-state-offers-an-action · SHOULD
An empty state names the situation and offers an action, and a state with no results repeats the query.

| Why | Tags |
|---|---|
| each is a moment the user decides what to do next, and a blank area leaves them stuck. | [ux] |

### long-load-says-what-it-does · SHOULD
A long load says what it is doing, and shows its progress when the progress is known.

| Why | Tags |
|---|---|
| a wait the user can read is a wait they sit through. | [] |

### unknown-address-shows-the-not-found-screen · SHOULD
An address no screen answers shows the application's not-found screen, which is not the not-found state of a view whose data is missing.

| Why | Tags |
|---|---|
| a mistyped or stale link otherwise ends on a blank page or an error, and the user cannot tell a wrong address from a broken application. | [ux] |

## Address and view state

### address-parsed-as-untrusted-input → outside-value-untyped-until-parsed · MUST
A screen's address — its path and its parameters, in a URL or a deep link — reaches the screen only after a schema parses it; an address that fails the parse opens the screen with its defaults or a fallback screen, never a crash or a half-filled one.

| Why | Tags |
|---|---|
| anyone can write a link and send it to the user, so a malformed one is to be expected, and it must not break the program. | [data] |

### address-write-keeps-the-other-parameters · MUST
A write to a screen's address changes only the parameter it is for and keeps every other one as it was.

| Why | Tags |
|---|---|
| a screen that changes its page must keep the filter another piece set, or the link no longer reproduces the view the user built. | [ux] |

### view-state-kept-in-the-navigation-state → fact-has-one-source · MUST
View state a link or a restart must reproduce — a filter, a sort, a page, the open tab — lives in the platform's navigation state.

| Why | Tags |
|---|---|
| state a link must carry is lost on reload or shared by accident anywhere else. | [] |

### passing-state-kept-in-its-component · SHOULD
Passing state — an open menu, a hover — lives in the component that shows it.

| Why | Tags |
|---|---|
| state lifted above the component that shows it is shared by accident and copied until the copies disagree. | [] |

## Loading

### loading-never-replaces-shown-content · SHOULD
Content a screen already shows stays in place while it reloads or the screen moves to its next state; a reload never swaps it for a loading indicator.

| Why | Tags |
|---|---|
| content that blinks to a placeholder on every refresh reads as a failure, and the user loses their place. | [ux] |

### loading-indicator-waits-its-delay · SHOULD
A first-load indicator appears only after a delay the project sets, so a fast load shows no indicator at all.

| Why | Tags |
|---|---|
| an indicator that flashes for a moment on a fast load reads as a flicker and makes the screen feel slower than it is. | [ux] |

### late-content-reserves-its-space · SHOULD
Content that arrives after the screen is drawn — data, an image, an embed, a notice — has its space reserved before it arrives, by its indicator or its declared size, so nothing already shown moves.

| Why | Tags |
|---|---|
| a layout that jumps when content lands makes the user lose their place or press what slid under their finger. | [ux, performance] |

## Response

### interaction-answered-before-its-work · SHOULD
An interaction shows its first visible response — a pressed state, an opened layer, a busy mark — before the work it starts, within a bound the project sets, and long work runs after that response without blocking the next input.

| Why | Tags |
|---|---|
| a press that shows nothing reads as missed, so the user presses again or leaves. | [performance, ux] |

### fast-source-updates-once-per-frame · SHOULD
A fast source — a resize, a scroll, a stream — updates a screen's state at most once a frame, its events folded in batches.

| Why | Tags |
|---|---|
| dozens of updates a second redraw nothing the user can see and starve everything else. | [performance] |
