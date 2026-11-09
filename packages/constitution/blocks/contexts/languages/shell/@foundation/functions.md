# Functions

> Governs a function in a script: the main function that holds its logic.

## General

### script-logic-in-a-main-function · MUST

Every script that defines functions runs its logic in a function `main`, which it calls on its last line as `main "$@"`. Exempt: a sourced file.

#### Why

A shell runs a script as it reads it, so one truncated in transfer or edited while it runs executes half of itself, while `main` called on the last line runs only once the whole file is read.

#### Examples

```bash title="Avoid"
#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit

send_invoice() {
  local invoice_id="$1"
  render-invoice "$invoice_id" | mail-invoice --to-customer
}

for invoice_id in "$@"; do
  send_invoice "$invoice_id"
done
```

```bash title="Prefer"
#!/usr/bin/env bash
set -euo pipefail
shopt -s inherit_errexit

send_invoice() {
  local invoice_id="$1"
  render-invoice "$invoice_id" | mail-invoice --to-customer
}

main() {
  local invoice_id
  for invoice_id in "$@"; do
    send_invoice "$invoice_id"
  done
}

main "$@"
```
