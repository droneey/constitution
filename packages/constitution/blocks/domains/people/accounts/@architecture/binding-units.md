# Binding units

> Governs where a binding unit declares whether its operation needs a verified identity, and what the guard that authenticates reads.

## General

### binding-unit-declares-its-access · MUST

Every binding unit an outside caller reaches declares where it is defined whether its operation needs a verified identity. Such a unit is a route, an endpoint, a subcommand or a tool.

#### Why

Access declared away from its binding unit is not read when that unit is reviewed, so one that lost its access, or never had any, passes review unseen.

#### Examples

```pseudo title="Avoid"
# presentation/bindings/authenticate
let publicOperations = ["list-products", "show-product"]   # access kept away from its units

# catalog/presentation/bindings/queries/list-products
let onListProducts = binding({
  handle: function(request, getProducts, context)
    return ok(getProducts(parseGetProductsInput(request.query), context))
})
```

```pseudo title="Prefer"
# catalog/presentation/bindings/queries/list-products
let onListProducts = binding({
  access: Public,
  handle: function(request, getProducts, context)
    return ok(getProducts(parseGetProductsInput(request.query), context))
})

# orders/presentation/bindings/commands/cancel-order
let onCancelOrder = binding({
  access: SignedIn,
  handle: function(request, cancelOrder, context) ...
})
```

### authenticating-guard-reads-only-the-declarations · MUST

Every guard that authenticates decides whether an operation needs a verified identity only from its binding unit's declaration. Exempt: a guard the calling framework runs where it fixes the place of registration, which `fixed-registration-holds-only-the-handoff` holds.

#### Why

A guard that also reads a list of its own decides each operation's access in two places, so a unit reviewed as protected ships open where the list says otherwise.

#### Examples

```pseudo title="Avoid"
# presentation/bindings/authenticate
let openPaths = ["/health", "/webhooks/payments"]

function authenticate(request, binding, tokenVerifier)
  if binding.access is Public or openPaths.includes(request.path) then   # a second place decides
    return Anonymous

  return tokenVerifier.verify(request.bearerToken)
```

```pseudo title="Prefer"
# presentation/bindings/authenticate
function authenticate(request, binding, tokenVerifier)
  if binding.access is Public then
    return Anonymous

  return tokenVerifier.verify(request.bearerToken)
```
