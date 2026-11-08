# Forms

> Governs a form: its fields, validation and submission.

## Fields

### field-declares-its-kind · SHOULD

Wherever the platform offers a way to declare it, every field declares the kind of value it takes. Such kinds include an email address, a number, a telephone number and a one-time code.

| Why |
|---|
| a field that hides its kind gets the wrong keyboard and no announcement of what it takes, so the person types on a keyboard made for something else. |

### own-data-field-declares-its-purpose · MUST

Wherever the platform offers a way to, every field of the person's own data declares its purpose. Such data includes their name, their postal address and their email.

| Why |
|---|
| a field that hides its purpose cannot be filled in by the device, and the person types by hand what it already knows — WCAG 2.2, Identify Input Purpose. |

### field-labelled-visibly · MUST

Every field has a visible label. A placeholder is no label, only an example of the value.

| Why |
|---|
| a placeholder vanishes as the person types, so they forget what the field asked for, and many read it as a value already filled in — WCAG 2.2, Labels or Instructions. |

### field-shows-the-form-it-takes · MUST

Every field that takes only one of several forms of its value shows a hint of that form. Such a hint gives the order of a date or the length of a code.

| Why |
|---|
| a person who types a value in another form, such as a date in the order their country uses, is refused without knowing why — WCAG 2.2, Labels or Instructions. |

### field-never-blocks-paste-or-autofill · MUST

No field blocks pasting or autofill. A field accepts a password manager's filling, and a one-time code field accepts the code the platform offers.

| Why |
|---|
| blocking them turns sign-in into a test of memory and pushes people to weaker passwords — WCAG 2.2, Accessible Authentication (Minimum). |

### entered-information-never-asked-twice · MUST

No information a person entered in a process is asked for again in it; it is filled in or offered for selection. Exempt: information that entering again is essential to, information that entering again secures, such as a new password confirmed, and information that is no longer valid.

| Why |
|---|
| a person who must type the same thing twice makes mistakes and gives up — WCAG 2.2, Redundant Entry. |

## Validation

### field-first-validated-when-left · SHOULD

Every field is first validated when it is left or its form is submitted, never while it is first typed in.

| Why |
|---|
| a person told off while still typing learns to ignore the message. |

### field-revalidated-as-fixed · SHOULD

Every field that shows an error is validated on every input, so the error clears as soon as the value is right.

| Why |
|---|
| a person whose error stays after the fix does not know it is fixed, and fixes it again. |

### form-validated-by-its-own-schema · MUST

Every form checks its fields and shapes what it sends by one schema of its own.

| Why |
|---|
| a form checked by other rules than those that shape what it sends lets through input the send then refuses, or refuses input the send would take. |

### field-error-says-how-to-fix → failure-shown-as-what-happened-and-what-next · MUST

Every field's error says what is wrong and how to put it right, such as the format expected or the range allowed. Exempt: a hint that would weaken security or defeat the purpose of the field, such as which part of a sign-in was wrong or the answer to a test's question.

| Why |
|---|
| an error that only says the value is invalid leaves the person guessing until they give up — WCAG 2.2, Error Suggestion. |

### invalid-field-tells-its-error · MUST

Every invalid field tells assistive technology that it is invalid and which text describes its error.

| Why |
|---|
| a person who cannot see the field's mark or the error text beside it hears the field announced as valid, and cannot find what to fix — WCAG 2.2, Error Identification. |

### failed-submit-focuses-the-first-error · MUST

Every failed submit moves focus to the first invalid field, or to a summary that links to each.

| Why |
|---|
| a failed submit that leaves focus where it was leaves the person hunting the form for what to fix. |

## Submission

### submit-never-disabled-by-an-invalid-form · SHOULD

Every submit control pressed on an invalid form answers with the form's errors, never by being disabled before it is pressed.

| Why |
|---|
| a disabled submit tells nobody what is missing, and a person left facing it cannot find which field holds them back. |

### form-submits-once · MUST

Every form ignores a repeated submit while one is in flight.

| Why |
|---|
| a second submit sends the order twice, or races the first and shows the result of neither. |

### submit-busy-keeps-its-focus · SHOULD

Every submit control keeps its focus while its form submits.

| Why |
|---|
| a control taken out of reach while busy drops focus to the page, and the person must find their place again. |

### submit-shows-it-is-busy · SHOULD

Every submit control shows it is busy while its form submits, with a busy label.

| Why |
|---|
| a control that says nothing while its form submits looks ignored, so the person presses it again or leaves. |

## Unsaved input

### unsaved-input-guarded-on-leave · SHOULD

All input the person has not saved survives a navigation away: the screen asks before discarding it, or keeps it as a draft to return to.

| Why |
|---|
| a tap on the wrong link otherwise throws away minutes of typing. |
