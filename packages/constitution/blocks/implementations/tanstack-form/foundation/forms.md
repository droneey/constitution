# Forms

> Governs where a form's state lives.

## General

### form-state-in-the-form-instance → fact-has-one-source · MUST

Values, errors, touched and submitting state live in the form instance, with no state per field beside it.

| Why | Tags |
|---|---|
| one home for a form's state keeps validation, submission and display in agreement. | [] |
