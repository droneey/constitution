# TypeScript

> Governs core's tree spelled in TypeScript: imports, role files, surfaces, ports and the wiring file.

## Layers

### timer-set-only-by-the-edge-and-binding-units → effects-held-only-by-the-edge · MUST

`setTimeout`, `setInterval` and `setImmediate` are called only at the edge and in a binding unit that schedules its own work.

| Why | Tags |
|---|---|
| a timer reads the clock, so code that sets one outside them waits on time no spec can hand in. | [] |

## Layout

### hash-imports-leave-the-module → module-files-import-each-other-directly · MUST

An import that leaves its module is written from `#/`, and an import inside its module by a relative path.

| Why | Tags |
|---|---|
| the specifier then shows at a glance whether an import crosses a module's border. | [] |

### role-suffix-spelled-after-a-dot → file-carries-its-role-suffix · MUST

A role file is `<name>.<role>.ts` — `order.entity.ts`, `orders.repository.ts` — its role spelled as the vocabulary spells it.

| Why | Tags |
|---|---|
| the dot sets the role apart from a kebab-case name of several words, so the role reads the same way in every folder. | [] |

### surface-is-the-folders-index-ts → surface-only-on-a-module-or-one-kind · MUST

A surface is the `index.ts` of its folder, and a folder that has no surface — a layer folder, the source of an application — holds no `index.ts`.

| Why | Tags |
|---|---|
| `index.ts` is the file a folder's import resolves to, so one placed in a layer folder opens a door core keeps shut. | [] |

### surface-imported-by-its-folders-path → module-reached-only-through-its-surface · MUST

An import of a surface names its folder — `#/features/orders`, `#/kernel/errors` — never its `index` or a file below it; code that runs on a runtime that maps no folder to its surface, or resolves no `#/` specifier, is bundled first.

| Why | Tags |
|---|---|
| the specifier then names the door it goes through, and an import that reaches past the surface shows as a breach in the import itself. | [] |

## Ports

### null-mapped-to-undefined-in-the-adapter → outside-shape-mapped-in-the-adapter · MUST

A `null` of an outside format lives only in wire types and in the adapters that read and write them, which map it to and from `undefined`.

| Why | Tags |
|---|---|
| a `null` that travels inward brings a second absence into code that checks only for `undefined`. | [] |

### port-is-an-interface → contract-declared-by-the-layer-that-needs-it · MUST

A port is an `interface`, or a type of functions, holding no implementation, so an adapter conforms to it by its shape and never extends a class to implement it.

| Why | Tags |
|---|---|
| the inner layer then owns only a description, and an adapter that shares no base class can change, or give way to a fake, without touching the code that depends on the port. | [] |

## Root

### wiring-file-is-root-wiring-ts → composition-root-wires-everything · MUST

The program is wired in `root/wiring.ts`, unless the block of the program's framework names another file.

| Why | Tags |
|---|---|
| the one known place core asks for then has one name in every TypeScript program, and a reader opens it without searching. | [] |

### process-env-read-only-under-root → root-alone-reads-the-environment · MUST

`process.env`, and every alias of it the runtime offers, is read only under `root/`, in the entry files and in specs.

| Why | Tags |
|---|---|
| it is where a TypeScript program on a server or a command line reads a variable, and a read deep in the program is a dependency on the process that no signature shows. | [security] |
