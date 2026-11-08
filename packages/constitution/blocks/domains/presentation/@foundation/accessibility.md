# Accessibility

> Governs what every person can do with the interface whatever their sight, hearing, movement or attention, and how the specs prove it.

## Vocabulary

A **toast** is a notice that appears over the screen and goes away.

A **layout unit** is the unit a platform lays out its screens in, one size whatever the density of the screen's pixels, such as the reference pixel a browser lays out a page in, or an app's point or density-independent pixel.

## Conformance

### wcag-aa-conformance · MUST

Every user interface meets WCAG 2.2 at level AA. Exempt: the criteria that rules of their own hold whole, which are Link Purpose (In Context), Use of Color, Keyboard, Label in Name, Focus Order, Focus Visible, Focus Not Obscured (Minimum), Target Size (Minimum), Dragging Movements, Content on Hover or Focus, Orientation, Timing Adjustable, Contrast (Minimum), Non-text Contrast, Status Messages, Consistent Identification, Consistent Help, Error Suggestion, Language of Page, Language of Parts, Identify Input Purpose, Redundant Entry and Accessible Authentication (Minimum).

| Why |
|---|
| an interface below that bar shuts out the people who rely on assistive technology, and breaks the accessibility laws that cite it, the European Accessibility Act through EN 301 549 among them — WCAG 2.2, level AA. |

### accessibility-statement-published · MUST

Where the law of its region asks for one, every product published to the public states its accessibility. The statement says what the product conforms to, its known gaps and how to report a barrier.

| Why |
|---|
| without it a user cannot tell what to expect or where to report a barrier, and a product the EU's Web Accessibility Directive or European Accessibility Act covers breaks the law that asks for it. |

## Semantics and names

### native-semantics-first · MUST

Every control and structure is built on the platform's native semantic element where one exists for it. A role or a state is added to another element only where no native element exists, and a generic container never takes a press handler. Exempt: a complex pattern built on the active library of accessible component primitives.

| Why |
|---|
| a control built on a generic element lacks the role and the keyboard a native one brings, so a keyboard or screen-reader user meets a control that is not there for them — the first rule of ARIA use. |

### added-role-true-to-its-element · MUST

Every role and state added to an element is true of it: the role is the one the element plays, and each state the one it is in.

| Why |
|---|
| a wrong role announces a control that is not there, and a stale state, such as a menu announced closed while it is open, misleads everyone who hears it — WCAG 2.2, Name, Role, Value. |

### every-control-has-an-accessible-name · MUST

Every control and field has an accessible name, an icon-only control included.

| Why |
|---|
| a screen reader announces a control by its name, so a control without one is announced only as "button" — WCAG 2.2, Name, Role, Value. |

### visible-label-in-accessible-name · MUST

Every control's accessible name contains its visible label, word for word.

| Why |
|---|
| a person who speaks to the device says the words they see, and a name that differs from the label leaves their command unmatched — WCAG 2.2, Label in Name. |

## Operation

### control-operable-by-every-input · MUST

Every interactive element works with every input the platform offers: the keyboard with no timing asked of a keystroke, a pointer, touch and assistive technology. Exempt: a function whose input depends on the path of the pointer's movement, which WCAG 2.2 exempts under Keyboard, such as a freehand stroke.

| Why |
|---|
| a mouse is not the only way people use an interface, and one control that needs it locks out everyone who uses another input — WCAG 2.2, Keyboard. |

### focus-layer-always-leavable · MUST

Every layer that holds focus is left by Escape or by its own close control.

| Why |
|---|
| a person whose focus is caught in a layer with no way out can use nothing else on the screen, and Escape is the way out such a person tries first — WCAG 2.2, No Keyboard Trap. |

### complex-pattern-follows-keyboard-conventions · MUST

Every complex pattern follows the platform's keyboard and focus conventions. Such conventions include focus that moves into a modal layer, stays in it while it is open and returns to what opened it; a layer that is not modal letting focus leave or closing when it does; and a tooltip and a combobox's list that never take focus.

| Why |
|---|
| a pattern that breaks these conventions leaves a keyboard or screen-reader user unable to enter, leave or move through a dialog or a menu, however carefully the program composes it. |

### focus-order-follows-the-visual-order · MUST

Every screen moves focus through its content in the order the content is seen.

| Why |
|---|
| focus that jumps around the screen cannot be followed, so a keyboard user loses their place — WCAG 2.2, Focus Order. |

### focus-always-visible · MUST

Every element focused from the keyboard shows that it has focus. No indicator of keyboard focus is removed without a replacement.

| Why |
|---|
| a keyboard user who cannot see focus does not know where they are — WCAG 2.2, Focus Visible. |

