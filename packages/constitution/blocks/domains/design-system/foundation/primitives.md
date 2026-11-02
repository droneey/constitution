# Primitives

> Governs a primitive of the kit, and the proof that it is shown in every variant and state.

## General

### primitive-passes-its-element-through · SHOULD

A primitive passes through what its caller gives its element. It accepts what the caller passes to that element — its attributes, its handlers and its reference, or the platform's modifier — and merges its own attributes and handlers with the caller's.

| Why |
|---|
| without it every consumer wraps or forks the primitive for one attribute — the open–closed principle. |

## Proof

### primitive-shown-in-every-variant-and-state · SHOULD

Each primitive is shown in every variant and state. It is shown so in every mode, in one place that people and screenshot specs both see.

| Why |
|---|
| a variant nobody renders breaks unseen, and a primitive shown piecemeal, or nowhere, leaves a review and a screenshot nothing whole to compare. |

## Requirements for implementation

### ui-primitives-unstyled · SHOULD

The library's primitives carry no look of their own.

| Why |
|---|
| the look comes from the design system's tokens, and a primitive's own styles fight them. |
