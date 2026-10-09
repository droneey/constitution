# Accessibility

> Governs what every person must be able to do with the interface.

## Conformance

### wcag-aa-conformance · MUST
Every user interface meets WCAG 2.2 at level AA; the rules of this block name the criteria most often missed, and none of them lowers that bar.

| Why | Tags |
|---|---|
| one measurable bar serves people and the tools that check for them; EN 301 549 v4.1.1 adopts it for the European Union once the Official Journal cites it, v3.2.1 and WCAG 2.1 until then. | [a11y] |

### accessibility-statement-published · SHOULD
A product published to the public states its accessibility: what it conforms to, its known gaps, and how to report a barrier.

| Why | Tags |
|---|---|
| users learn what to expect and where to turn, and European law asks it of products in its scope. | [a11y] |

## Semantics and names

### native-semantics-first · MUST
Native semantic elements come first; roles and states are added only where no native element exists, and only correct ones. A generic container never takes a press handler.

| Why | Tags |
|---|---|
| a native element brings its role and keyboard for free; a wrong role is worse than none. | [a11y] |

### every-control-has-an-accessible-name · MUST
Every control and field has an accessible name. A field has a visible label — a placeholder is only an example — and a hint where its format is not obvious; an icon-only control is named; a meaningful image has alternative text, and a decorative one is hidden.

| Why | Tags |
|---|---|
| a screen reader announces a control by its name; without one, it says only "button". | [a11y] |

### visible-label-in-accessible-name · MUST
A control's accessible name contains its visible label, word for word, best at its start.

| Why | Tags |
|---|---|
| a person who speaks to the device says the words they see, and a name that differs from the label leaves their command unmatched. | [a11y] |

### headings-in-order · SHOULD
Headings go in order, and no level is skipped.

| Why | Tags |
|---|---|
| screen reader users navigate by headings, and a skipped level reads as a missing section. | [a11y] |

## Operation

### control-operable-by-every-input · MUST
Every interactive element works with every input the platform offers — keyboard, pointer, touch, assistive technology — and a layer that holds focus is left by Escape or by its own close control.

| Why | Tags |
|---|---|
| a mouse is not the only way people use an interface, and one control that needs it, or a layer with no way out, locks them out. | [a11y] |

### focus-order-follows-the-visual-order · MUST
Focus moves through a screen in the order its content is seen.

| Why | Tags |
|---|---|
| focus that jumps around the screen cannot be followed, and a keyboard user loses their place. | [a11y] |

### focus-always-visible · MUST
Focus is always visible, and never hidden by content the page lays over it, such as a sticky header; no focus indicator is removed without a replacement that meets the contrast its indicator needs.

| Why | Tags |
|---|---|
| a keyboard user who cannot see focus does not know where they are. | [a11y] |

### target-meets-the-minimum-size · MUST
Every pointer target meets the minimum size WCAG 2.2 sets, in the platform's unit and its spacing counted, with its exceptions such as a link inside a sentence, or the platform's own minimum where that is larger.

| Why | Tags |
|---|---|
| a target smaller than a finger or a tremor allows is missed, and the wrong action runs. | [a11y, ux] |

### drag-has-a-single-pointer-alternative · MUST
Every action done by dragging can also be done with a single pointer, without dragging.

| Why | Tags |
|---|---|
| a person who cannot hold a pointer down while moving it needs another way to move the item. | [a11y] |

### hover-content-reachable-and-dismissible · MUST
Content that hover reveals is reachable by focus and by a tap or a long press, can be dismissed without moving the pointer or focus, can itself be hovered, and stays until it is dismissed or no longer relevant; no action appears only on hover.

| Why | Tags |
|---|---|
| touch screens have no hover, keyboard users never produce one, and content that vanishes as it is reached for cannot be read. | [a11y, ux] |

### orientation-never-locked · MUST
A screen works in portrait and in landscape and never locks its orientation, unless one orientation is essential — a piano keyboard, a cheque to photograph.

| Why | Tags |
|---|---|
| a person whose device is mounted in one orientation cannot turn it. | [a11y] |

### time-limit-warned-and-extendable · MUST
A time limit the user did not set — a session that expires, a form that times out — can be turned off or adjusted, or warns at least 20 seconds before it ends and is extended by a simple action, at least ten times; a limit an event in real time imposes, one longer than twenty hours, or one essential to the activity is exempt, as WCAG 2.2.1 says.

| Why | Tags |
|---|---|
| a person who reads, types or moves slowly loses their work to a limit they never saw coming. | [a11y, ux] |

## Perception

### meaning-never-carried-by-colour-alone · MUST
Meaning is never carried by colour alone: a status colour comes with an icon or a word.

| Why | Tags |
|---|---|
| colour-blind users and monochrome screens lose whatever colour alone says. | [a11y, ux] |

### text-and-controls-meet-the-contrast-minimum · MUST
Text contrasts with its background by at least 4.5:1, large text by 3:1, and the boundaries and states that identify a control, and the focus indicator, by 3:1, in every mode.

| Why | Tags |
|---|---|
| low contrast is the failure of WCAG met most often, and a reader who cannot see the text cannot use the screen. | [a11y] |

### reduced-motion-honoured · MUST
When the user asks for reduced motion, motion that is not essential stops, and a change it carried is shown by a cut or a fade instead, so no feedback is lost.

| Why | Tags |
|---|---|
| motion makes some people ill, and removing it with its feedback leaves them unsure what changed. | [a11y] |

### status-changes-announced · MUST
Errors and changes of status are announced: an urgent one interrupts, the rest wait their turn. An invalid field is marked invalid and tied to its message.

| Why | Tags |
|---|---|
| a change that is only shown is missed by everyone who cannot see it. | [a11y, ux] |

### toast-never-the-only-copy · MUST
A toast never holds the only copy of an error or the only path to an action, and one that closes by itself can be paused or stays long enough to read.

| Why | Tags |
|---|---|
| a toast vanishes, steals no focus and is missed by many; what matters must also live where the user acts. | [a11y, ux] |

## Understanding

### help-kept-in-the-same-place · MUST
Help offered on several screens — contact details, a contact form, a self-help page, a chat — sits in the same place relative to the rest of each screen.

| Why | Tags |
|---|---|
| a person who needs help looks where they found it last, and help that moves is help they do not find. | [a11y, ux] |

### screen-declares-its-language · MUST
A screen declares the language of its content, and a passage in another language declares its own.

| Why | Tags |
|---|---|
| a screen reader reads text in the language it is told, and a page in Ukrainian read with English rules is noise. | [a11y] |