### focus-never-obscured · MUST

No focused element is entirely hidden by content the screen lays over it, such as a sticky header or a banner.

| Why |
|---|
| a keyboard user whose focus sits under content laid over it neither knows where they are nor sees what they are about to operate — WCAG 2.2, Focus Not Obscured (Minimum). |

### target-meets-the-minimum-size · MUST

Every pointer target is at least 24 × 24 layout units, its hit area counted. Exempt: a target WCAG 2.2 exempts under Target Size (Minimum), such as a link inside a sentence or an undersized target spaced as that criterion allows.

| Why |
|---|
| a target smaller than a fingertip or a tremor allows is missed and the wrong action runs, and on a platform other than the web the measure is that platform's density-independent unit — WCAG 2.2, Target Size (Minimum), and WCAG2ICT. |

### touch-target-at-least-40-layout-units · MUST

Wherever the primary pointer is touch, every pointer target is at least 40 × 40 layout units, its hit area counted. Exempt: a target WCAG 2.2 exempts under Target Size (Minimum) for a reason other than its spacing, such as a link inside a sentence or a control the user agent draws.

| Why |
|---|
| a finger covers far more than a cursor, so a target that a mouse hits at 24 is missed by a fingertip often enough to run the wrong action, and 40 is the project's floor: above the smallest control the phone platforms allow, short of the 44 to 48 they give as the default. |

### touch-target-at-least-48-layout-units · SHOULD

Wherever the primary pointer is touch, every pointer target is at least 48 × 48 layout units, its hit area counted. Exempt: a target WCAG 2.2 exempts under Target Size (Minimum) for a reason other than its spacing, such as a link inside a sentence or a control the user agent draws.

| Why |
|---|
| a target near the 40 floor is still missed by a tremor or a thumb stretched across the screen, while 48, about 9 mm, clears every phone platform's default and WCAG's level AAA — WCAG 2.2, Target Size (Enhanced). |

### drag-has-a-single-pointer-alternative · MUST

Every drag has a single-pointer alternative: an action done by dragging can also be done with a single pointer, without dragging. Exempt: a drag WCAG 2.2 exempts under Dragging Movements, such as a freehand stroke.

| Why |
|---|
| a person who cannot hold a pointer down while moving it cannot do an action offered only by dragging — WCAG 2.2, Dragging Movements. |

### hover-content-reached-without-hover · MUST

All content that hover reveals is also reached by focus and by a tap or a long press. No action appears only on hover.

| Why |
|---|
| touch screens have no hover and keyboard users never produce one, so content or an action only hover reveals is out of their reach. |

### hover-content-dismissible · MUST

All content that hover or focus reveals can be dismissed without moving the pointer or focus, such as by Escape.

| Why |
|---|
| content laid over the screen that only moving away dismisses hides what a person magnifying the screen came to read — WCAG 2.2, Content on Hover or Focus. |

### hover-content-stays-under-the-pointer · MUST

All content that hover reveals stays while the pointer moves onto it and rests over it.

| Why |
|---|
| content that vanishes as the pointer moves to it cannot be read by a person who magnifies the screen and must move the pointer to see it — WCAG 2.2, Content on Hover or Focus. |

### hover-content-persists · MUST

All content that hover or focus reveals stays until it is dismissed, its trigger is left or it is no longer relevant.

| Why |
|---|
| content that disappears on a timer is gone before a slow reader finishes it — WCAG 2.2, Content on Hover or Focus. |

### orientation-never-locked · MUST

No screen locks its orientation; each works in portrait and in landscape. Exempt: a screen to which one orientation is essential, such as a piano keyboard or a cheque to photograph.

| Why |
|---|
| a person whose device is mounted in one orientation cannot turn it, so a locked screen shuts them out — WCAG 2.2, Orientation. |

### time-limit-adjustable · MUST

Every time limit the user did not set can be turned off, adjusted to at least ten times its default, or extended. Such limits include a session that expires and a form that times out. A limit offered for extension warns at least 20 seconds before it ends and is extended by a simple action, at least ten times. Exempt: a limit WCAG 2.2 exempts under Timing Adjustable, such as one of a real-time event or one that is essential.

| Why |
|---|
| a person who reads, types or moves slowly loses their work to a limit they never saw coming — WCAG 2.2, Timing Adjustable. |

## Perception

### content-meets-the-contrast-minimum · MUST

All text contrasts with its background by at least 4.5:1 in every theme mode, and large text by 3:1. Exempt: text WCAG 2.2 exempts under Contrast (Minimum), such as a logotype or an inactive control's label.

| Why |
|---|
| a reader who cannot see the text cannot read the screen, and low contrast is the accessibility failure met most often — WCAG 2.2, Contrast (Minimum). |

