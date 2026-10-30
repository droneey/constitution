---
id: owned-data
summary: "Data the program decides on: storage, transactions, migrations."
requires: []
extends: null
abstract: false
languages: []
governs: ["**"]
---

# Owned data

> Data the program owns and decides on: whether a change is valid is the program's own rule, so a transaction changes one of its aggregates, its schema changes only by migrations, and its backups are proven by restoring them.

Data another system owns and decides on is not this block's.
