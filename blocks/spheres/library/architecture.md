# Architecture — library

> The single source of truth for how a **library monorepo** is structured: a repository whose product is a set of packages other repositories install, not an application. Every developer — and every agent — follows this. No improvisation.
> This chapter states **principles and boundaries**, not micro-instructions; particulars are *derived*. It is **tool-free**: the package manager, the registry and the workspace mechanics are named by concern, and the `stack` chapter binds them.
> The dependency checker, the manifest check and the tests enforce what they can. An un-enforced rule is decoration.

---

## 0. Philosophy

**One repository, many packages, one version.** Each package is a unit another repository installs: it carries its own manifest, its README, its tests and a curated public surface. All packages share one release: every manifest carries the same version, and one tag publishes them all.

- **A package knows nothing about the repositories that install it.** It ships configuration, primitives or tooling; it never ships a product's business.
- **Consumers extend, they never copy.** Whatever a package offers is reached through its manifest's exports. A file that cannot be extended is a **template**: copied once, owned by the consumer from then on, never checked against the kit.
- **The root is private** and holds only what every package shares: the workspace, the scripts, the checks.

---

## 1. Top-level structure

```
packages/
├── common/                  # LANGUAGE-AGNOSTIC
│   ├── templates/           # files a consumer copies once (.editorconfig, .gitignore, …)
│   └── <tool>/              # the shared configuration of a language-agnostic tool (git hooks)
└── <language>/
    ├── libs/<name>/         # one publishable package per folder — see §2
    └── templates/           # files a consumer of this language copies once
```

The root carries the private manifest, the workspace declaration, the scripts of `check`, and the README that is the front door: what the kit is, how a repository installs it, one row per package.

A new language is a new folder under `packages/`; `common` and the root do not change. A file that several languages share is `common`'s; a language-specific copy of it is generated from `common`, never edited by hand.

---

## 2. Package anatomy

```
libs/<name>/
├── package.json      # name <scope>/<kit>-<language>-<name>; exports; files; peers
├── README.md         # install, the one-line extends, the options it exposes
├── LICENSE.md
├── configs/ | src/   # what the package ships
└── __tests__/        # the specs that prove it
```

- **Exports are a curated surface.** The manifest lists every entry a consumer may extend and nothing else; the files list is explicit. A consumer imports an entry, never a path inside the package.
- **The tool a package configures is a peer dependency** with a version floor, never a dependency: the consumer owns the tool, the package owns its configuration. A runtime dependency exists only when the package executes code on its own.
- **Packages do not import each other** except through a declared dependency in the manifest; a shared file lives in `common` and reaches a package through its build.
- **A package with a build ships its output**, and the build regenerates every copy the package carries from `common`; a test guards that copy against drift.
- **Naming follows the kit:** one scope, one prefix, the language, the name. The name says what is configured, not how.

---

## 3. Versions and releases

- **One version for all packages**, written into every manifest by the release automation, which decides the bump from the merged branch prefix like every repository of the fleet.
- **One tag publishes every package that is not private.** A version already on the registry is a skip, never a failure, so a re-run is safe.
- **The registry trusts the workflow, not a token:** publishing runs through the identity of the release job. A package that does not exist on the registry yet is published once by hand, then the automation owns it.
- A change to any package is a change to the kit: the changelog is the commit subjects since the previous tag.

---

## 4. Templates

A template is a file no tool can extend — an editor configuration, an ignore list, a test runner configuration. The kit keeps the canonical copy under `templates/`, versioned with the packages; a consumer copies it once and owns it. The kit makes such a file **identical everywhere by convention** — patterns instead of paths, names instead of lists — and ships no checker for the copies: a template that needs a checker should have been an export.

---

## 5. Consumers

A repository takes a kit package through the mechanism its tool offers, in this order of preference: the tool's own `extends`; a one-line module that re-exports the kit's configuration where the tool reads code; the tool's remote configuration where the repository has no package manager. The consumer pins the kit's version through its lockfile and receives updates through the dependency bot. The kit's README shows each mechanism once; a package README shows its own.

---

## 6. Tests

- Every package has a spec: each configuration it ships parses, and the intent of the configuration is stated as an assertion — a rule that is on, an entry that exists, a floor that holds.
- Every copy generated from `common` has a spec asserting it equals its source.
- The coverage gate of the `testing` chapter applies to code a package executes; configuration files are proven by the specs above.

---

## 7. Dependency rules (enforced by the dependency checker, the manifest check and the tests)

```
packages/common/            → nothing
packages/<language>/libs/*  → its peers, its declared dependencies, common at build time
root                        → the workspace; it installs its own packages to dogfood them
```

**Hard prohibitions:** a package importing another package's files; a runtime dependency on the tool a package configures; a hand-edited copy of a common file; two packages at different versions; an export that is not listed in the manifest.

---

## 8. Definition of done

- [ ] The manifest passes the manifest check: field order, ranges, one version
- [ ] Exports curated, files explicit, the configured tool a peer with a floor
- [ ] README with the install line and the one-line extends
- [ ] A spec per package; every generated copy guarded by a spec
- [ ] The root README lists the package
- [ ] `check` passes
