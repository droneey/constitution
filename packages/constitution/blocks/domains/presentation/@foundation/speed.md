# Speed

> Governs how fast a screen feels: what it shows while it loads, the images it fetches and how it answers input.

## Loading

### loading-never-replaces-shown-content · SHOULD

No reload replaces content a screen already shows with a loading indicator: the content stays in place while it reloads or the screen moves to its next state.

| Why |
|---|
| content that blinks to a placeholder on every refresh reads as a failure, and the user loses their place. |

### loading-indicator-delayed · SHOULD

Every indicator of a data load appears only once the load outlasts a delay the project sets. A fast load then shows none.

| Why |
|---|
| below about a second a wait needs no sign, and an indicator flashed for a fast load reads as a glitch. |

### loading-indicator-held-once-shown · SHOULD

Every indicator of a data load stays, once shown, for a minimum the project sets, so it never flashes.

| Why |
|---|
| an indicator that vanishes a moment after it appears reads as a glitch and makes the screen feel slower than it is. |

### late-content-reserves-its-space · SHOULD

All late content has its space reserved before it arrives, so nothing already shown moves. Late content arrives after the screen is drawn, such as data, an image, an embed or a notice, and its space is reserved from that first draw at its declared size, whether or not an indicator of its load shows yet.

| Why |
|---|
| a layout that jumps when content lands makes the user lose their place or press what slid under their finger. |

### long-work-named-while-it-runs · SHOULD

Every task a person waits on past a bound the project sets names what it is doing while it runs.

| Why |
|---|
| a wait with no name looks like a hang, and the person leaves or starts the work again. |

### long-work-shows-its-progress · SHOULD

Every task a person waits on past a bound the project sets shows how far it has come. It shows the share done, the current step or the time left, wherever the program knows it.

| Why |
|---|
| a wait with no progress gives the person no way to tell a slow task from a stuck one, so they give up on work about to finish. |

## Images

### image-sharp-at-the-pixel-density · SHOULD

Every image a screen shows is fetched for the screen's pixel density: sharp, and never larger than that density needs.

| Why |
|---|
| one image size is blurry on a dense screen and wasteful on a plain one. |

## Response

### felt-speed-measured-in-the-field-within-budget · SHOULD

The interface's felt speed stays within the project's budget, measured in the field at the 75th percentile of real uses. That speed is the wait for its main content, the answer to the person's input and the stillness of what it shows.

| Why |
|---|
| a fast developer's machine hides the slow devices and networks people use, and the 75th percentile counts the slow quarter an average smooths away. |

### interaction-answered-before-its-work · SHOULD

Every interaction shows its first visible response before the work it starts, within a bound the project sets. Such a response is a pressed state, an opened layer or a busy mark.

| Why |
|---|
| a press that shows nothing reads as missed, so the user presses again or leaves. |

### long-work-never-blocks-input · SHOULD

No work an interaction starts that lasts past a bound the project sets blocks the next input; it runs after the interaction's first response.

| Why |
|---|
| work that holds the screen still swallows the next press, so the person thinks the program froze and presses again. |

### fast-source-updates-once-per-frame · SHOULD

Every fast source updates a screen's state at most once a frame, its events folded in batches. Such sources include a resize, a scroll and a stream.

| Why |
|---|
| dozens of updates a second redraw nothing the user can see and starve everything else. |

### result-never-held-back-by-motion · SHOULD

No animation holds back the result of an action: the change the action makes takes effect, and what it opens takes input, while any animation of it plays.

| Why |
|---|
| a result held back by motion makes the interface slow however fast its work is. |

### frequent-interaction-never-waits-on-motion · SHOULD

Every layer the person opens many times a session, such as a menu or a command palette, opens without an entrance animation.

| Why |
|---|
| an animation seen for the hundredth time is only a wait, even one that holds nothing back. |

### long-lists-virtualised · SHOULD

Every list whose length the product does not bound renders only the rows in view and those near them, or is paged.

| Why |
|---|
| a list that mounts every row at once grows slower with every item, and a long one freezes the device. |
