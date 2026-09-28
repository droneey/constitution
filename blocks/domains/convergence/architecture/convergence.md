# Convergence

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

## document-lives-in-composition · SHOULD
The document and its schema live in `composition/`, which knows every section. A feature never reads the document; it declares the vocabulary the document imports.
**Why:** each feature stays blind to the others and to the file format, and the document is assembled in one place.
**Check:** review
**Tags:** architecture
**Implements:** `feature-speaks-in-its-own-contracts`

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

## run-reports-per-stage · SHOULD
A run reports each stage — skipped with its reason, unchanged, changed, ran, failed — as a value the delivery layer prints.
**Why:** the user sees what happened to each part, and the report can be printed as text or data without the use-case knowing.
**Check:** review
**Tags:** ux, errors

## Engines

## engines-pinned-by-version-and-checksum · MUST
Engines the program drives are not vendored: each is downloaded per release into the program's home, pinned by version and checksum, and reached only through a port.
**Why:** a pinned, verified engine behaves the same on every machine, and a swapped binary fails its checksum.
**Check:** review
**Tags:** security
**Implements:** `dependencies-pinned-by-lockfile`
