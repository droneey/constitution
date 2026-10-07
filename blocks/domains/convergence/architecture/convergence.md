# Convergence

## The document

### document-lives-in-composition → feature-asks-another-through-its-own-contract · MUST
The document and its schema live in `composition/`, which knows every section. A feature never reads the document; it declares the vocabulary the document imports.

| Why | Tags |
|---|---|
| each feature stays blind to the others and to the file format, and the document is assembled in one place. | [] |

## The stages

### stages-validate-render-plan-apply · SHOULD
Validate, render, plan and apply are separate use-cases, and a later one calls the earlier ones.

| Why | Tags |
|---|---|
| each stage is then tested on its own, and a later one cannot drift from what an earlier one checked. | [] |

## Engines

### engines-reached-through-a-port → effects-held-only-by-the-edge · MUST
The program reaches an engine only through a port of its own; no use-case runs an engine's binary or reads its output directly.

| Why | Tags |
|---|---|
| an engine can then be upgraded, replaced or faked in a test without touching a use-case. | [] |
