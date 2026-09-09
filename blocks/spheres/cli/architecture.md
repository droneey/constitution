# Architecture — cli

> The single source of truth for how a **command-line tool** is structured: a program that reads a declared document, validates it, and converges the world to it through vendors behind ports. Every developer — and every agent — follows this. No improvisation.
> Framework-free: the command framework, the schema engine and the runtime are the `stack` chapter's. Boundaries are enforced mechanically by the dependency checker.

---

## 0. Philosophy

- **Declared state in, convergence out.** The tool's input is a document the user writes. Every run reads it whole, validates it, and moves the world toward it. A second run with the same input changes nothing — safe as a daily cron.
- **Ports and adapters, centralised.** A vendor is an implementation detail behind a port the tool names in its own words. A new vendor is one adapter plus one provider file; no feature learns the vendor's name.
- **Thin commands, fat features.** A command parses flags, resolves the document and calls a use-case. Everything that decides lives in a feature.
- **Nothing reaches back to the wiring.** The entrypoint and the app layer are the top of the graph; no module imports them.

---

## 1. Top-level structure

```
src/
├── main.ts          # entrypoint: builds the CLI from app/ and runs it
├── app/             # WIRING: commands/, the composition root, the command context, the error handler, exit codes
│   └── commands/    # one <name>.command.ts per command; shared flag definitions; the document requirement
├── features/        # vertical slices, one per concern of the tool (config, environment, platform, dns, …)
│   └── <feature>/
│       ├── public/      # index.ts — the feature's ONLY surface to the outside
│       ├── use-cases/   # <name>/<name>.use-case.ts (+ steps/ when the use-case is a pipeline)
│       ├── shared/      # models/ and the helpers several use-cases of THIS feature share
│       └── providers/   # OPTIONAL — one file per vendor the feature knows by name, plus the registry
├── ports/           # what the inner layers need from the outside, in the tool's words: <name>/<name>.port.ts + models/
├── adapters/        # one folder per external system: implements ports, knows the vendor's API, nothing else
│   └── <vendor>/    # create-<vendor>-<role>.ts, models/, public/index.ts
└── kit/             # PURE PRIMITIVES with zero app knowledge: fs, process, http, clock, logger, errors, units, …
```

Composition flows **down** from `app`: the composition root instantiates adapters and kit primitives, wires them into the dependency records the features declare, and hands every command a **command context**. A feature receives its dependencies as an explicit record typed by ports; it never constructs an adapter.

---

## 2. Feature structure

- **`public/index.ts` is curated** (principles, Law 7): it exports the use-cases and the types another feature or the app may couple to — nothing else.
- **`use-cases/<name>/`** holds one operation as `<name>.use-case.ts`. A use-case that runs as a pipeline keeps its stages under `steps/`, each a function over a pipeline context; the use-case file orders the stages, and a stage never calls another stage.
- **`shared/models/`** holds the feature's types with the `.model.ts` suffix; `shared/<topic>/` holds helpers several use-cases share. Co-location by reason to change: a helper one use-case needs lives beside that use-case.
- **`providers/`** exists only in a feature that maps a concern to vendors: `<concern>-provider.model.ts` declares what a vendor must provide, one `<vendor>.ts` per vendor realises it, and `index.ts` is the registry keyed by the vendor's name in the document. **Adding a vendor is adding a file** — there is no conditional on a vendor name anywhere else.
- Cross-feature access goes through `public` only; a feature never reaches another's `use-cases` or `shared`.

---

## 3. Ports and adapters

- A **port** is a folder `ports/<name>/` with `<name>.port.ts` declaring the interface, `models/` declaring the types the interface speaks, and `index.ts` — the only import path. A port knows no vendor, no feature and no other port; it may use the kit.
- An **adapter** implements one port — or the several ports one external system serves — over that system's API: `create-<vendor>-<role>.ts` builds the implementation from its dependencies (a fetch function, a process runner, a file system), `models/` holds the vendor's shapes, `public/index.ts` exposes the factory. Adapters never import features, the app or each other.
- **Wire shapes and vendor quirks die in the adapter** (Law 8): what leaves it is typed by the port's models, and a vendor's failure becomes a coded error the caller can act on.
- Two adapters are never coupled: what they would share lives in the kit.

