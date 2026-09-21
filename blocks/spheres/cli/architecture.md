# Architecture — cli

> The single source of truth for how a **command-line tool** is structured: a program that reads a declared document, validates it, and converges the world to it through vendors behind ports. Every developer — and every agent — follows this. No improvisation.
> Framework-free: the command framework, the schema engine and the runtime are the `stack` chapter's. Boundaries are enforced mechanically by the dependency checker.

---

## 0. Philosophy

- **Declared state in, convergence out.** The tool's input is a document the user writes. Every run reads it whole, validates it, and moves the world toward it. A second run with the same input changes nothing — safe as a daily cron.
- **Ports and adapters, centralised.** A vendor is an implementation detail behind a port the tool names in its own words. A new vendor is one adapter plus one provider file; no feature learns the vendor's name.
- **Thin commands, fat features.** A command parses flags, resolves the document and calls a use-case. Everything that decides lives in a feature, or in an integration when it joins features.
- **Features see no one; composition happens above.** A feature knows its own concern and nothing else. What joins two of them — a record that points at a machine, a run that orders the stages — lives in the layer above, the only code that knows several features at once.
- **Nothing reaches back to the wiring.** The entrypoint and the app layer are the top of the graph; no module imports them.

---

## 1. Top-level structure

```
src/
├── main.ts          # entrypoint: builds the CLI from app/ and runs it
├── app/             # WIRING: commands/, the shared flags and the document requirement, the composition root, the command context, the error handler, exit codes
│   └── commands/    # one <name>.command.ts per command, and nothing else
├── integrations/    # ORCHESTRATION: the only code that knows several features — the document, the run; same shape as a feature
├── features/        # vertical slices, one per concern of the tool (dns, edge, cluster, …), each blind to the others
│   └── <feature>/
│       ├── public/      # index.ts — the feature's ONLY surface to the outside
│       ├── use-cases/   # <name>/<name>.use-case.ts (+ steps/ when the use-case is a pipeline)
│       ├── shared/      # models/ and the helpers several use-cases of THIS feature share
│       └── providers/   # OPTIONAL — the contract, the registry, and vendors/ with one file per vendor
├── ports/           # what the inner layers need from the outside, in the tool's words: <name>/<name>.port.ts + models/
├── adapters/        # one folder per external system: implements ports, knows the vendor's API, nothing else
│   └── <vendor>/    # create-<vendor>-<role>.ts, models/, public/index.ts
└── kit/             # PURE PRIMITIVES with zero app knowledge: fs, process, http, clock, logger, errors, units, …
```

Composition flows **down** from `app`: the composition root instantiates adapters and kit primitives, wires them into the dependency records the features declare, and hands every command a **command context**. A feature receives its dependencies as an explicit record typed by ports, and its input as a value built for it; it never constructs an adapter and never reads the document.

---

## 2. Feature structure

- **`public/index.ts` is curated** (principles, Law 7): it exports the use-cases and the types an integration or the app may couple to — nothing else.
- **`use-cases/<name>/`** holds one operation as `<name>.use-case.ts`. A use-case that runs as a pipeline keeps its stages under `steps/`, each a function over a pipeline context; the use-case file orders the stages, and a stage never calls another stage.
- **`shared/models/`** holds the feature's types with the `.model.ts` suffix; `shared/<topic>/` holds helpers several use-cases share. Co-location by reason to change: a helper one use-case needs lives beside that use-case.
- **`providers/`** exists only in a feature that maps a concern to vendors, and it is laid out as `principles` §5 asks: `vendors/` holds one `<vendor>.ts` per vendor and nothing else, `<concern>-provider.model.ts` beside it declares what a vendor must provide, `registry.ts` is the registry keyed by the vendor's name in the document, and `index.ts` only re-exports. **Adding a vendor is adding a file** — there is no conditional on a vendor name anywhere else.
- **A feature imports no other feature and no document type.** It takes an input built for its use-case — carrying what the feature uses and nothing more — and returns what it owns. Its vocabulary, its enums and the names of its vendors, is declared in the feature and exported from its `public/`; the document imports it from there.
- **An integration** has a feature's shape and reaches a feature only through its `public/`. It reads the document, builds each feature's input, and orders the work; one integration may use another's `public/`. A fact two features share — a hostname a record points at and a tunnel routes — is derived here and handed to each, never looked up by one feature in another's section.

