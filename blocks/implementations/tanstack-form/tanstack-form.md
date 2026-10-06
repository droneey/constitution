---
id: tanstack-form
summary: Forms with TanStack Form — one form state, schema validation.
requires: [_react]
extends: null
abstract: false
languages: []
dictionary: [TanStack Form, useForm]
governs: ["**/*.tsx"]
---

# TanStack Form

> The project's only form library.

### form-state-in-the-form-instance → fact-has-one-source
Values, errors, touched and submitting state live in the form instance, with no state per field beside it.

| Why | Tags |
|---|---|
| one home for a form's state keeps validation, submission and display in agreement. | [] |
