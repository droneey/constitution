# Metrics

> Governs what is measured and how a metric is labelled.

## Labels

### metric-labels-bounded · MUST

A metric's labels take values from a bounded set — never an identifier, an address or free text.

| Why |
|---|
| every distinct value of a label is a new series, and an unbounded label exhausts the store that holds them. |

## Measures

### served-request-measured-by-rate-errors-and-duration · SHOULD

Every kind of request or task the program serves is measured by its rate, its failures and its duration.

| Why |
|---|
| these three measures show a service's health at a glance, and an alert on them fires before users report a fault. |

### duration-recorded-as-a-distribution · SHOULD

A duration is recorded as a histogram whose bucket bounds the project sets around its latency bounds, and is read by its percentiles — p50, p95, p99 — never by its average alone.

| Why |
|---|
| an average hides the slow tail, and an alert on it stays silent while one user in a hundred waits. |