---

## 3. Ports and adapters

- A **port** is a folder `ports/<name>/` with `<name>.port.ts` declaring the interface, `models/` declaring the types the interface speaks, and `index.ts` — the only import path. A port knows no vendor, no feature and no other port; it may use the kit.
- An **adapter** implements one port — or the several ports one external system serves — over that system's API: `create-<vendor>-<role>.ts` builds the implementation from its dependencies (a fetch function, a process runner, a file system), `models/` holds the vendor's shapes, `public/index.ts` exposes the factory. Adapters never import features, the app or each other.
- **Wire shapes and vendor quirks die in the adapter** (Law 8): what leaves it is typed by the port's models, and a vendor's failure becomes a coded error the caller can act on.
- Two adapters are never coupled: what they would share lives in the kit.

---

## 4. The document

- The document is the **single input**, and it lives in an integration, because it knows every section: a strict schema per section, discriminated unions for anything that varies by `provider` or `kind`, unknown keys rejected, every constraint that spans fields checked in validation, never at use.
- **A section may be absent; a field inside one may not.** An absent section is untouched. Inside a declared section every field the tool manages is stated, and "there is none" is written rather than left silent, so the document is the whole truth about what it manages and a run writes exactly what it says. A switched feature is off explicitly and carries nothing else.
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
main.ts, app/  → integrations and features (public only), adapters (public only), ports (barrel only), kit
integrations/  → own integration, other integrations and features (public only), ports (barrel only), kit — NEVER adapters
features/      → own feature, ports (barrel only), kit — NEVER another feature, an integration or an adapter
adapters/      → own adapter, ports (barrel only), kit — never features, integrations, app or another adapter
ports/         → own port, kit — never a vendor, a feature or another port
kit/           → itself and external packages only
__tests__/     → reachable from tests only; production code never imports a fake or a fixture
```

**Hard prohibitions (the check fails):** anything importing `app/` or `main.ts`; a feature importing another feature, an integration or an adapter; an adapter importing an adapter; a port importing a port; a deep import past a `public` or a port barrel; a cycle; an orphan module.

---

## 8. Testing the tool

Per the `testing` chapter: every effect has a kit primitive with a fake — file system, process runner, fetch, clock; a feature is tested with a fake dependency record; an adapter is tested against a fake of the vendor's API built from captured fixtures, never the vendor; a command is tested through the CLI with a fake command context and captured console and exit. A real vendor is exercised only by a human running the tool.

---

## 9. Recipes

- **Add a command:** `<name>.command.ts` in `app/commands` (flags, the document requirement, one use-case call) → register it in the commands index → a spec through the CLI with a fake context.
- **Add a vendor:** the file in the feature's `providers/vendors/` and its registry entry → the adapter under `adapters/<vendor>/` implementing the port → the composition root wires the factory → fixtures of the vendor's API for the adapter's spec.
- **Add a port:** `ports/<name>/` with the interface and models → a fake in its `__tests__/` → the adapter that implements it.
- **Add a document section:** its vocabulary in the owning feature's `public/` → the schema and the cross-field rules in the document's integration → the integration builds the feature's input → the JSON schema regenerated.

---

## 10. Definition of done

- [ ] Commands are thin; every decision lives in a feature use-case, or in an integration when it joins features
- [ ] No feature imports another feature or a document type; each takes an input built for it
- [ ] No feature names a vendor; every vendor sits behind a port in an adapter, registered by one provider file
- [ ] The document schema is strict; validation lists every environment name; no variable is read by a name of the tool's own
- [ ] Every failure is a coded error with an actionable detail; exit codes come from the one map
- [ ] A second run with the same input reports no change, and a spec proves it
- [ ] The dependency check passes; a fake covers every effect
