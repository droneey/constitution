# Forms

> Governs a form: its fields, validation and submission.

## Fields

### field-declares-its-kind · MUST

A field declares the kind of value it takes — an email address, a number, a telephone number, a one-time code — and, for the user's own data, its purpose, so the platform offers the right keyboard and can fill it in.

| Why |
|---|
| a field that hides its kind gets the wrong keyboard, no autofill and no announcement of its purpose, and the user types by hand what the device already knows. |

### field-accepts-paste-and-autofill · MUST

A field accepts pasting and a password manager's filling, and a one-time code field accepts the code the platform offers.

| Why |
|---|
| blocking them fails sign-in without a memory test, and pushes people to weaker passwords. |

### entered-information-never-asked-twice · MUST

Information a person already entered in the same process is filled in or offered for selection, never asked for again, save where entering it again is essential.

| Why |
|---|
| a person who must type the same thing twice makes mistakes and gives up, and WCAG 2.2 counts it a failure. |

## Validation

### field-revalidated-as-fixed · SHOULD

A field is first validated when it is left or its form is submitted, never while it is first typed in; once it shows an error, it is validated on every input, so the error clears as soon as the value is right.

| Why |
|---|
| a user told off while still typing learns to ignore the message, and one whose error stays after the fix does not know it is fixed. |

### form-validated-by-its-own-schema · SHOULD

A form validates its fields through its own schema, the one that also shapes what it sends.

| Why |
|---|
| the form refuses bad input before it is sent, by the same rules that decide what it sends. |

### field-error-says-how-to-fix · MUST

A field's error says what is wrong and how to put it right — the format expected, the range allowed — unless saying so would weaken security.

| Why |
|---|
| an error that only says the value is invalid leaves the user guessing until they give up. |

### failed-submit-focuses-the-first-error · MUST

A failed submit moves focus to the first invalid field, or to a summary that links to each.

| Why |
|---|
| the user lands on what to fix instead of hunting for it. |

## Submission

### submit-never-disabled-by-an-invalid-form · SHOULD

A submit control is never disabled while its form is not yet valid: a submit of such a form is answered by its errors.

| Why |
|---|
| a disabled submit tells nobody what is missing, and a user left facing it cannot find which field holds them back. |

### form-submits-once · MUST

A form submits once: while a submit is in flight, a repeated submit is ignored.

| Why |
|---|
| a second submit sends the order twice, or races the first and shows the result of neither. |

### submit-busy-keeps-its-focus · SHOULD

A submit control shows it is busy while its form submits, with a busy label, and keeps its focus.

| Why |
|---|
| a control taken out of reach drops focus to the page and says nothing; a busy one keeps both. |

## Unsaved input

### unsaved-input-guarded-on-leave · SHOULD

Input the user has not saved survives a navigation away: the screen asks before discarding it, or keeps it as a draft to return to.

| Why |
|---|
| a tap on the wrong link otherwise throws away minutes of typing. |
