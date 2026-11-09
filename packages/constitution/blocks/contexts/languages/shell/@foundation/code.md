# Code

> Governs any shell code no other chapter governs: what a script does, its expansions and its lists, and the shell code other files hold.

## Vocabulary

A **shell command** is one invocation, in shell code, of a program, a builtin or a function, with its arguments.

## General

### script-only-glues-programs · SHOULD

Every script only runs programs and passes their results along. Logic of its own, such as parsing structured data, computing over records or branching on more cases than the project sets, is written in the project's main language, the one most of its own code is written in.

#### Why

The shell has no types and no data structures beyond arrays, so logic written in it grows bugs that nothing catches.

#### Examples

```bash title="Avoid"
main() {
  local month="$1"
  local customer amount_cents
  local total_cents=0
  while IFS=, read -r customer amount_cents; do
    total_cents=$(( total_cents + amount_cents ))
  done < <(billing-export --month "$month")
  printf '%s\n' "$total_cents"
}
```

```bash title="Prefer"
main() {
  local month="$1"
  billing-export --month "$month" | bun scripts/invoice-totals.ts
}
```

### shell-code-another-file-holds-is-plain-commands · SHOULD

Every piece of shell code another file holds is one shell command or shell commands joined by `&&`. It holds no branch, loop, function, trap, pipeline, command substitution or `||`. Such code includes a manifest's script, an automation step's and a hook's, and code that needs more moves into a shell script that code runs. Exempt: a pipeline in code whose file sets its shell with `-o pipefail`, such as a `RUN` under such a `SHELL`.

#### Why

Shell code embedded in another file runs under the `set` flags its runner chose and reaches a shell linter only through that file, or not at all, so a branch, a loop or a pipeline there can fail unseen, while commands joined by `&&` stop at the first that fails, whatever flags the runner chose.

#### Examples

```yaml title="Avoid"
# .github/workflows/release.yml
steps:
  - name: Publish the invoice renderer
    run: |
      version="$(jq -r .version package.json)"
      if git rev-parse --verify --quiet "v$version" > /dev/null; then
        echo "v$version is already released" >&2
        exit 0
      fi
      npm run build
      tar -czf "renderer-$version.tgz" -C dist .
      gh release create "v$version" "renderer-$version.tgz"
```

```yaml title="Prefer"
# .github/workflows/release.yml
steps:
  - name: Publish the invoice renderer
    run: ./scripts/release.sh
```

## Expansions and lists

### expansion-double-quoted · MUST

Every expansion of a parameter or a shell command's output is double-quoted, in a script and in shell code another file holds. It holds for an array's elements too. Exempt: the right side of an assignment no builtin such as `local` or `export` takes, the word after `case`, the left side inside `[[ ]]`, everything inside `(( ))`, the right side of `==`, `!=` or `=~` inside `[[ ]]` where it is meant as a pattern, and the unquoted wrapper of the empty-array form `list-held-in-an-array` gives.

#### Why

An unquoted expansion is split on spaces and expanded as a glob, so a file name with a space or a star becomes several arguments or other files.

#### Examples

```bash title="Avoid"
archive_invoice() {
  local invoice_file="$1"
  cp -- $invoice_file $ARCHIVE_DIR/
}
```

```bash title="Prefer"
archive_invoice() {
  local invoice_file="$1"
  cp -- "$invoice_file" "$ARCHIVE_DIR/"
}
```

### list-held-in-an-array · SHOULD

In Bash, every list of words is held in an array, never in a string split on spaces. Such a list holds files, arguments or flags and is expanded as `"${<array>[@]}"`; below Bash 4.4, an array that may be empty is expanded as `${<array>[@]+"${<array>[@]}"}`, which `set -u` accepts.

#### Why

A string split on spaces breaks every item that holds one, while an array keeps each item whole.

#### Examples

```bash title="Avoid"
back_up_invoices() {
  local rsync_flags="--recursive --exclude *.tmp"
  rsync $rsync_flags invoices/ "$BACKUP_HOST:invoices/"
}
```

```bash title="Prefer"
back_up_invoices() {
  local -a rsync_flags=(--recursive --exclude '*.tmp')
  rsync "${rsync_flags[@]}" invoices/ "$BACKUP_HOST:invoices/"
}
```
