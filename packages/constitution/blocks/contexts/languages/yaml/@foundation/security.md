# Security

> Governs the loading of YAML that is outside input: the tags it honours and the expansion of its aliases.

## Outside input

### tag-naming-a-type-or-a-function-refused → outside-input-never-rebuilt-as-objects · MUST

Every loader of outside input in YAML refuses each tag naming a type or a function of the program's language.

#### Why

A loader that honours a tag naming a type or a function of the program's language builds the object or calls the function the sender names, which hands the sender the program.

#### Examples

```ts title="Avoid"
// src/libs/yaml/parse-outside-yaml.ts
import { parse } from 'yaml';
import type { ScalarTag } from 'yaml';

const regexpTag: ScalarTag = {
  tag: '!regexp',
  identify: (value) => value instanceof RegExp,
  resolve: (source) => new RegExp(source),
};

export const parseOutsideYaml = (body: string): unknown =>
  parse(body, { schema: 'core', customTags: [regexpTag] });
```

```ts title="Prefer"
// src/libs/yaml/parse-outside-yaml.ts
import { parseDocument } from 'yaml';

/** @throws {OutsideYamlRefusedError} when the body is malformed or carries an unknown tag */
export const parseOutsideYaml = (body: string): unknown => {
  const document = parseDocument(body, { schema: 'core' });
  const [problem] = [...document.errors, ...document.warnings];
  if (problem !== undefined) {
    throw new OutsideYamlRefusedError(problem.code, { cause: problem });
  }
  return document.toJS({ maxAliasCount: 100 });
};
```

### alias-expansion-bounded → memory-for-outside-sized-input-grows-at-most-linearly · MUST

All outside input in YAML is loaded with its alias expansion bounded. Its loader caps the nodes its aliases stand for, counted whether it copies or shares the value each names, or refuses every alias.

#### Why

A few lines of nested aliases expand into billions of nodes, so the memory a small file takes grows exponentially with its size and exhausts the reader though the file passed every size check, while a loader that shares what an alias names loads it small, and the work grows exponentially only when code walks or writes the value.

#### Examples

```ts title="Avoid"
// src/libs/yaml/parse-outside-yaml.ts
export const parseOutsideYaml = (body: string): unknown => {
  const document = parseDocument(body, { schema: 'core' });
  const [problem] = [...document.errors, ...document.warnings];
  if (problem !== undefined) {
    throw new OutsideYamlRefusedError(problem.code, { cause: problem });
  }
  return document.toJS({ maxAliasCount: -1 });  // no bound on aliases
};
```

```ts title="Prefer"
// src/libs/yaml/parse-outside-yaml.ts
export const parseOutsideYaml = (body: string): unknown => {
  const document = parseDocument(body, { schema: 'core' });
  const [problem] = [...document.errors, ...document.warnings];
  if (problem !== undefined) {
    throw new OutsideYamlRefusedError(problem.code, { cause: problem });
  }
  return document.toJS({ maxAliasCount: 100 });
};
```
