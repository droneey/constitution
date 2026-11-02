# Accessibility

> Governs what every person must be able to do with the interface, and how the specs prove it.

## Conformance

### wcag-aa-conformance · MUST

Every user interface meets WCAG 2.2 at level AA. The rules of this block name the criteria most often missed, and none of them lowers that bar.

| Why |
|---|
| an interface below that bar shuts out the people who rely on assistive technology, and breaks the accessibility laws that cite it, the European Accessibility Act through EN 301 549 among them — WCAG 2.2, level AA. |

### accessibility-statement-published · MUST

A product published to the public states its accessibility where the law of its region asks for it. The statement says what the product conforms to, its known gaps, and how to report a barrier.

| Why |
|---|
| without it a user cannot tell what to expect or where to report a barrier, and a product the EU's Web Accessibility Directive or European Accessibility Act covers breaks the law that asks for it. |

## Semantics and names

### native-semantics-first · MUST

Native semantic elements come first. Roles and states are added only where no native element exists, and only correct ones; a generic container never takes a press handler.

| Why |
|---|
| a control built on a generic element lacks the role and the keyboard a native one brings, and a wrong role announces a control that is not there — the first rule of ARIA use. |

### every-control-has-an-accessible-name · MUST

Every control and field has an accessible name. A field has a visible label — a placeholder is only an example — and a hint where its format is not obvious; an icon-only control is named.

| Why |
|---|
| a screen reader announces a control by its name, so a control without one is announced only as "button" — WCAG 2.2, Name, Role, Value. |

### non-text-content-has-a-text-alternative · MUST

Non-text content has a text alternative. A meaningful image has alternative text, a chart or a diagram one that states what it shows — its data as a table or its finding in a sentence — and a decorative image is hidden from assistive technology.

| Why |
|---|
| a person who cannot see an image without its alternative loses what it says, a one-word label on a chart tells them nothing of its data, and a decorative image left in the way is announced as noise — WCAG 2.2, Non-text Content. |

### visible-label-in-accessible-name · MUST

A control's accessible name contains its visible label, word for word.

| Why |
|---|
| a person who speaks to the device says the words they see, and a name that differs from the label leaves their command unmatched — WCAG 2.2, Label in Name. |

### link-names-its-destination · MUST

A link's text says where the link leads. It says so read alone or with the sentence, list item or table cell that holds it, and is never `here`, `this`, `more` or the bare address.

| Why |
|---|
| readers scan links, and a screen reader lists them out of their sentence, where `more` tells nothing — WCAG 2.2, Link Purpose (In Context). |

### headings-in-order · MUST

Headings go in order, and no level is skipped.

| Why |
|---|
| screen reader users navigate by headings, and a skipped level reads as a missing section — WCAG 2.2, Info and Relationships. |

## Operation

### control-operable-by-every-input · MUST

Every interactive element works with every input the platform offers. Those inputs are the keyboard, a pointer, touch and assistive technology, and a layer that holds focus is left by Escape or by its own close control.

| Why |
|---|
| a mouse is not the only way people use an interface, and one control that needs it, or a layer with no way out, locks them out — WCAG 2.2, Keyboard and No Keyboard Trap. |

### focus-order-follows-the-visual-order · MUST

Focus moves through a screen in the order its content is seen.

| Why |
|---|
| focus that jumps around the screen cannot be followed, so a keyboard user loses their place — WCAG 2.2, Focus Order. |

### focus-always-visible · MUST

Focus is always visible. It is never hidden by content the page lays over it, such as a sticky header, and no focus indicator is removed without a replacement that meets the contrast its indicator needs.

| Why |
|---|
| a keyboard user who cannot see focus, or whose focus sits under content laid over it, does not know where they are — WCAG 2.2, Focus Visible and Focus Not Obscured (Minimum). |

### target-meets-the-minimum-size · MUST

Every pointer target meets the minimum size. That is the size WCAG 2.2 sets, in the platform's unit and its spacing counted, with its exceptions such as a link inside a sentence, or the platform's own minimum where that is larger.

| Why |
|---|
| a target smaller than a finger or a tremor allows is missed and the wrong action runs — WCAG 2.2, Target Size (Minimum). |

### drag-has-a-single-pointer-alternative · MUST

Every drag has a single-pointer alternative. An action done by dragging can also be done with a single pointer, without dragging.

| Why |
|---|
| a person who cannot hold a pointer down while moving it cannot do an action offered only by dragging — WCAG 2.2, Dragging Movements. |

### hover-content-reachable-and-dismissible · MUST

Content that hover reveals is reachable and dismissible. It is reached by focus and by a tap or a long press, can be dismissed without moving the pointer or focus, can itself be hovered, and stays until it is dismissed or no longer relevant; no action appears only on hover.

