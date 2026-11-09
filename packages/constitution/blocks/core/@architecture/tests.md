# Tests

> Governs a spec's place in the tree: which units are its boundaries, where fakes live, and how the units that decide nothing are proven.

## Boundaries

### spec-boundaries-follow-the-tree · MUST

Each boundary of the tree gets its spec: what a caller outside a folder reaches through its surface. The boundaries are a use case with the parse of its operation input, an aggregate through its transitions, predicates and derived values, a domain service, a value object with an invariant, an adapter, a delivery unit, a binding unit that decides, an interface-wide unit, a composition module's reusable unit and a lib, and composition gets a spec where it derives a fact or implements a port. Exempt: a binding unit that only hands an operation over, proven through the delivery units that consume it, and the root and the entry files, which decide nothing and are proven by the boot spec.

#### Why

A unit another part relies on that has no spec breaks unseen, and a spec of what sits behind a surface breaks whenever it moves while the behaviour stays.

#### Examples

```text title="Tree"
src/
├── <entry>                             no spec: proven by the boot spec
├── root/                               no spec: proven by the boot spec
├── features/orders/
│   ├── domain/
│   │   ├── order/transitions/          spec: the aggregate, through its transitions
│   │   ├── order/value-objects/        spec: a value object with an invariant
│   │   └── order/errors/               no spec: proven through callers
│   ├── application/
│   │   └── use-cases/                  spec: each use case, with its parse
│   ├── infrastructure/database/        spec: an adapter
│   ├── presentation/                   spec: a delivery unit, a binding unit that decides
│   └── <surface>
├── composition/checkout/               spec where it derives a fact
└── libs/retry/                         spec: a lib
```

## Fakes

### port-fake-sits-beside-its-port · SHOULD

Every port's fake sits in the folder of specs beside the port, in its port owner's `contracts/`.

#### Why

A fake kept beside one spec is copied by the next, and one kept away from its port is missed when the port changes.

#### Examples

```text title="Avoid"
features/orders/
└── application/
    ├── contracts/
    │   └── payment.port
    └── use-cases/commands/__tests__/
        ├── pay-order.use-case.test
        └── payment.fake
```

```text title="Prefer"
features/orders/
└── application/
    ├── contracts/
    │   ├── payment.port
    │   └── __tests__/
    │       └── payment.fake
    └── use-cases/commands/__tests__/
        └── pay-order.use-case.test
```

### contract-suite-sits-beside-its-port · SHOULD

Every port's contract suite sits in the folder of specs beside the port, in its port owner's `contracts/`.

#### Why

A suite kept beside one adapter is not found by the next adapter or the fake, which then answer to no suite.

#### Examples

```text title="Avoid"
features/orders/
├── application/contracts/
│   └── payment.port
└── infrastructure/payment-provider/__tests__/
    ├── payment.adapter.integration.test
    └── payment.suite
```

```text title="Prefer"
features/orders/
├── application/contracts/
│   ├── payment.port
│   └── __tests__/
│       ├── payment.fake
│       └── payment.suite
└── infrastructure/payment-provider/__tests__/
    └── payment.adapter.integration.test
```
