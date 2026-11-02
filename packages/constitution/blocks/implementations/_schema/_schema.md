---
id: _schema
summary: A schema library, which parses outside input into the program's types.
requires: []
extends: null
abstract: true
languages: []
governs: ["**/models/**", "**/infrastructure/**", "**/presentation/**", "**/libs/**", "**/shared/**"]
---

# Schema library

> A library that parses outside input against a schema into the program's types, as every schema library shares it: where it is imported and how the values it builds keep their own checks.

A project lists the library's block, which brings this one.
