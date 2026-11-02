# Speed

> Governs how fast a screen feels: what it shows while it loads, the images it fetches and how it answers input.

## Loading

### loading-never-replaces-shown-content · SHOULD

Loading never replaces content already shown. Content a screen shows stays in place while it reloads or the screen moves to its next state; a reload never swaps it for a loading indicator.

| Why |
|---|
| content that blinks to a placeholder on every refresh reads as a failure, and the user loses their place. |

### loading-indicator-delayed-and-held · SHOULD

A loading indicator is delayed, and once shown it is held. It appears only once a load outlasts a delay the project sets, and stays for a minimum the project sets, so a fast load shows none and a slow one never flashes.

| Why |
|---|
| below about a second a wait needs no sign, and an indicator that flashes for a moment reads as a glitch and makes the screen feel slower than it is. |

### late-content-reserves-its-space · SHOULD

Late content reserves its space. Content that arrives after the screen is drawn — data, an image, an embed, a notice — has its space reserved before it arrives, by its indicator or its declared size, so nothing already shown moves.

| Why |
|---|
| a layout that jumps when content lands makes the user lose their place or press what slid under their finger. |

### long-work-shows-its-progress · SHOULD

Long work shows its progress. A screen whose work a user waits on past a bound the project sets names what it is doing and shows how far it has come — the share done, the current step or the time left — wherever the program knows it.

| Why |
|---|
| a wait with no name and no progress looks like a hang, and the user leaves or starts the work again. |

## Images

### image-sharp-at-the-pixel-density · SHOULD

Every image a screen shows is fetched for the screen's pixel density: sharp, and never larger than that density needs.

| Why |
|---|
| one image size is blurry on a dense screen and wasteful on a plain one. |

## Response

### felt-speed-measured-in-the-field-within-budget · SHOULD

The interface's felt speed is measured in the field and kept within a budget. That speed — the wait for its main content, the answer to their input, the stillness of what it shows — is taken at the 75th percentile of real uses, and the budget is one the project sets.

| Why |
|---|
| a fast developer's machine hides the slow devices and networks people use, and the 75th percentile counts the slow quarter an average smooths away. |

### interaction-answered-before-its-work · SHOULD

An interaction is answered before its work. It shows its first visible response — a pressed state, an opened layer, a busy mark — before the work it starts, within a bound the project sets, and long work runs after that response without blocking the next input.

| Why |
|---|
| a press that shows nothing reads as missed, so the user presses again or leaves. |

### fast-source-updates-once-per-frame · SHOULD

A fast source updates a screen's state at most once a frame. Such a source — a resize, a scroll, a stream — has its events folded in batches.

| Why |
|---|
| dozens of updates a second redraw nothing the user can see and starve everything else. |

### frequent-interaction-never-waits-on-motion · SHOULD

A frequent interaction never waits on motion. A layer the user opens many times a session — a menu, a command palette — opens without an entrance animation, and no animation stands between an action and its result.

| Why |
|---|
| an animation seen for the hundredth time is only a wait, and a result held back by motion makes the interface slow however fast its work is. |

### long-lists-virtualised · SHOULD

A list whose length the product does not bound renders only the rows in view and those near them, or is paged.

| Why |
|---|
| a list that mounts every row at once grows slower with every item, and a long one freezes the device. |
