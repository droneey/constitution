# TanStack Form

## idempotency-key-per-intent → operations-idempotent-by-design
A submission that must not repeat creates its idempotency key once, with the form, and reuses it on every retry — never a new key per click.

| Why | Check | Tags |
|---|---|---|
| a key per click turns every retry into a new order. | review | [] |

## form-validated-by-its-own-schema · SHOULD
The form validates through its schema, and maps the server's typed error onto its fields.

| Why | Check | Tags |
|---|---|---|
| the form refuses bad input before it is sent, and shows the server's refusal where the user can fix it. | review | [ux] |
