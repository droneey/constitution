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
