# Screens

> Governs a screen: its states, its address and view state, and the permissions it asks for.

## States

### data-view-shows-every-state · MUST

A data view shows every state its data can have. Those are loading, failure, content, and the empty or not-found state where its data can be empty or missing; no default stands in for data not yet loaded.

| Why |
|---|
| an empty view cannot otherwise be told from a slow or a broken one, and an invented default hides loading and failure behind something that looks like data, so the user does not know what to do. |

### data-call-returns-a-union-of-its-states → illegal-state-unrepresentable · MUST

What a screen or a widget calls to read or write data returns a union of the states its operation has. The union holds no other state, or the call suspends to a boundary above it that shows the waiting and the failed states; the data exists only in the success state, or beside the error when a reload of data already shown fails.

| Why |
|---|
| a bag of flags allows combinations no state has, which a screen then renders, and data dropped on a failed reload blanks a screen that had something to show — make illegal states unrepresentable. |

### failure-contained-to-its-screen · MUST

A failure while a screen loads or renders costs that screen alone. The screen shows it in its own place, and the rest of the program stays usable.

| Why |
|---|
| a failure that escapes its screen leaves the user a blank page, with the parts that still work out of reach. |

### empty-state-offers-an-action · SHOULD

An empty state offers an action. It names the situation, and a state with no results repeats the query.

| Why |
|---|
| each is a moment the user decides what to do next, and a blank area leaves them stuck. |

## Address and view state

### address-parsed-as-untrusted-input → outside-value-untyped-until-parsed · MUST

A screen's address is parsed as untrusted input. Its path and its parameters, in a URL or a deep link, reach the screen only after a schema parses them; an address that fails the parse opens the screen with its defaults or a fallback screen, never a crash or a half-filled one.

| Why |
|---|
| anyone can write a link and send it to the user, so a malformed address read unparsed crashes the screen or fills it with nonsense — parse, don't validate. |

### address-only-opens-a-screen · MUST

A link only opens a screen. That holds for a URL and a deep link alike: it opens its screen with its parameters, and performs no action — a payment, a send, a change of settings — until the user confirms it there.

| Why |
|---|
| anyone can craft a link and get it tapped, so a link that acts at once acts for its author, not for the user. |

### address-write-keeps-the-other-parameters · MUST

A write to a screen's address changes only the parameter it is for. Every other parameter stays as it was.

| Why |
|---|
| a screen that changes its page must keep the filter another piece set, or the link no longer reproduces the view the user built. |

### view-state-kept-in-the-navigation-state → fact-has-one-source · MUST

View state a link or a restart must reproduce lives in the platform's navigation state. Such state includes a filter, a sort, a page and the open tab.

| Why |
|---|
| state a link must carry is lost on reload or shared by accident anywhere else — a single source of truth. |

### unknown-address-shows-the-not-found-screen · SHOULD

An address no screen answers shows the program's not-found screen. That screen is not the not-found state of a view whose data is missing.

| Why |
|---|
| a mistyped or stale link otherwise ends on a blank page or an error, and the user cannot tell a wrong address from a broken program. |

## Permissions

### permission-asked-in-context · SHOULD

A permission the platform asks the person for is requested in context, and its refusal costs only the capability that needs it. It is requested when they first reach the capability that needs it, after the screen says why, never at start; a refusal leaves every other capability working, and the capability that needs it says what it lacks and how to grant it in the platform's settings.

| Why |
|---|
| a person grants what they understand at the moment it is needed, a request out of context is refused for good, and a capability that fails silently tells them nothing. |
