---
id: convergence
summary: A declared document converged by validate, render, plan and apply.
requires: []
extends: null
abstract: false
languages: []
dictionary: []
governs: []
---

# Convergence

> A program that reads one document its user writes and moves the world toward it: it validates the document, renders what it implies, plans the changes and applies them — and a second run changes nothing.

## The document

### declared-document-is-the-single-input · MUST
One document the user writes is the program's single input; every run reads it whole, validates it, and moves the world toward it.

| Why | Tags |
|---|---|
| one declared state is reviewable, repeatable and diffable; inputs scattered across flags and files are none of these. | [] |

### field-constraints-checked-in-validation · MUST
Every constraint between fields of the document is checked in validation, before any stage runs, never at the point of use.

| Why | Tags |
|---|---|
| an impossible combination found mid-run fails after part of the world has changed, far from the line that caused it. | [data, errors] |

### section-optional-fields-required → absence-has-one-value
A section may be absent, and is then left untouched. Inside a declared section every managed field is stated: "there is none" is written, and mapped to absence when the document is read; a switched-off option carries nothing else.

| Why | Tags |
|---|---|
| a field the program fills in by default is a decision the user never saw; stating every field makes the document the whole truth. | [] |

### secrets-are-references · MUST
A secret in the document is a reference by name to the environment. Validation lists every name the document needs, read from the environment or the local environment file beside the document, and fails on a missing one; the program reads no other name except those describing its host.

| Why | Tags |
|---|---|
| the document can then be shared and reviewed, and a missing secret fails before anything is applied. | [security] |

### document-variants-selected-by-a-discriminant → illegal-states-unrepresentable
A section of the document that takes several forms is a union selected by a discriminant field.

| Why | Tags |
|---|---|
| each form is then checked by its own schema, and a wrong one fails before anything runs, with a message that names the field. | [data, errors] |

### one-syntax-per-value-kind · SHOULD
Each kind of value — a size, a duration — has one syntax in the document, parsed once.

| Why | Tags |
|---|---|
| a user learns one way to write a size, and the program never guesses which one was meant. | [data] |

### published-schema-generated-from-code → generated-files-marked-never-edited
The schema published for editors is generated from the code's schema, never written by hand, and a spec compares the copy kept in the repository with it.

| Why | Tags |
|---|---|
| a schema written twice drifts, and editors then accept documents the program rejects. | [data] |

### document-points-editors-at-the-schema · SHOULD
The document points editors at the published schema.

| Why | Tags |
|---|---|
| the editor then checks and completes the document as it is written. | [ux] |

## The stages

### stages-run-alone · SHOULD
Validating, rendering, planning and applying are separate stages a user runs alone, and each later stage reuses the earlier ones. Rendering runs no engine.

| Why | Tags |
|---|---|
| a user can check, preview and plan without touching the world, and a later stage builds on exactly what an earlier one showed. | [] |

### plan-names-destroying-changes → irreversible-operations-behind-a-flag
The plan names every change that destroys something, and apply refuses one without an explicit flag.

| Why | Tags |
|---|---|
| a destroyed resource cannot be converged back; the user must see it and ask for it. | [] |

### second-run-changes-nothing → operations-idempotent-by-design · MUST
Applying the same document twice reports no change the second time, and a test proves it.

| Why | Tags |
|---|---|
| convergence is safe to rerun only if it is idempotent, and only a test keeps it so. | [testing] |

### run-reports-per-stage · SHOULD
A run's report holds an entry for each stage: skipped with its reason, unchanged, changed, ran or failed.

| Why | Tags |
|---|---|
| the user sees what happened to each part, and where a failed run stopped. | [ux, errors] |

### run-output-in-one-work-folder · SHOULD
What a run produces lands in one work folder, apart from the document.

| Why | Tags |
|---|---|
| rendered files and state never mix with the document, and one folder is cleared or ignored as a whole. | [] |

## Engines

### engines-downloaded-per-release-not-vendored · MUST
Engines the program drives are not vendored: each is downloaded per release into the program's home.

| Why | Tags |
|---|---|
| a vendored engine grows the repository with every release, while a download per release keeps every machine on the engine the release names. | [] |

### tools-reach-the-programs-engines · SHOULD
The engines the repository's tools reach are exactly those the program installed, linked into one directory of its home.

| Why | Tags |
|---|---|
| a developer testing against another engine version tests another program. | [] |

## Requirements for implementation

What any schema library a convergence program uses must provide.

### schema-rejects-unknown-keys · MUST
The library offers strict objects that fail on an unknown key.

| Why | Tags |
|---|---|
| without it, a misspelt key is silently ignored and the document says something the program never reads. | [data] |

### schema-discriminated-unions · MUST
The library offers unions selected by a discriminant field, with an error that names it.

| Why | Tags |
|---|---|
| a section's variants are then validated by their own schema, and a wrong one is reported as such. | [data, errors] |

### schema-exports-json-schema · MUST
The library generates a JSON Schema from the code's schema.

| Why | Tags |
|---|---|
| the schema editors read must come from the code, or it drifts. | [data] |
