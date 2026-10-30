# Copy

> Governs the words a person reads on a screen: how they address the reader, their case and punctuation, and the labels of controls.

## Voice

### text-addresses-the-reader-as-you · SHOULD

Text a person reads speaks to them as `you`, never as `the user`, and in a language with a formal and an informal `you`, in the one form the product chose.

| Why |
|---|
| text that talks about `the user` talks past the person reading it, and two forms of address read as two products. |

### text-written-in-sentence-case · SHOULD

Text a person reads is written in sentence case, with only the capitals its language gives it.

| Why |
|---|
| one case reads as one voice, and a translator keeps the case the source shows. |

### text-uses-the-locales-punctuation · SHOULD

Text a person reads uses its locale's typographic punctuation — its quotation marks, `«…»` in Ukrainian, `„…”` in Polish, `“…”` in English; its apostrophe, `’` in English and `ʼ` in Ukrainian; its dashes, `–` for a range and the dash its language sets an aside with; and the ellipsis `…` — never straight quotes, a hyphen for a dash or three dots.

| Why |
|---|
| typed punctuation reads as unfinished text, and each language quotes in its own marks. |

## Labels

### button-names-its-result · SHOULD

A button names its result, verb and object — never "Submit" or "OK". "Cancel" and "Close" serve a secondary action, and one label such as "Continue" moves a flow to its next step; a confirmation of a destructive action names the action; a payment button shows the amount.

| Why |
|---|
| a person reads the button to know what will happen; a vague label makes them guess. |

### same-action-same-label · MUST

A control that does the same thing on several screens or steps carries the same label on each.

| Why |
|---|
| a user knows a control by its name, so a new name for the same action reads as a new action. |

### switch-labelled-by-its-on-state · SHOULD

A switch or a checkbox is labelled by what it does when it is on, never by a negation: "Send notifications", never "Disable notifications" or "Don't send notifications".

| Why |
|---|
| a negated label turned off is a double negative, which the user must work out before they dare touch it. |