| Why |
|---|
| touch screens have no hover, keyboard users never produce one, and content that vanishes as it is reached for cannot be read — WCAG 2.2, Content on Hover or Focus. |

### orientation-never-locked · MUST

A screen never locks its orientation. It works in portrait and in landscape, unless one orientation is essential — a piano keyboard, a cheque to photograph.

| Why |
|---|
| a person whose device is mounted in one orientation cannot turn it, so a locked screen shuts them out — WCAG 2.2, Orientation. |

### time-limit-warned-and-extendable · MUST

A time limit the user did not set can be turned off, adjusted or extended. That holds for a session that expires or a form that times out; a limit that is extended warns at least 20 seconds before it ends and is extended by a simple action, at least ten times, save the exceptions WCAG 2.2.1 lists.

| Why |
|---|
| a person who reads, types or moves slowly loses their work to a limit they never saw coming — WCAG 2.2, Timing Adjustable. |

## Perception

### meaning-never-carried-by-colour-alone · MUST

Meaning is never carried by colour alone. A status colour comes with an icon or a word.

| Why |
|---|
| colour-blind users and monochrome screens lose whatever colour alone says — WCAG 2.2, Use of Color. |

### text-and-controls-meet-the-contrast-minimum · MUST

Text and controls meet the contrast minimum, in every mode. Text contrasts with its background by at least 4.5:1, large text by 3:1, and the boundaries and states that identify a control, and the focus indicator, by 3:1.

| Why |
|---|
| a reader who cannot see the text or the control cannot use the screen, and low contrast is the accessibility failure met most often — WCAG 2.2, Contrast (Minimum) and Non-text Contrast. |

### reduced-motion-honoured · MUST

A request for reduced motion is honoured. When the user asks for it, motion that is not essential stops, and a change it carried is shown by a cut or a fade instead, so no feedback is lost.

| Why |
|---|
| motion makes some people ill, and removing it with its feedback leaves them unsure what changed — WCAG 2.2, Animation from Interactions, a criterion of level AAA. |

### status-changes-announced · MUST

Errors and changes of status are announced. An urgent one interrupts, the rest wait their turn, and an invalid field is marked invalid and tied to its message.

| Why |
|---|
| a change that is only shown is missed by everyone who cannot see it — WCAG 2.2, Status Messages. |

### toast-never-the-only-copy · MUST

A toast never holds the only copy of an error or the only path to an action. One that closes by itself pauses while the pointer rests on it or it has focus.

| Why |
|---|
| a toast vanishes, steals no focus and is missed by many, so an error or an action that lives only in it is lost to them. |

## Understanding

### help-kept-in-the-same-place · MUST

Help offered on several screens sits in the same place on each. Such help — contact details, a contact form, a self-help page, a chat — keeps its place relative to the rest of each screen.

| Why |
|---|
| a person who needs help looks where they found it last, so help that moves is help they do not find — WCAG 2.2, Consistent Help. |

### screen-declares-its-language · MUST

A screen declares the language of its content, and a passage in another language declares its own. It declares them wherever the platform offers a way to.

| Why |
|---|
| a screen reader reads text in the language it is told, so a page in Ukrainian read with English rules is noise — WCAG 2.2, Language of Page and Language of Parts. |

## Proof

### rendered-state-scanned-for-accessibility-once · MUST

Each state the interface renders is scanned for accessibility once. The scan runs in the spec of the narrowest unit that renders the state — a component's states in the component's spec, the states a screen adds in the screen's — and passes with zero violations; a rule that spec's environment cannot judge, such as contrast in a simulated document, is proven where the platform renders, or by a test over the values that decide it.

| Why |
|---|
| a state never scanned ships the violations a tool would have caught on every change, before a person meets them, and one scanned in every spec that renders it costs a run for no problem the first scan missed. |

### interactive-checked-by-hand · SHOULD

A new interactive component is checked by hand before it ships. A person operates it with the keyboard or a switch, and with a screen reader: Tab reaches it in visual order, Enter and Space activate it, Escape closes what it opened, and focus returns to what opened it.

| Why |
|---|
| tools see about half of the problems, so a component shipped on their word alone brings the other half to its users. |

## Requirements for implementation

### a11y-scanner-runs-inside-a-spec · MUST

The scanner runs over the rendered tree inside a spec. It covers the WCAG 2.2 A and AA rules it can decide, and reports each violation with its element.

| Why |
|---|
| a library whose scanner cannot run over a spec's rendered tree leaves each state unscanned until a person meets its violations, and one that names no element leaves each violation to be hunted through the page. |
