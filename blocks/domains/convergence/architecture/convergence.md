# Convergence

## The document

## declared-document-is-the-single-input · MUST
One document the user writes is the program's single input; every run reads it whole, validates it, and moves the world toward it.
**Why:** one declared state is reviewable, repeatable and diffable; inputs scattered across flags and files are none of these.
**Check:** review

## field-constraints-checked-in-validation · MUST
Every constraint between fields of the document is checked in validation, before any stage runs, never at the point of use.
**Why:** an impossible combination found mid-run fails after part of the world has changed, far from the line that caused it.
**Check:** review
**Tags:** data, errors
**Implements:** `untrusted-input-parsed-at-edge`

## document-lives-in-composition · SHOULD
The document and its schema live in `composition/`, which knows every section. A feature never reads the document; it declares the vocabulary the document imports.
**Why:** each feature stays blind to the others and to the file format, and the document is assembled in one place.
**Check:** review
**Implements:** `feature-speaks-in-its-own-contracts`

## The stages

## stages-validate-render-plan-apply · SHOULD
Validate, render, plan and apply are separate use-cases: each runs alone, and later ones reuse earlier ones. Rendering runs no engine.
**Why:** a user can check, preview and plan without touching the world, and each stage is tested on its own.
**Check:** review

## run-report-is-a-value · SHOULD
A use-case returns its run's report as a value, and the delivery layer prints it, as text or as data.
**Why:** the use-case never knows how its report is shown, and a new output format touches only the delivery layer.
**Check:** review
**Implements:** `run-reports-per-stage`

## Engines

## engines-reached-through-a-port · MUST
The program reaches an engine only through a port of its own; no use-case runs an engine's binary or reads its output directly.
**Why:** an engine can then be upgraded, replaced or faked in a test without touching a use-case.
**Check:** review
