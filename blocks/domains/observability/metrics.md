# Metrics

> Governs a metric's labels.

## Labels

### metric-labels-bounded · MUST
A metric's labels take values from a bounded set — never an identifier, an address or free text.

| Why | Tags |
|---|---|
| every distinct value of a label is a new series, and an unbounded label exhausts the store that holds them. | [performance] |
