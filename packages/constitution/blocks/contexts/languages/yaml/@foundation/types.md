# Types

> Governs a YAML scalar and a key: how a boolean is spelled, which scalars are quoted, the merge key and the schema a reader resolves scalars by.

## Scalars

### boolean-written-true-or-false · MUST

Every boolean is written `true` or `false`, in lower case.

#### Why

YAML 1.1 also reads `yes`, `no`, `on` and `off` as booleans while YAML 1.2 reads them as text, and the YAML 1.2 schema strict readers use takes only the lower-case `true` and `false`, so any other spelling means different things to different readers — YAML 1.2.

#### Examples

```yaml title="Avoid"
checkout:
  guestCheckout: yes
  savedCards: On
```

```yaml title="Prefer"
checkout:
  guestCheckout: true
  savedCards: true
```

### ambiguous-scalar-quoted · MUST

Every scalar meant as text that any reader resolves to another type is quoted. Such scalars include `no`, `on`, `null`, `~`, `3.10`, `0755`, `1:20` and `2026-10-11`. Exempt: a key the file's own reader defines, such as the `on` key of a continuous-integration file.

#### Why

A YAML 1.1 reader turns `no` into false, `0755` into 493, `1:20` into 80 and a date into a timestamp, and every reader turns `3.10` into 3.1, so the value changes with no error.

#### Examples

```yaml title="Avoid"
warehouse:
  country: NO
  python: 3.10
  exportMode: 0755
  cutoff: 17:30
```

```yaml title="Prefer"
warehouse:
  country: "NO"
  python: "3.10"
  exportMode: "0755"
  cutoff: "17:30"
```

### reader-resolves-scalars-by-the-core-schema · MUST

Every YAML reader the program runs resolves unquoted scalars by YAML 1.2's core schema.

#### Why

Under another schema a reader turns words into booleans, dates or base-60 numbers the writer meant as text, so the program reads a value nobody wrote; under the core schema only `true` and `false`, in lower, title or upper case, are booleans — YAML 1.2.

#### Examples

```ts title="Avoid"
// src/libs/config/read-config.ts
import { parse } from 'yaml';

export const readConfig = (text: string): unknown => parse(text, { version: '1.1' });
```

```ts title="Prefer"
// src/libs/config/read-config.ts
import { parse } from 'yaml';

export const readConfig = (text: string): unknown => parse(text, { schema: 'core' });
```

## Keys

### merge-key-never-used · MUST

No mapping uses the merge key `<<`. Exempt: a file whose own reader defines the key.

#### Why

The merge key belongs to YAML 1.1 alone: a YAML 1.2 reader takes `<<` as an ordinary key, and the readers that merge do not merge alike — YAML 1.2.

#### Examples

```yaml title="Avoid"
defaults: &defaults
  replicas: 2
  memory: 512Mi
orders:
  <<: *defaults
  replicas: 4
invoices:
  <<: *defaults
```

```yaml title="Prefer"
orders:
  replicas: 4
  memory: 512Mi
invoices:
  replicas: 2
  memory: 512Mi
```
