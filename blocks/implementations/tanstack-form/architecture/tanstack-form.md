# TanStack Form

## form-state-in-the-form-instance · SHOULD
Values, errors, touched and submitting state live in the form instance, with no state per field beside it.
**Why:** one home for a form's state keeps validation, submission and display in agreement.
**Check:** review
**Tags:** data
**Implements:** `one-home-per-datum`

## form-validated-by-its-own-schema · SHOULD
The form validates by a schema beside it, composed from the value objects' predicates, and maps the server's typed error onto its fields.
**Why:** the form checks what the domain checks, and shows the server's refusal where the user can fix it.
**Check:** review
**Tags:** types, ux
**Implements:** `form-reuses-domain-predicates`

## form-submits-through-a-binding-unit · SHOULD
Submission calls the command's binding unit or an `on<Event>` callback; the form does no input or output, and its submit is disabled while it submits.
**Why:** the form stays presentational, and a double click never submits twice.
**Check:** review
**Tags:** architecture, ux
**Implements:** `delivery-units-stay-thin`