---

## 4. The document

- The document is the **single input**. Its schema is one feature: a strict schema per section, discriminated unions for anything that varies by `provider` or `kind`, unknown keys rejected, every constraint that spans fields checked in validation, never at use.
- A feature the document turns on is **explicit**; a resource exists **by presence**. Absent means untouched; explicitly off means actively off.
- **Secrets are references** (`security` §1): the document names `${NAME}`, validation lists every name it needs, and the tool reads only those names — never a variable by a name of its own.
- **One syntax per kind of value** across the whole document — one size syntax, one duration syntax — parsed once, in the kit.
- The published JSON schema is **generated** from the code's schema, never written by hand.

---

## 5. Runs are pipelines of stages

- `validate → render → plan → apply` are separate use-cases; each may run alone and the later ones reuse the earlier. `render` runs no engine.
- A run **reports per stage** — `skipped` with a reason, `unchanged`, `changed`, `ran`, `failed` — and the report is a value the app prints, not lines printed along the way.
- A destroying change is refused unless the user passed the explicit flag (`security` §5).
- **Idempotence is a tested property:** applying the same document twice reports no change the second time.

---

## 6. Errors and exit codes

- Every failure the tool raises is a **coded error**: a message for the user, a stable `code`, and `details` lines that say what to do. The kit defines the base class and its guard; each feature declares its codes.
- The app's **error handler is the only place that prints a failure and exits**: a coded error prints its message and details and exits with the code the app maps for it; anything else is the tool's own bug and exits with the internal code. Exit codes: **0** success, **1** the user can act, **2** the tool failed at something it owns.
- No stack traces to the user, no swallowed failures (Law 14), no process exit outside the handler.

---

## 7. Dependency rules (enforced by the dependency checker)

```
main.ts, app/  → features (public only), adapters (public only), ports (barrel only), kit
features/      → own feature, other features (public only), ports (barrel only), kit — NEVER adapters
adapters/      → own adapter, ports (barrel only), kit — never features, app or another adapter
ports/         → own port, kit — never a vendor, a feature or another port
kit/           → itself and external packages only
__tests__/     → reachable from tests only; production code never imports a fake or a fixture
```

**Hard prohibitions (the check fails):** anything importing `app/` or `main.ts`; a feature importing an adapter; an adapter importing an adapter; a port importing a port; a deep import past a `public` or a port barrel; a cycle; an orphan module.

---

## 8. Testing the tool

Per the `testing` chapter: every effect has a kit primitive with a fake — file system, process runner, fetch, clock; a feature is tested with a fake dependency record; an adapter is tested against a fake of the vendor's API built from captured fixtures, never the vendor; a command is tested through the CLI with a fake command context and captured console and exit. A real vendor is exercised only by a human running the tool.

---

## 9. Recipes

- **Add a command:** `<name>.command.ts` in `app/commands` (flags, the document requirement, one use-case call) → register it in the commands index → a spec through the CLI with a fake context.
- **Add a vendor:** the provider file in the feature's `providers/` and its registry entry → the adapter under `adapters/<vendor>/` implementing the port → the composition root wires the factory → fixtures of the vendor's API for the adapter's spec.
- **Add a port:** `ports/<name>/` with the interface and models → a fake in its `__tests__/` → the adapter that implements it.
- **Add a document section:** the schema in the config feature → the cross-field rules → the feature that consumes it → the JSON schema regenerated.

---

## 10. Definition of done

- [ ] Commands are thin; every decision lives in a feature use-case
- [ ] No feature names a vendor; every vendor sits behind a port in an adapter, registered by one provider file
- [ ] The document schema is strict; validation lists every environment name; no variable is read by a name of the tool's own
- [ ] Every failure is a coded error with an actionable detail; exit codes come from the one map
- [ ] A second run with the same input reports no change, and a spec proves it
- [ ] The dependency check passes; a fake covers every effect
