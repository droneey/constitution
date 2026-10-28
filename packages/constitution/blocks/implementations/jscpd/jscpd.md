---
id: jscpd
summary: Finds code copied within a unit.
requires: [json, _task-runner]
extends: null
abstract: false
languages: [typescript, python]
governs: [".jscpd.json"]
---

# jscpd

> **`jscpd`** finds code copied and pasted.

jscpd reads **`.jscpd.json`**{#jscpd-settings}, into which `constitution` writes the settings of every block: the unit's source and build code, its specs, their fixtures and its generated files left out, the size of a clone, and the exit code that makes a clone fail the run. Five lines and fifty tokens are jscpd's own defaults, written so that a file that raises them is reported.

jscpd compares the files of one unit, so a copy between two units is left to review. Its presets give it the unit's code in each language it reads, and none of its stylesheets, whose rules compose the same tokens by design — a font with its letter spacing, a focus ring — and would each be reported as a clone.
