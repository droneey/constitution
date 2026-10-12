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
### alert-fires-on-what-users-feel · SHOULD
An alert fires on what the program's users feel — the error rate and the duration of what it serves, past a bound the project sets — rather than on a cause such as a busy processor.

| Why | Tags |
|---|---|
| an alert on a cause wakes someone for what nobody noticed and stays silent for a failure with a cause nobody listed. | [errors] |

