# Comments

> Governs a comment and the documentation of what a package publishes.

## Vocabulary

A declaration a package **publishes** is one its published entries, as the dependencies chapter defines them, lead to, directly or through files that re-export it.

The **reason marker** is **`Why:`**{#reason-marker}, a default.

## General

### comment-says-only-what-the-code-cannot · MUST

Every comment says only what the code cannot. The code first says all it can, by a name, a type or an extracted function, and a comment that stands in for a name, a type or a function is replaced by it; documentation gives what its declaration does for a caller, such as what it requires of its input, a unit of measure, a failure, an effect, a bound or a default, and never restates its names and types.

#### Why

A comment that repeats the code stays where it was written while the code changes, so it drifts and misleads the next reader.

#### Examples

```pseudo title="Avoid"
# add one day to the issue date
let settlesOn = issuedOn.plusDays(1)
```

```pseudo title="Prefer"
# Why: the bank settles a day after issue
let settlesOn = issuedOn.plusDays(1)
```

### comment-is-of-a-known-kind · SHOULD

Every comment is of one of four kinds: the documentation of what a package publishes; a tool's directive, in the tool's own form, with its reason; a mark another rule asks for; or a reason, opened by the reason marker, that gives a constraint, a workaround, a decision or a fact of an outside system the code cannot carry. A comment of no kind, a to-do among them, is removed.

#### Why

A comment of no known kind cannot be judged where it stands, so it stays whether or not it still holds.

#### Examples

```pseudo title="Avoid"
# TODO: handle partial refunds later
# loop over the lines
for line in order.lines
  refundLine(line)
```

```pseudo title="Prefer"
# Why: the bank refunds each card charge on its own, never a sum of them
for line in order.lines
  refundLine(line)
```

### only-published-declarations-documented · SHOULD

Only a declaration a package publishes is documented. Exempt: what another rule asks to be documented.

#### Why

A package's caller reads its documentation in place of its code, while code inside it is read where it stands, so documentation inside it adds reading and drifts.

#### Examples

```pseudo title="Avoid"
# invoices/domain/invoice-total
/**
 * Net of discounts, before tax; zero for an invoice with no lines.
 */
function netTotal(lines)
  return sum(lines, line -> line.netAmount)
```

```pseudo title="Prefer"
# invoices/domain/invoice-total
function netTotal(lines)
  return sum(lines, line -> line.netAmount)

# invoices/index
/**
 * Issues the invoice of a placed order, in the order's currency.
 * Fails with OrderNotPlacedError while the order is a draft.
 */
export function issueInvoice(order) -> Invoice | OrderNotPlacedError
```
