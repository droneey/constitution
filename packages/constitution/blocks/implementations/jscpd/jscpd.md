---
id: jscpd
summary: Finds code copied within a unit.
requires: [task-runner]
languages: [typescript, python]
governs: [".jscpd.json"]
---

# jscpd

> jscpd finds code copied and pasted.

jscpd reads `.jscpd.json`, into which `constitution` writes the settings of every block: the unit's source and build code, its test code and its generated files left out, the size of a duplicate, and the exit code that makes a duplicate fail the run. Five lines and fifty tokens are jscpd's own defaults, written so that a file that raises them is reported. jscpd compares the files of one unit, and its presets give it the unit's code in each language it reads.
