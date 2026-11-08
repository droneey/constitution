# Runtimes

> Governs the runtimes a distributed package supports: the floor it declares and the runtimes it is checked on.

## Vocabulary

A distributed package's **runtime floor** is the lowest version of its language's runtime it supports.

A runtime's **release line** is the run of its releases that its maintainers support together, such as one major version.

## Floor

### manifest-declares-the-runtime-floor · MUST

Every distributed package's manifest declares its runtime floor.

#### Why

A consumer on an older runtime then learns at install, by a failure or, where the package manager only warns by default, a warning, and not at run time on a feature the runtime lacks.

#### Examples

```text title="Avoid"
manifest of price-kit
  version     2.1.0
  entry       dist/index
```

```text title="Prefer"
manifest of price-kit
  version     2.1.0
  entry       dist/index
  runtime     >=22.0.0
```

### runtime-floor-within-the-ecosystems-support-window · SHOULD

Every distributed package's runtime floor lies in the oldest release line its runtime's maintainers still support, or a later one.

#### Why

A floor below what the runtime's maintainers support holds back every dependency the package shares with its consumers, and keeps it running where no security fix arrives.

#### Examples

```text title="Avoid"
runtime lines still supported   22, 24, 26
manifest of price-kit
  runtime     >=16.0.0
```

```text title="Prefer"
runtime lines still supported   22, 24, 26
manifest of price-kit
  runtime     >=22.0.0
```

## Checks

### package-checked-on-every-runtime-it-supports · SHOULD

Every distributed package is checked on every release line it supports. These are its floor's release line and each later line its runtime's maintainers still support, up to the newest stable one.

#### Why

A package that claims a runtime it was never run on breaks its consumers there first.

#### Examples

```text title="Avoid"
manifest of price-kit
  runtime     >=22.0.0
check runs on 26
```

```text title="Prefer"
manifest of price-kit
  runtime     >=22.0.0
check runs on 22, 24, 26
```
