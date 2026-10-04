# Convergence

## The document

## declared-document-is-the-single-input · MUST
One document the user writes is the program's single input; every run reads it whole, validates it, and moves the world toward it.

| Why | Check | Tags |
|---|---|---|
| one declared state is reviewable, repeatable and diffable; inputs scattered across flags and files are none of these. | review | [] |

## field-constraints-checked-in-validation → untrusted-input-parsed-at-edge
Every constraint between fields of the document is checked in validation, before any stage runs, never at the point of use.

| Why | Check | Tags |
|---|---|---|
| an impossible combination found mid-run fails after part of the world has changed, far from the line that caused it. | review | [data, errors] |

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

## run-report-is-a-value → report-returned-as-a-value
The use-case of a run returns its report, with the entry of each stage, as a value.

| Why | Check | Tags |
|---|---|---|
| the stages then report into one value, which every way of starting a run presents alike. | review | [] |

## Engines

## engines-reached-through-a-port · MUST
The program reaches an engine only through a port of its own; no use-case runs an engine's binary or reads its output directly.

| Why | Check | Tags |
|---|---|---|
| an engine can then be upgraded, replaced or faked in a test without touching a use-case. | review | [] |
