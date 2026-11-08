# Captured responses

> Governs the captured responses that stand in for another system in a spec.

## General

### captured-response-verified-against-its-system · SHOULD

Every captured response is verified against the system that gave it: it is captured again and any difference is reported. Exempt: a system of the same repository, which is checked against its own contract.

#### Why

A remote system changes its answers without telling anyone, and a spec on an old capture keeps passing while the program breaks — contract testing.

#### Examples

```text title="Avoid"
captures/payment-provider/
└── create-charge.json   captured 2024-05-10,
                         never again
```

```text title="Prefer"
captures/payment-provider/
└── create-charge.json   captured 2026-11-02

nightly   capture again from the provider's
          sandbox, report each difference:
          "amount_due" now "amount_owed"
```

### unmatched-request-fails-the-spec → test-runs-in-a-sandbox · MUST

Where a spec's remote transport serves captured responses, every request none of them matches fails the spec, naming its method and address.

#### Why

A request nobody captured otherwise gets an empty answer, and the spec passes on code that would fail against the real system — fail fast.

#### Examples

```pseudo title="Avoid"
# __tests__/support/captured-transport
function respond(request)
  let capture = captures.find(request)

  return capture?.response ?? { status: 200, body: {} }  # an empty answer for a request nobody captured
```

```pseudo title="Prefer"
# __tests__/support/captured-transport
function respond(request)
  let capture = captures.find(request)

  if capture is <absent> then
    throw new UnmatchedRequestError(request.method + " " + request.url)

  return capture.response
```
