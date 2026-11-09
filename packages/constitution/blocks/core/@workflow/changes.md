# Changes

> Governs how a change is handed back: what is checked, run and said before it is reported done.

## Vocabulary

A change is **handed back** when whoever made it reports it done to whoever asked for it, and its **hand-back** is that report.

## Hand-back

### change-reports-what-it-left-undone · SHOULD

Every hand-back says what of the task its change left undone.

#### Why

A part of the task left undone and unsaid is taken for done.

#### Examples

```text title="Avoid"
Done: partial refunds.
The check passes.
```

```text title="Prefer"
Done: partial refunds of card payments.
The check passes.

Left undone: partial refunds of bank
transfers, which the task also asked for.
```

### change-handed-back-with-a-passing-check · MUST

Every change is reported done only once the check passes with no error and no warning.

#### Why

A change handed back red passes its failure to the next person, who did not cause it.

#### Examples

```text title="Avoid"
$ check
lint   1 warning: unused import
tests  212 passed
Agent: Done, one warning left.
```

```text title="Prefer"
$ check
lint   no error, no warning
tests  212 passed
Agent: Done; the check passes.
```

### change-seen-working-before-hand-back · SHOULD

Every change to what a user or a caller observes is seen working before it is handed back. It is run once in the built program, the way its user or caller reaches it, such as the subcommand run, the endpoint called, the screen used or the published entry called.

#### Why

A passing check proves only the cases written, so a change handed back unrun fails its user at the first use the cases missed.

#### Examples

```text title="Avoid"
Done: refunds for paid orders.
The check passes.
```

```text title="Prefer"
Done: refunds for paid orders.
The check passes.

Seen working: POST /orders/42/refund
returned 200, and the order page
shows it as Refunded.
```

### hand-back-says-how-the-change-was-seen-working · SHOULD

Every hand-back of a change that was seen working says how it was run.

#### Why

A claim that a change works, with no word of how it was run, cannot be checked or repeated by whoever receives it.

#### Examples

```text title="Avoid"
Done: refunds for paid orders.
The check passes, and I saw it working.
```

```text title="Prefer"
Done: refunds for paid orders.
The check passes.

Seen working: ran the built API, called
POST /orders/42/refund, got 200, and
GET /orders/42 showed it as Refunded.
```

### handed-back-change-names-what-its-abstractions-earn · SHOULD

Every hand-back names the present need that earns each abstraction its change adds. Such abstractions include a contract, an implementation of it, a value with an invariant, a type, an operation, an error code, a level of indirection and a helper.

#### Why

An agent adds structure more readily than it removes it, so an abstraction handed back without its need is read, kept and built on before anyone sees that nothing earns it.

#### Examples

```text title="Avoid"
Done. Added the Payments port,
the card provider's adapter,
Money and a RetryPolicy.
```

```text title="Prefer"
Done. What each addition earns:
  Payments port: the boundary
    with the card provider
  card provider's adapter: the
    one implementation of it
  Money: the invariant that an
    amount keeps its currency
RetryPolicy earned nothing yet;
I left it out.
```
