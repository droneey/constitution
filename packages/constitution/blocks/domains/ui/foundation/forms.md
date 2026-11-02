# Forms

> Governs a form: its fields, validation and submission.

## Fields

### field-declares-its-kind · MUST

A field declares the kind of value it takes. The kind is an email address, a number, a telephone number, a one-time code and the like, and for the user's own data the field declares its purpose too, so the platform offers the right keyboard and can fill it in; it declares them wherever the platform offers a way to.

| Why |
|---|
| a field that hides its kind gets the wrong keyboard, no autofill and no announcement of its purpose, and the user types by hand what the device already knows — WCAG 2.2, Identify Input Purpose. |

### field-accepts-paste-and-autofill · MUST

A field accepts pasting and autofill. It accepts a password manager's filling, and a one-time code field accepts the code the platform offers.

| Why |
|---|
| blocking them turns sign-in into a test of memory and pushes people to weaker passwords — WCAG 2.2, Accessible Authentication (Minimum). |

### entered-information-never-asked-twice · MUST

Information a person already entered in the same process is never asked for again. It is filled in or offered for selection, save where entering it again is essential.

| Why |
|---|
| a person who must type the same thing twice makes mistakes and gives up — WCAG 2.2, Redundant Entry. |

## Validation

### field-revalidated-as-fixed · SHOULD

A field is revalidated as it is fixed. It is first validated when it is left or its form is submitted, never while it is first typed in; once it shows an error, it is validated on every input, so the error clears as soon as the value is right.

| Why |
|---|
| a user told off while still typing learns to ignore the message, and one whose error stays after the fix does not know it is fixed. |

### form-validated-by-its-own-schema · SHOULD

A form validates its fields through its own schema. That schema also shapes what the form sends.

| Why |
|---|
| a form checked by other rules than those that shape what it sends lets through input the send then refuses, or refuses input the send would take. |

### field-error-says-how-to-fix · MUST

A field's error says how to fix it. It says what is wrong and how to put it right — the format expected, the range allowed — unless saying so would weaken security.

| Why |
|---|
| an error that only says the value is invalid leaves the user guessing until they give up — WCAG 2.2, Error Suggestion. |

### failed-submit-focuses-the-first-error · MUST

A failed submit moves focus to the first invalid field, or to a summary that links to each.

| Why |
|---|
| a failed submit that leaves focus where it was leaves the user hunting the form for what to fix. |

## Submission

### submit-never-disabled-by-an-invalid-form · SHOULD

A submit control is never disabled while its form is not yet valid. Pressed on such a form, it is answered by the form's errors.

| Why |
|---|
| a disabled submit tells nobody what is missing, and a user left facing it cannot find which field holds them back. |

### form-submits-once · MUST

A form submits once. While a submit is in flight, a repeated submit is ignored.

| Why |
|---|
| a second submit sends the order twice, or races the first and shows the result of neither. |

### submit-busy-keeps-its-focus · SHOULD

A busy submit control keeps its focus. It shows it is busy while its form submits, with a busy label.

| Why |
|---|
| a control taken out of reach drops focus to the page and says nothing; a busy one keeps both. |

## Unsaved input

### unsaved-input-guarded-on-leave · SHOULD

Input the user has not saved survives a navigation away. The screen asks before discarding it, or keeps it as a draft to return to.

| Why |
|---|
| a tap on the wrong link otherwise throws away minutes of typing. |
