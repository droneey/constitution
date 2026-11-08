# Transport

> Governs where a remote transport is built and imported, how its failures reach the program, and what a port over its system declares of them.

## Vocabulary

A remote system's **access errors** are the two errors of the kernel that stand for its unauthenticated failure and its forbidden failure in the program's own words, among the failures every port over one kind of system declares.

## General

### one-transport-instance-per-system → composition-root-assembles-the-program · SHOULD

Every remote system has one configured instance of its remote transport, handed to every adapter that reaches that system. The instance holds the system's base address, headers and credentials.

#### Why

An adapter that builds its own instance speaks to the system its own way, with its own address and credentials, and a spec must replace each instance apart.

#### Examples

```pseudo title="Avoid"
# payments/infrastructure/payment-provider/payment.adapter
function createPaymentAdapter(config)
  let provider = new HttpTransport({ baseUrl: config.providerUrl, credentials: config.providerKey })

# billing/infrastructure/payment-provider/payout.adapter
function createPayoutAdapter(config)
  let provider = new HttpTransport({ baseUrl: config.providerUrl, credentials: config.payoutKey })
```

```pseudo title="Prefer"
# root/payment-provider
let paymentProvider = new HttpTransport({
  baseUrl: config.paymentProviderUrl,
  credentials: config.paymentProviderKey
})

let paymentAdapter = createPaymentAdapter(paymentProvider)
let payoutAdapter = createPayoutAdapter(paymentProvider)
```

## Homes

### transport-library-home-is-its-systems-client → layer-imports-dependencies-by-its-role · MUST

The remote transport library is imported only by the client of its system, the mapper of its failures and `root/`. `root/` builds the instances, and the client of a system is the module that speaks its remote transport: an adapter of that system, or a client under `libs/` that knows nothing of the program and that its adapters share.

#### Why

The network is an effect, so each other import of the library is one more place a spec cannot replace with a fake, and one more place its failures escape the one mapper every adapter shares.

#### Examples

```text title="Avoid"
imports of http-transport
  root/payment-provider
  payments/infrastructure/payment-provider/payment.adapter
  infrastructure/payment-provider/failures
  payments/application/use-cases/commands/refund-payment
                         catches its TimeoutError
```

```text title="Prefer"
imports of http-transport
  root/payment-provider
  payments/infrastructure/payment-provider/payment.adapter
  infrastructure/payment-provider/failures
```

## Failures

### transport-failures-mapped-once → shared-piece-placed-by-meaning · SHOULD

Every remote transport's failures are mapped by one mapper all its adapters share. It maps them into the failures of the ports they implement, a transient one included.

#### Why

A mapping repeated in each adapter drifts, so one system's failure reaches different features as different errors, and each feature restates what they all share.

#### Examples

```pseudo title="Avoid"
# payments/infrastructure/payment-provider/payment.adapter
catch TransportFailure as failure
  throw failure.status == 429 ? new PaymentProviderBusyError({ cause: failure }) : failure

# billing/infrastructure/payment-provider/payout.adapter
catch TransportFailure as failure
  throw failure.status >= 500 ? new PayoutsUnavailableError({ cause: failure }) : failure
```

```pseudo title="Prefer"
# payments/infrastructure/payment-provider/payment.adapter
catch TransportFailure as failure
  throw mapProviderFailure(failure, paymentCodes)

# billing/infrastructure/payment-provider/payout.adapter
catch TransportFailure as failure
  throw mapProviderFailure(failure, payoutCodes)
```

### transport-mapper-takes-each-features-codes · SHOULD

The remote transport's mapper takes each feature's codes from that feature's own map, never naming them itself.

#### Why

A mapper that named each feature's codes itself would know every feature and change with each of them.

#### Examples

```pseudo title="Avoid"
# infrastructure/payment-provider/failures
function mapProviderFailure(failure)
  when failure.code
    is "card_declined" then return new PaymentRefusedError({ cause: failure })
    is "payout_limit" then return new PayoutLimitReachedError({ cause: failure })
    else return new PaymentProviderUnavailableError({ cause: failure })
```

```pseudo title="Prefer"
# infrastructure/payment-provider/failures
function mapProviderFailure(failure, codes)
  when failure.status
    is 401 then return new UnauthenticatedError({ cause: failure })
    is 403 then return new ForbiddenError({ cause: failure })

  let featureError = codes[failure.code]

  if featureError is not <absent> then
    return new featureError({ cause: failure })

  return new PaymentProviderUnavailableError({ cause: failure })

# payments/infrastructure/payment-provider/payment-codes
let paymentCodes = { card_declined: PaymentRefusedError }
```

### transport-mapper-maps-access-failures-to-the-kernels · MUST

The remote transport's mapper itself maps its system's unauthenticated failure and forbidden failure to its access errors.

#### Why

An access failure mapped by each feature its own way cannot be recognised in one place, so the program ends a session for one feature's refusal and misses another's expiry.

#### Examples

```pseudo title="Avoid"
# infrastructure/payment-provider/failures
function mapProviderFailure(failure, codes)
  let featureError = codes[failure.code]  # 401 and 403 left to each feature's map

  if featureError is not <absent> then
    return new featureError({ cause: failure })

  return new PaymentProviderUnavailableError({ cause: failure })
```

```pseudo title="Prefer"
# infrastructure/payment-provider/failures
function mapProviderFailure(failure, codes)
  when failure.status
    is 401 then return new UnauthenticatedError({ cause: failure })
    is 403 then return new ForbiddenError({ cause: failure })

  let featureError = codes[failure.code]

  if featureError is not <absent> then
    return new featureError({ cause: failure })

  return new PaymentProviderUnavailableError({ cause: failure })
```

### port-over-a-system-declares-its-access-failures · MUST

Every port over a remote system declares that system's access errors among its failures.

#### Why

A port that leaves them out hides from its use case a failure any call through it may meet, so the use case meets an ended session or a refused right as a defect.

#### Examples

```pseudo title="Avoid"
# payments/application/contracts/payment-provider.port
type PaymentProviderPort = {
  refund: function(ChargeId, { key: IdempotencyKey }, CallContext)
    fails with RefundRefusedError, PaymentProviderUnavailableError
}
```

```pseudo title="Prefer"
# payments/application/contracts/payment-provider.port
type PaymentProviderPort = {
  refund: function(ChargeId, { key: IdempotencyKey }, CallContext)
    fails with RefundRefusedError, PaymentProviderUnavailableError,
      UnauthenticatedError, ForbiddenError
}
```
