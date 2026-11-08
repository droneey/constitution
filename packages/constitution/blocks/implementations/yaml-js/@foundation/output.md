# Output

> Governs the YAML the program writes.

## General

### yaml-written-without-folding · SHOULD

Every YAML document the program writes is written with `lineWidth: 0`, so no value is folded across lines.

#### Why

A folded value moves in a diff whenever a neighbour changes.

#### Examples

```ts title="Avoid"
export const writeWorkflow = (workflow: Workflow): string => stringify(workflow);
```

```ts title="Prefer"
export const writeWorkflow = (workflow: Workflow): string => stringify(workflow, { lineWidth: 0 });
```
