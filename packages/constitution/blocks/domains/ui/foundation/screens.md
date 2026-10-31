# Screens

> Governs a screen: its states, its address and view state, the permissions it asks for, loading, images and response.

## States

### data-view-shows-every-state · MUST

A data view shows each state its data can have: loading, failure, content, and the empty or not-found state where its data can be empty or missing; no default stands in for data not yet loaded.

| Why |
|---|
| an empty view cannot otherwise be told from a slow or a broken one, and an invented default hides loading and failure behind something that looks like data, so the user does not know what to do. |

### data-result-is-union-by-status → illegal-state-unrepresentable · MUST

What a screen or a widget calls to read or write data returns a union keyed by `status`, with only the states its operation has — or suspends to a boundary above it that shows the waiting and the failed states; the data exists only in the success state, or beside the error when a reload of data already shown fails.

| Why |
|---|
| a bag of flags allows combinations no state has, and data kept beside a failed reload keeps the screen showing it. |

### failure-contained-to-its-screen → optional-part-isolated-from-its-faults · MUST

A failure while a screen loads or renders costs that screen alone: the screen shows it in its own place, and the rest of the application stays usable.

| Why |
|---|
| the user is never left with a blank page, and the parts that still work stay in reach. |

### empty-state-offers-an-action · SHOULD

An empty state names the situation and offers an action, and a state with no results repeats the query.

| Why |
|---|
| each is a moment the user decides what to do next, and a blank area leaves them stuck. |

## Address and view state

### address-parsed-as-untrusted-input → outside-value-untyped-until-parsed · MUST

A screen's address — its path and its parameters, in a URL or a deep link — reaches the screen only after a schema parses it; an address that fails the parse opens the screen with its defaults or a fallback screen, never a crash or a half-filled one.

| Why |
|---|
| anyone can write a link and send it to the user, so a malformed one is to be expected, and it must not break the program. |

### address-only-opens-a-screen · MUST

A link — a URL or a deep link — opens a screen with its parameters and performs no action — a payment, a send, a change of settings — until the user confirms it there.

| Why |
|---|
| anyone can craft a link and get it tapped, so a link that acts at once acts for its author, not for the user. |

### address-write-keeps-the-other-parameters · MUST

A write to a screen's address changes only the parameter it is for and keeps every other one as it was.

| Why |
|---|
| a screen that changes its page must keep the filter another piece set, or the link no longer reproduces the view the user built. |

### view-state-kept-in-the-navigation-state → fact-has-one-source · MUST

View state a link or a restart must reproduce — a filter, a sort, a page, the open tab — lives in the platform's navigation state.

| Why |
|---|
| state a link must carry is lost on reload or shared by accident anywhere else. |

### unknown-address-shows-the-not-found-screen · SHOULD

An address no screen answers shows the application's not-found screen, which is not the not-found state of a view whose data is missing.

| Why |
|---|
| a mistyped or stale link otherwise ends on a blank page or an error, and the user cannot tell a wrong address from a broken application. |

## Permissions

### permission-asked-in-context · SHOULD

A permission the platform asks the person for is requested when they first reach the feature that needs it, after the screen says why, never at start; a refusal leaves every other feature working, and the feature that needs it says what it lacks and how to grant it in the platform's settings.

| Why |
|---|
| a person grants what they understand at the moment it is needed, a request out of context is refused for good, and a feature that fails silently tells them nothing. |

## Loading

### loading-never-replaces-shown-content · SHOULD

Content a screen already shows stays in place while it reloads or the screen moves to its next state; a reload never swaps it for a loading indicator.

| Why |
|---|
| content that blinks to a placeholder on every refresh reads as a failure, and the user loses their place. |

### loading-indicator-delayed-and-held · SHOULD

A loading indicator appears only once a load outlasts a delay the project sets, and once shown stays for a minimum the project sets, so a fast load shows none and a slow one never flashes.

| Why |
|---|
| below about a second a wait needs no sign, and an indicator that flashes for a moment reads as a glitch and makes the screen feel slower than it is. |

### late-content-reserves-its-space · SHOULD

Content that arrives after the screen is drawn — data, an image, an embed, a notice — has its space reserved before it arrives, by its indicator or its declared size, so nothing already shown moves.

| Why |
|---|
| a layout that jumps when content lands makes the user lose their place or press what slid under their finger. |

### long-work-shows-its-progress · SHOULD

A screen whose work a user waits on past a bound the project sets names what it is doing and shows how far it has come — the share done, the current step or the time left — wherever the program knows it.

| Why |
|---|
| a wait with no name and no progress looks like a hang, and the user leaves or starts the work again. |

## Images

### image-sharp-at-the-pixel-density · SHOULD

Every image a screen shows is sharp at the screen's pixel density, and never fetched larger than that density needs.

| Why |
|---|
| one image size is blurry on a dense screen and wasteful on a plain one. |

## Response

### felt-speed-measured-in-the-field-within-budget · SHOULD

The interface's speed as people feel it — the wait for its main content, the answer to their input, the stillness of what it shows — is measured in the field, at the 75th percentile of real uses, and kept within a budget the project sets.

| Why |
|---|
| a fast developer's machine hides the slow devices and networks people use, and the 75th percentile counts the slow quarter an average smooths away. |

### interaction-answered-before-its-work · SHOULD

An interaction shows its first visible response — a pressed state, an opened layer, a busy mark — before the work it starts, within a bound the project sets, and long work runs after that response without blocking the next input.

| Why |
|---|
| a press that shows nothing reads as missed, so the user presses again or leaves. |

### fast-source-updates-once-per-frame · SHOULD

A fast source — a resize, a scroll, a stream — updates a screen's state at most once a frame, its events folded in batches.

| Why |
|---|
| dozens of updates a second redraw nothing the user can see and starve everything else. |

### frequent-interaction-never-waits-on-motion · SHOULD

A layer the user opens many times a session — a menu, a command palette — opens without an entrance animation, and no animation stands between an action and its result.

| Why |
|---|
| an animation seen for the hundredth time is only a wait, and a result held back by motion makes the interface slow however fast its work is. |

### long-lists-virtualised · SHOULD

A list whose length the product does not bound renders only the rows in view and those near them, or is paged.

| Why |
|---|
| a list that mounts every row at once grows slower with every item, and a long one freezes the device. |
