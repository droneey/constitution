---
id: package
summary: "Publishing packages: public entries, versions and releases."
requires: []
extends: null
abstract: false
checks: []
languages: []
roles: []
dictionary: []
governs: ["packages/**", "package.json", "pyproject.toml"]
---

# Package

> A repository that publishes packages for others to install: a library — configuration, primitives or tooling a consumer imports or extends — or an application distributed through the registry, a command-line tool its users install from it, which keeps an application's tree. The rules about several packages say "a repository of packages", and a rule for libraries alone says "a library"; a repository that publishes one package follows the rest.
