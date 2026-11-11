# Checks

> Governs the project's own ast-grep rules and the suppressions of every rule.

## Vocabulary

A project's own ast-grep rule is a rule file of ast-grep the project writes itself, beside the rules its presets copy. The folder of such rules is **`ast-grep/`**{#ast-grep-rules}, at the root of the package they check.

## Rules

### project-ast-grep-rule-kept-in-its-folder · SHOULD

Every ast-grep rule of the project's own lives in `ast-grep/<name>.yaml`, `<name>` being the name its `id` opens with.

#### Why

A project's rule kept anywhere else is not found where its rules are looked for, and `sgconfig.yaml` names no folder it does not know.

#### Examples

```text title="Avoid"
./
├── sgconfig.yaml
├── lint-rules/no-money-as-number.yaml
└── src/orders/no-raw-order-id.yaml
```

```text title="Prefer"
./
├── sgconfig.yaml
└── ast-grep/
    ├── no-money-as-number.yaml
    └── no-raw-order-id.yaml
```

### project-ast-grep-rule-scoped-by-its-files · SHOULD

Every ast-grep rule of the project's own names the files it checks by `files`.

#### Why

A rule left unscoped runs on every file of its language, those it was not written for among them.

#### Examples

```yaml title="Avoid"
# ast-grep/no-money-as-number.yaml
id: no-money-as-number@typescript
language: Tsx
rule:
  pattern: 'amount: number'
```

```yaml title="Prefer"
# ast-grep/no-money-as-number.yaml
id: no-money-as-number@typescript
language: Tsx
files:
  - src/features/**/domain/**/*.ts
rule:
  pattern: 'amount: number'
```

## Suppressions

### ast-grep-suppression-names-one-rule → suppression-silences-one-finding · MUST

Every ast-grep suppression names one rule, as `ast-grep-ignore: <slug>@<language>` in a comment of the line it silences or of the line above. It is never the bare `ast-grep-ignore`.

#### Why

A bare `ast-grep-ignore` silences every rule on its line, those that hold other obligations among them, and a comment that names several rules silences findings nobody meant to.

#### Examples

```ts title="Avoid"
export const nightlyReport: Job = {
  // Why: the scheduler calls a job's `run`, the name its Job contract imposes.
  // ast-grep-ignore
  async run() {
    await reports.sendNightly();
  },
};
```

```ts title="Prefer"
export const nightlyReport: Job = {
  // Why: the scheduler calls a job's `run`, the name its Job contract imposes.
  // ast-grep-ignore: ast-grep-refuses-empty-verbs@typescript
  async run() {
    await reports.sendNightly();
  },
};
```

### ast-grep-reason-on-the-line-above → suppression-states-its-reason · MUST

Every ast-grep suppression's reason stands in a comment of its own on the line above it. It is never written inside the suppression's comment.

#### Why

ast-grep reads the words after `ast-grep-ignore:` as rule ids, so a reason written there is read as a rule, and a change to how it reads them can turn the suppression off or widen it.

#### Examples

```py title="Avoid"
# ast-grep-ignore: function-within-its-limits@python  the body is one table it returns
def status_labels() -> dict[Status, str]:
```

```py title="Prefer"
# Why: the body is one table the function returns.
# ast-grep-ignore: function-within-its-limits@python
def status_labels() -> dict[Status, str]:
```
