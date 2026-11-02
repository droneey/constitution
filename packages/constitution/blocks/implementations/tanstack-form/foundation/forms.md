# Forms

> Governs where a form's state lives.

## General

### form-state-in-the-form-instance → fact-has-one-source · MUST

A form's state lives in its form instance. Values, errors, touched and submitting state live there, with no state per field beside it.

| Why |
|---|
| a field's state kept beside the instance drifts from it, so validation, submission and display disagree about the same field — a single source of truth. |
