---
id: hypothesis
summary: Hypothesis writes Python's property tests.
requires: [python]
extends: null
abstract: false
languages: []
dictionary: [Hypothesis, .hypothesis]
governs: []
---

# Hypothesis

> Draws the inputs of a property test and shrinks a failing one to its smallest form. Outside CI it remembers the inputs that failed in `.hypothesis/`, which is ignored; under `CI` it loads its own profile `ci`.