### control-meets-the-non-text-contrast-minimum · MUST

Every control and every graphic needed to understand the content contrasts with its surroundings by at least 3:1, in every theme mode. That holds for the boundaries and states that identify a control, the focus indicator, and the parts of such a graphic, such as a status icon or a chart's lines. Exempt: what WCAG 2.2 exempts under Non-text Contrast, such as an inactive control, a control whose look the platform sets unchanged, or a logo, a photograph or another graphic whose particular look is essential to what it conveys.

| Why |
|---|
| a person who cannot see a field's border, the focus or the line of a chart cannot find the control or read what the graphic shows — WCAG 2.2, Non-text Contrast. |

### reduced-motion-honoured · MUST

While the person asks for reduced motion, every motion that is not essential stops. A motion moves, scales or turns what the screen shows, and a fade is none.

| Why |
|---|
| motion makes some people ill, dizzy or unable to read on — WCAG 2.2, Animation from Interactions, a criterion of level AAA. |

### reduced-motion-keeps-its-feedback · MUST

While the person asks for reduced motion, every change a stopped motion carried is still shown, by a cut or a fade.

| Why |
|---|
| motion removed with the feedback it carried leaves the person unsure what changed or whether their action took. |

### status-changes-announced · MUST

Every error and change of status the interface shows is announced to assistive technology.

| Why |
|---|
| a change that is only shown is missed by everyone who cannot see it — WCAG 2.2, Status Messages. |

### announcement-interrupts-only-when-urgent · MUST

Only an urgent announcement interrupts what is being read, and every other waits its turn. An urgent one is one such as an error that stops the person's task.

| Why |
|---|
| an announcement that interrupts for every change cuts off what the person was hearing, until they can follow neither. |

### streamed-text-announced-once · MUST

No text that streams onto the screen is announced piece by piece: it sits outside every live region, and what assistive technology hears of it is its start and its end, as two changes of status. Such text arrives in pieces into one place, such as an answer generated as it streams or a log that follows its source.

| Why |
|---|
| a live region announces each change, and text streamed in hundreds of pieces becomes hundreds of interruptions. |

### toast-never-the-only-place · MUST

No toast is the only place that shows an error or the only path to an action.

| Why |
|---|
| a toast vanishes, steals no focus and is missed by many, so an error or an action that lives only in it is lost to them. |

### self-closing-toast-pauses-while-in-use · MUST

Every toast that closes by itself pauses while the pointer rests on it or it has focus.

| Why |
|---|
| a toast that closes while it is read or reached for takes its words with it before a slow reader or a keyboard user is done. |

## Understanding

### help-kept-in-the-same-place · MUST

Wherever help is offered on several screens, it sits in the same place on each, relative to the rest of the screen. Such help includes contact details, a contact form, a self-help page and a chat.

| Why |
|---|
| a person who needs help looks where they found it last, so help that moves is help they do not find — WCAG 2.2, Consistent Help. |

### screen-declares-its-language · MUST

Wherever the platform offers a way to declare it, every screen declares the language of its content.

| Why |
|---|
| a screen reader reads text in the language it is told, so a page in Ukrainian read with English rules is noise — WCAG 2.2, Language of Page. |

### passage-declares-its-own-language · MUST

Wherever the platform offers a way to declare it, every passage in a language other than its screen's declares its own. Exempt: what WCAG 2.2 exempts under Language of Parts, such as a proper name, a technical term, a word of indeterminate language or one that has become part of the screen's language.

| Why |
|---|
| a quotation or a phrase in another language read with the screen's rules is spoken past recognition — WCAG 2.2, Language of Parts. |

## Proof

### rendered-state-scanned-for-accessibility-once · MUST

Each state the interface renders is scanned for accessibility once, and passes with no violation. The scan runs in the narrowest spec the platform renders the state in: a component's states in the component's spec where the platform renders a component alone, the states a screen adds in the screen's.

| Why |
|---|
| a state never scanned ships the violations a tool would have caught on every change, before a person meets them, and one scanned in every spec that renders it costs a run for no problem the first scan missed. |

### unscannable-criterion-proven-where-it-renders · MUST

Every accessibility criterion a spec's environment cannot judge is proven where the platform renders or by a test of its deciding values. Contrast in a simulated document is such a criterion.

| Why |
|---|
| a scan in an environment that computes no layout or colour passes such a criterion whatever the screen shows, so its violation ships unseen. |

### accessibility-violation-reported-with-its-element · SHOULD

Every violation an automated accessibility check finds is reported with the element it was found on.

| Why |
|---|
| a check that names no element leaves each violation to be hunted through the screen. |
