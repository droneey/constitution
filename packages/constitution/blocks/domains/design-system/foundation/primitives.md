# Primitives

> Governs a primitive of the kit, and the proof that it is shown in every variant and state.

## General

### primitive-passes-its-element-through · SHOULD

A primitive accepts its element's own props and reference, and merges its own props and handlers with the caller's.

| Why |
|---|
| without it every consumer wraps or forks the primitive for one attribute. |

## Proof

### primitive-shown-in-every-variant-and-state · SHOULD

Each primitive of the design system is shown in each of its variants and states, in every mode, in one place that people and screenshot specs both see.

| Why |
|---|
| a variant nobody renders breaks unseen, and one showcase is what a review and a screenshot compare. |

## Requirements for implementation

### ui-primitives-unstyled · SHOULD

The library's primitives carry no look of their own.

| Why |
|---|
| the look comes from the design system's tokens, and a primitive's own styles fight them. |
