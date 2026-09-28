# TanStack Form

## form-state-in-the-form-instance · MUST
Values, errors, touched and submitting state live in the form instance, with no state per field beside it.
**Why:** one home for a form's state keeps validation, submission and display in agreement.
**Check:** review
**Tags:** data
**Implements:** `one-home-per-datum`

## form-submits-through-a-binding-unit · SHOULD
Submission calls the command's binding unit or an `on<Event>` callback; the form does no input or output.
**Why:** the form stays presentational, and serves whichever operation it is handed.
**Check:** review
**Implements:** `delivery-units-stay-thin`
