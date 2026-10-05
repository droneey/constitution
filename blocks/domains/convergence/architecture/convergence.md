# Convergence

## The document

## document-lives-in-composition → feature-speaks-in-its-own-contracts
The document and its schema live in `composition/`, which knows every section. A feature never reads the document; it declares the vocabulary the document imports.

| Why | Check | Tags |
|---|---|---|
| each feature stays blind to the others and to the file format, and the document is assembled in one place. | review | [] |

## The stages

## stages-validate-render-plan-apply → stages-run-alone
Validate, render, plan and apply are separate use-cases, and a later one calls the earlier ones.

| Why | Check | Tags |
|---|---|---|
| each stage is then tested on its own, and a later one cannot drift from what an earlier one checked. | review | [] |

## Engines

## engines-reached-through-a-port → side-effects-at-the-edges
The program reaches an engine only through a port of its own; no use-case runs an engine's binary or reads its output directly.

| Why | Check | Tags |
|---|---|---|
| an engine can then be upgraded, replaced or faked in a test without touching a use-case. | review | [] |
