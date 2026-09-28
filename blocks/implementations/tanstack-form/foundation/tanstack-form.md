# TanStack Form

## idempotency-key-per-intent · SHOULD
A submission that must not repeat creates its idempotency key once, with the form, and reuses it on every retry — never a new key per click.
**Why:** a key per click turns every retry into a new order.
**Check:** review
**Tags:** data
**Implements:** `operations-idempotent-by-design`
