---
id: tanstack-form
kind: implementation
summary: Forms with TanStack Form — one form state, schema validation.
chapters: []
requires: [_react]
extends: null
abstract: false
checks: []
owns: [TanStack Form, useForm]
governs: ["**/*.tsx"]
status: stable
---

# TanStack Form

> The project's only form library.

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

## idempotency-key-per-intent · SHOULD
A submission that must not repeat creates its idempotency key once, with the form, and reuses it on every retry — never a new key per click.
**Why:** a key per click turns every retry into a new order.
**Check:** review
**Tags:** data
**Implements:** `operations-idempotent-by-design`
