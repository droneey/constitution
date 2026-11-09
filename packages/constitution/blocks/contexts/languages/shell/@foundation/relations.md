# Relations

> Governs how a script's functions hold state: a function's variables.

## Construction and state

### function-variable-declared-local → state-never-global-and-mutable · MUST

In Bash, every function declares every variable it sets as `local`.

#### Why

A variable a function sets without `local` changes the caller's variable of the same name, an effect no call shows.

#### Examples

```bash title="Avoid"
render_invoice() {
  local invoice_id="$1"
  output="invoices/$invoice_id.pdf" # overwrites the caller's output
  render-invoice "$invoice_id" > "$output"
}
```

```bash title="Prefer"
render_invoice() {
  local invoice_id="$1"
  local output="invoices/$invoice_id.pdf"
  render-invoice "$invoice_id" > "$output"
}
```
