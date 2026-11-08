# Metrics

> Governs what is measured, how a metric is labelled and how a duration is recorded and read.

## Labels

### metric-labels-bounded · MUST

Every metric label takes its values from a bounded set, never an identifier, an address or free text.

| Why |
|---|
| every distinct value of a label is a new series, and an unbounded label exhausts the store that holds them. |

## Measures

### served-work-measured-by-rate-failures-duration · SHOULD

Every kind of work item the program serves is measured by its rate, its failures and its duration.

| Why |
|---|
| a service measured without its rate, its failures or its duration looks healthy while the missing one goes wrong, and its users report the fault before any alert fires — the RED method. |

### duration-recorded-as-a-distribution · SHOULD

Every duration a metric records is recorded as a histogram.

| Why |
|---|
| a duration recorded as a single number, such as an average or the last value, loses its tail, and no percentile can be read from it afterwards. |

### duration-buckets-set-around-the-latency-bounds · SHOULD

Every duration histogram's bucket bounds are set by the project around the latency bounds its work is held to. Such bounds include the duration a service level objective names. Exempt: a histogram whose buckets scale by themselves to the values it records, such as an exponential histogram.

| Why |
|---|
| buckets set far from the bounds that matter cannot tell a request just within them from one just past, so the share served in time is read off the wrong bucket. |

### duration-read-by-its-percentiles · SHOULD

Every duration a metric records is read by its percentiles, such as p50, p95 and p99, never by its average alone.

| Why |
|---|
| an average hides the slow tail, and an alert on it stays silent while one user in a hundred waits. |
