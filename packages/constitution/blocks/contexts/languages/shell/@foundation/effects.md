# Effects

> Governs a script's effects on what it shares with its host: the removal of its temporary files and its standard streams.

## Resources

### temporary-file-removed-by-an-exit-trap → resource-released-on-every-path · MUST

Every temporary file or folder a script makes is removed by a `trap` on `EXIT`, set right after it is made. In POSIX sh the trap is also set on `HUP`, `INT` and `TERM`, by a handler that exits. Exempt: a sourced file.

#### Why

Only the trap removes the file when the script fails or is interrupted, and a POSIX shell runs no `EXIT` trap on a signal it does not trap.

#### Examples

```bash title="Avoid"
main() {
  local work_dir
  work_dir="$(mktemp -d)"
  render-invoices --into "$work_dir"
  tar -czf invoices.tar.gz -C "$work_dir" .
  rm -rf -- "$work_dir" # never reached when a step fails
}
```

```bash title="Prefer"
main() {
  local work_dir
  work_dir="$(mktemp -d)"
  # shellcheck disable=SC2064 # Why: expanded now, since work_dir is gone once main returns
  trap "rm -rf -- '$work_dir'" EXIT
  render-invoices --into "$work_dir"
  tar -czf invoices.tar.gz -C "$work_dir" .
}
```

### script-diagnostics-written-through-one-function → shared-resource-has-one-writer · MUST

Every diagnostic and error a script writes goes to standard error through one function of its own.

#### Why

A caller pipes standard output into the next program, where a diagnostic mixed into it becomes data, and diagnostics written from many places drift into standard output one by one.

#### Examples

```bash title="Avoid"
export_orders() {
  local since="$1"
  echo "exporting orders since $since" # lands in the export
  orders-api export --since "$since"
}
```

```bash title="Prefer"
log() {
  printf '%s\n' "$*" >&2
}

export_orders() {
  local since="$1"
  log "exporting orders since $since"
  orders-api export --since "$since"
}
```
