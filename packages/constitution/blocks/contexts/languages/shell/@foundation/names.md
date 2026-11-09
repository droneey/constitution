# Names

> Governs a name in a script: its case.

## Form

### shell-name-in-snake-case → name-case-by-kind · SHOULD

Each kind of shell name takes one case. A function and a variable are lower_snake_case; a constant and an environment variable are UPPER_SNAKE_CASE.

#### Why

A script's own variable in upper case reads as one it shares with every process it starts, and can overwrite an environment variable of the same name unseen.

#### Examples

```bash title="Avoid"
readonly archiveRoot=/var/lib/invoices

ExportInvoices() {
  local OUTPUT_DIR="$1"
  cp -R -- "$archiveRoot/." "$OUTPUT_DIR"
}
```

```bash title="Prefer"
readonly ARCHIVE_ROOT=/var/lib/invoices

export_invoices() {
  local output_dir="$1"
  cp -R -- "$ARCHIVE_ROOT/." "$output_dir"
}
```
