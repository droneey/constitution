# Screens

> Governs a screen: its states, its address and view state, the direction of its layout, and the permissions it asks for.

## Vocabulary

A **screen address** is a URL or a deep link of the program, with its path and its parameters; a screen's address is the one that opens it.

## States

### data-view-shows-every-state · MUST

Every data view shows each state its data can have: loading, failure, content, and the empty or not-found state where its data can be empty or missing. A data view is a view that shows data it loads. No default stands in for its data not yet loaded. Exempt: a load that ends before the delay `loading-indicator-delayed` sets, whose loading state shows no indicator.

| Why |
|---|
| an empty view cannot otherwise be told from a slow or a broken one, and an invented default hides loading and failure behind something that looks like data, so the user does not know what to do. |

### data-call-returns-a-union-of-its-states → illegal-state-unrepresentable · MUST

Every call the interface makes to read or write data returns a union of the states its operation has. The union holds no other state, and its data is present only in the states that hold it. Exempt: a call that suspends to a boundary above it, which shows the waiting and the failed states.

| Why |
|---|
| a bag of flags allows combinations no state has, which a screen then renders — make illegal states unrepresentable. |

### failed-reload-keeps-the-shown-data · SHOULD

Every failed reload of data a screen already shows keeps that data shown, beside the error.

| Why |
|---|
| data dropped on a failed reload blanks a screen that had something to show, and the person loses what they were reading to a passing fault. |

### failure-contained-to-its-screen → last-resort-handler-one-per-interface · MUST

Every failure a screen's code leaves unhandled while it loads or renders shows in the place the screen renders in. The rest of the program stays usable.

| Why |
|---|
| a failure that blanks the whole program puts the parts that still work out of the user's reach, though only one screen failed. |

### empty-state-offers-an-action · SHOULD

Every empty state names its situation and offers the action that changes it.

| Why |
|---|
| an empty state is a moment the person decides what to do next, and a blank area leaves them stuck. |

### no-results-state-repeats-the-query · SHOULD

Every state with no results repeats the query that found none.

| Why |
|---|
| a person who cannot see what they searched for cannot tell a typo from an empty result. |

## Address and view state

### address-parsed-as-untrusted-input → outside-value-untyped-until-parsed · MUST

Every screen's address is parsed as untrusted input: its path and its parameters, in a URL or a deep link, reach the screen only after a schema parses them.

| Why |
|---|
| anyone can write a link and send it to the user, so a malformed address read unparsed crashes the screen or fills it with nonsense — parse, don't validate. |

### unparsable-address-opens-a-fallback · MUST

Every screen address that fails its parse opens its screen with the screen's defaults, or a fallback screen. It never crashes the screen, and never fills it from the parts of the address that did parse.

| Why |
|---|
| anyone can write a link and send it to the user, so an address whose failed parse crashes the screen is a way to break it that anyone can send. |

### address-only-opens-a-screen · MUST

Every screen address only opens its screen with its parameters, in a URL and in a deep link alike. It performs no action, such as a payment, a send or a change of settings, until the person confirms it there.

| Why |
|---|
| anyone can craft a link and get it tapped, so a link that acts at once acts for its author, not for the user. |

### address-write-keeps-the-other-parameters · MUST

Every write to a screen's address changes only the parameter it is for, and every other parameter stays as it was.

| Why |
|---|
| a screen that changes its page must keep the filter another part of it set, or the link no longer reproduces the view the user built. |

### view-state-kept-in-the-navigation-state → fact-has-one-source · MUST

All view state that a link or a restart brings back lives in the platform's navigation state. Such state includes a filter, a sort, a page and the open tab.

| Why |
|---|
| state a link must carry is lost on reload or shared by accident anywhere else — a single source of truth. |

### unknown-address-shows-the-not-found-screen · SHOULD

Every screen address no screen answers shows the program's not-found screen. That screen is apart from the not-found state of a view whose data is missing.

| Why |
|---|
| a mistyped or stale link otherwise ends on a blank page or an error, and the user cannot tell a wrong screen address from a broken program. |

## Direction

### layout-mirrors-right-to-left · MUST

Where its language is written right to left, every screen's layout mirrors: what starts on the left starts on the right, and an icon that points along the reading direction turns. Exempt: numbers, media controls and logos, which keep their direction.

| Why |
|---|
| a layout that runs against the reading direction makes a right-to-left reader read every screen backwards. |

## Permissions

### permission-asked-in-context · SHOULD

Every permission the platform asks the person for is requested when they first reach the capability that needs it. It is requested after the screen says why, never at start.

| Why |
|---|
| a person grants what they understand at the moment it is needed, and a request out of context is refused for good. |

### refused-permission-costs-only-its-capability · SHOULD

Every permission the person refuses costs only the capability that needs it, and every other capability keeps working.

| Why |
|---|
| a refusal that breaks what never needed the permission punishes the person for their choice, so they leave or grant it against their will. |

### refused-capability-says-how-to-grant · SHOULD

Every capability whose permission was refused says what it lacks and how to grant it in the platform's settings.

| Why |
|---|
| a capability that fails silently tells the person nothing, and a request once refused is often not shown again, so the settings are their only way back. |
