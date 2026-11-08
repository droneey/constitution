# Metrics

> Governs what is measured, how a metric is labelled and how a duration is recorded and read.

## Labels

### metric-labels-bounded · MUST

Every metric label takes its values from a bounded set, never an identifier, an address or free text.

#### Why

Every distinct value of a label is a new series, and an unbounded label exhausts the store that holds them.

#### Examples

```pseudo title="Avoid"
checkouts.add(1, {
  customerId: input.customerId,
  path: request.url
})
```

```pseudo title="Prefer"
checkouts.add(1, {
  "http.route": request.route,
  outcome: outcomeOf(answer)
})
```

## Measures

### served-work-measured-by-rate-failures-duration · SHOULD

Every kind of work item the program serves is measured by its rate, its failures and its duration.

#### Why

A service measured without its rate, its failures or its duration looks healthy while the missing one goes wrong, and its users report the fault before any alert fires — the RED method.

#### Examples

```text title="Avoid"
work item     check-out
measured by   check-outs per second
```

```text title="Prefer"
work item     check-out
measured by   rate       check-outs per second
              failures   check-outs failed per second
              duration   histogram of check-out duration
```

### duration-recorded-as-a-distribution · SHOULD

Every duration a metric records is recorded as a histogram.

#### Why

A duration recorded as a single number, such as an average or the last value, loses its tail, and no percentile can be read from it afterwards.

#### Examples

```pseudo title="Avoid"
let checkoutDuration = meter.gauge("checkout.duration.average", { unit: "s" })
```

```pseudo title="Prefer"
let checkoutDuration = meter.histogram("checkout.duration", { unit: "s" })
```

### duration-buckets-set-around-the-latency-bounds · SHOULD

Every duration histogram's bucket bounds are set by the project around the latency bounds its work is held to. Such bounds include the duration a service level objective names. Exempt: a histogram whose buckets scale by themselves to the values it records, such as an exponential histogram.

#### Why

Buckets set far from the bounds that matter cannot tell a request just within them from one just past, so the share served in time is read off the wrong bucket.

#### Examples

```pseudo title="Avoid"
let checkoutDuration = meter.histogram("checkout.duration", {
  unit: "s",
  buckets: [1, 5, 10, 30]  # the objective's 0.3 s falls inside the first bucket
})
```

```pseudo title="Prefer"
# Why: the objective holds 95% of check-outs within 0.3 s
let checkoutDuration = meter.histogram("checkout.duration", {
  unit: "s",
  buckets: [0.05, 0.1, 0.2, 0.3, 0.5, 1, 2.5]
})
```

### duration-read-by-its-percentiles · SHOULD

Every duration a metric records is read by its percentiles, such as p50, p95 and p99, never by its average alone.

#### Why

An average hides the slow tail, and an alert on it stays silent while one user in a hundred waits.

#### Examples

```text title="Avoid"
check-out duration
  average   180 ms
```

```text title="Prefer"
check-out duration
  p50       120 ms
  p95       290 ms
  p99       1.8 s
```
