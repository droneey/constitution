# Convergence

## The document

## document-lives-in-composition → feature-speaks-in-its-own-contracts
The document and its schema live in `composition/`, which knows every section. A feature never reads the document; it declares the vocabulary the document imports.

| Why | Check | Tags |
|---|---|---|
| each feature stays blind to the others and to the file format, and the document is assembled in one place. | review | [] |

## The stages

## stages-validate-render-plan-apply · SHOULD
Validate, render, plan and apply are separate use-cases: each runs alone, and later ones reuse earlier ones. Rendering runs no engine.

| Why | Check | Tags |
|---|---|---|
| a user can check, preview and plan without touching the world, and each stage is tested on its own. | review | [] |

## Engines

## engines-reached-through-a-port → side-effects-at-the-edges
The program reaches an engine only through a port of its own; no use-case runs an engine's binary or reads its output directly.

| Why | Check | Tags |
|---|---|---|
| an engine can then be upgraded, replaced or faked in a test without touching a use-case. | review | [] |
