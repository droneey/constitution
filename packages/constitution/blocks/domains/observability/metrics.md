# Metrics

> Governs what is measured and how a metric is labelled.

## Labels

### metric-labels-bounded · MUST

A metric's labels take values from a bounded set — never an identifier, an address or free text.

| Why | Tags |
|---|---|
| every distinct value of a label is a new series, and an unbounded label exhausts the store that holds them. | [performance] |

## Measures

### served-request-measured-by-rate-errors-and-duration · SHOULD

Every kind of request or task the program serves is measured by its rate, its failures and its duration.

| Why | Tags |
|---|---|
| these three measures show a service's health at a glance, and an alert on them fires before users report a fault. | [performance] |

### duration-recorded-as-a-distribution · SHOULD

A duration is recorded as a histogram whose bucket bounds the project sets around its latency bounds, and is read by its percentiles — p50, p95, p99 — never by its average alone.

| Why | Tags |
|---|---|
| an average hides the slow tail, and an alert on it stays silent while one user in a hundred waits. | [performance] |

### served-work-has-a-service-level-objective · SHOULD

Every kind of request or task the program serves that its users depend on has a service level objective: an indicator measured where users feel it — the share of good answers, the share served within a duration — a target and a window, recorded in the repository.

| Why | Tags |
|---|---|
| a target and its window say how much failure users can bear, so the budget it leaves decides between shipping and fixing, and an alert can measure what is left of it. | [performance] |

### alert-fires-on-what-users-feel · SHOULD

An alert on the health of the work the program serves fires on what its users feel: on the rate at which an objective's error budget burns, over a long and a short window together, never on a single sample past a fixed bound nor on a cause such as a busy processor.

| Why | Tags |
|---|---|
| an alert on a cause wakes someone for what nobody noticed and stays silent for a failure with a cause nobody listed, and one on a fixed bound fires on every short spike and misses a slow burn that spends the budget all the same. | [errors] |
