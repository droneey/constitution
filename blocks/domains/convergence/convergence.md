---
id: convergence
kind: domain
summary: A declared document converged by validate, render, plan and apply.
chapters: []
requires: []
extends: null
abstract: false
checks: []
owns: []
governs: []
status: stable
---

# Convergence

> A program that reads one document its user writes and moves the world toward it: it validates the document, renders what it implies, plans the changes and applies them — and a second run changes nothing.

## The document

## declared-document-is-the-single-input · MUST
One document the user writes is the program's single input; every run reads it whole, validates it, and moves the world toward it.
**Why:** one declared state is reviewable, repeatable and diffable; inputs scattered across flags and files are none of these.
**Check:** review
**Tags:** architecture

## document-schema-strict · MUST
Each section of the document has a strict schema: unions selected by a discriminant field, unknown keys rejected, every constraint between fields checked in validation, never at the point of use.
**Why:** a typo or an impossible combination fails before anything runs, with a message that points at the line.
**Check:** test
**Tags:** data, errors
**Implements:** `untrusted-input-parsed-at-edge`

## section-optional-fields-required · MUST
A section may be absent, and is then left untouched. Inside a declared section every managed field is stated: "there is none" is written, and mapped to absence at the edge; a switched-off feature carries nothing else.
**Why:** a field the program fills in by default is a decision the user never saw; stating every field makes the document the whole truth.
**Check:** test
**Tags:** data
**Implements:** `absence-has-one-value-normalised-at-boundary`

## secrets-are-references · MUST
A secret in the document is a reference by name to the environment. Validation lists every name the document needs, read from the environment or the local environment file beside the document, and fails on a missing one; the program reads no other name except those describing its host.
**Why:** the document can then be committed and reviewed, and a missing secret fails before anything is applied.
**Check:** review
**Tags:** security
**Implements:** `environment-names-declared-in-one-place`

## one-syntax-per-value-kind · SHOULD
Each kind of value — a size, a duration — has one syntax in the document, parsed once.
**Why:** a user learns one way to write a size, and the program never guesses which one was meant.
**Check:** review
**Tags:** data

## published-schema-generated-from-code · MUST
The schema published for editors is generated from the code's schema, never written by hand. The check compares a committed copy with it and never rewrites it.
**Why:** a schema written twice drifts, and editors then accept documents the program rejects.
**Check:** test
**Tags:** data
**Implements:** `schema-derives-from-domain-types`

## document-lives-in-composition · SHOULD
The document and its schema live in `composition/`, which knows every section. A feature never reads the document; it declares the vocabulary the document imports.
**Why:** each feature stays blind to the others and to the file format, and the document is assembled in one place.
**Check:** review
**Tags:** architecture
**Implements:** `feature-speaks-in-its-own-contracts`

## init-writes-document-from-template · SHOULD
An `init` command writes one document from a template, named after the program, pointing editors at the published schema.
**Why:** a user starts from a valid document with completion in the editor, not from a blank page.
**Check:** review
**Tags:** ux

## The stages

## stages-validate-render-plan-apply · SHOULD
Validate, render, plan and apply are separate use-cases: each runs alone, and later ones reuse earlier ones. Rendering runs no engine.
**Why:** a user can check, preview and plan without touching the world, and each stage is tested on its own.
**Check:** review
**Tags:** architecture

## pipeline-stages-under-steps · SHOULD
A pipeline use-case keeps its stages under `steps/`, in the order the use-case calls them; a stage never calls another.
**Why:** the use-case reads as the pipeline, and a stage can be added, removed or tested alone.
**Check:** review
**Tags:** architecture

## plan-names-destroying-changes · MUST
The plan names every change that destroys something, and apply refuses one without an explicit flag.
**Why:** a destroyed resource cannot be converged back; the user must see it and ask for it.
**Check:** test
**Tags:** security, ux
**Implements:** `irreversible-operations-behind-flag-and-human`

## second-run-changes-nothing · MUST
Applying the same document twice reports no change the second time, and a test proves it.
**Why:** convergence is safe to rerun only if it is idempotent, and only a test keeps it so.
**Check:** test
**Tags:** testing, data
**Implements:** `operations-idempotent-by-design`

## run-reports-per-stage · SHOULD
A run reports each stage — skipped with its reason, unchanged, changed, ran, failed — as a value the delivery layer prints.
**Why:** the user sees what happened to each part, and the report can be printed as text or data without the use-case knowing.
**Check:** review
**Tags:** ux, errors

## run-output-in-an-ignored-work-folder · SHOULD
What a run produces lands in one work folder that version control ignores.
**Why:** rendered files and state never mix with the document, and never reach history by accident.
**Check:** review
**Tags:** workflow
**Implements:** `generated-files-not-committed`

## Engines

## engines-pinned-by-version-and-checksum · MUST
Engines the program drives are not vendored: each is downloaded per release into the program's home, pinned by version and checksum, and reached only through a port.
**Why:** a pinned, verified engine behaves the same on every machine, and a swapped binary fails its checksum.
**Check:** review
**Tags:** security
**Implements:** `dependencies-pinned-by-lockfile`

## developer-and-ci-run-the-tools-engines · SHOULD
Developers and CI run exactly the engines the program installed, linked into one directory of its home.
**Why:** a developer testing against another engine version tests another program.
**Check:** review
**Tags:** workflow

## Requirements for implementation

What any schema library a convergence program uses must provide.

## schema-rejects-unknown-keys · MUST
The library offers strict objects that fail on an unknown key.
**Why:** without it, a misspelt key is silently ignored and the document says something the program never reads.
**Check:** review
**Tags:** data

## schema-discriminated-unions · MUST
The library offers unions selected by a discriminant field, with an error that names it.
**Why:** a section's variants are then validated by their own schema, and a wrong one is reported as such.
**Check:** review
**Tags:** data, errors

## schema-exports-json-schema · MUST
The library generates a JSON Schema from the code's schema.
**Why:** the schema editors read must come from the code, or it drifts.
**Check:** review
**Tags:** data
