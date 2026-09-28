# TanStack Form

## idempotency-key-per-intent · SHOULD
A submission that must not repeat creates its idempotency key once, with the form, and reuses it on every retry — never a new key per click.
**Why:** a key per click turns every retry into a new order.
**Check:** review
**Tags:** data
**Implements:** `operations-idempotent-by-design`

## form-validated-by-its-own-schema · SHOULD
The form validates through its schema, and maps the server's typed error onto its fields.
**Why:** the form refuses bad input before it is sent, and shows the server's refusal where the user can fix it.
**Check:** review
**Tags:** types, ux

## submit-disabled-while-submitting · SHOULD
A form's submit is disabled while it submits.
**Why:** a double click never submits twice.
**Check:** review
**Tags:** ux
