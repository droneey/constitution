# Framework

> Governs where the framework that serves the program is imported.

## General

### server-framework-imported-by-the-presentation → layer-imports-dependencies-by-its-role · MUST

Every server framework is imported only in a presentation, where its delivery units and binding units sit. Those units include the routers, handlers and tools that declare its operations, the handlers that answer its failures, and the modules and providers of a framework that has them. Exempt: the edge, which imports any dependency.

#### Why

A framework imported below its delivery units ties the domain and the use cases to it, so they change with each of its releases and cannot be tested without it.

#### Examples

```pseudo title="Avoid"
# orders/application/use-cases/queries/get-order.use-case
import { Request } from "server-framework"

function createGetOrder({ orderQueries })
  return function(request: Request, context)
    return orderQueries.find(request.params.orderId, context)
```

```pseudo title="Prefer"
# orders/presentation/bindings/queries/show-order
import { Request } from "server-framework"

function showOrder(request: Request, getOrder, context)
  return ok(getOrder(parseGetOrderInput(request.params), context))

# orders/application/use-cases/queries/get-order.use-case
function createGetOrder({ orderQueries })
  return function(input: GetOrderInput, context)
    return orderQueries.find(input.orderId, context)
```
