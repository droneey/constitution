# App

> Governs how the root assembles the app, includes its routers and registers its error handlers.

## General

### app-assembled-by-the-root → composition-root-assembles-the-program · MUST

Only the composition root assembles the FastAPI app. It builds the app from its `lifespan`, middleware and error handlers, each taken from the unit that owns it, and builds the dependencies its handlers take through `Depends`.

#### Why

An app assembled in several places hides its concrete choices among them, so a spec cannot build the same app with fakes.

#### Examples

```py title="Avoid"
# src/shop/features/orders/presentation/routes.py
app = FastAPI(lifespan=orders_lifespan)
app.add_middleware(CorrelationIdMiddleware)
```

```py title="Prefer"
# src/shop/root/app.py
def build_app(config: Config) -> FastAPI:
    app = FastAPI(lifespan=build_lifespan(config))
    app.add_middleware(CorrelationIdMiddleware)
    register_error_handlers(app)
    app.include_router(build_orders_router(OrdersContext(config=config)))
    return app
```

### routers-built-by-a-function-the-root-calls → delivery-unit-registered-by-the-root · MUST

Every router the composition root includes is built by a function its presentation offers. Each presentation of a feature, of a composition module or of the program offers a function that declares its routes from the context the root hands it, and no router is decorated as its module loads.

#### Why

A router its module decorates on import registers itself where the root lists nothing, and closes over whatever its module built, so a spec cannot build the app with fakes.

#### Examples

```py title="Avoid"
# src/shop/features/orders/presentation/routes.py
router = APIRouter(prefix="/orders")


@router.get("/{order_id}")
async def show_order(order_id: OrderId) -> OrderView:
    return await get_order(order_id)
```

```py title="Prefer"
# src/shop/features/orders/presentation/routes.py
def build_orders_router(context: OrdersContext) -> APIRouter:
    router = APIRouter(prefix="/orders")

    @router.get("/{order_id}")
    async def show_order(order_id: OrderId) -> OrderView:
        return await context.get_order(order_id)

    return router
```

### exception-handler-per-class-shares-one-mapping → one-error-handler-registered-by-the-root · MUST

The composition root registers one error handler per class on the app, all answering through one shared mapping. Together they are the one error handler, and the classes are the base error of the program's error library, `RequestValidationError`, Starlette's `HTTPException` and `Exception`.

#### Why

FastAPI answers each class by the handler registered for it, so a class left out is answered in the framework's own shape, and handlers that each map their failures their own way answer one failure in two shapes; a handler on FastAPI's `HTTPException` alone misses an unknown route or method, which Starlette's base class carries.

#### Examples

```py title="Avoid"
# src/shop/root/errors.py
def register_error_handlers(app: FastAPI) -> None:
    app.add_exception_handler(ShopError, answer_shop_error)
    app.add_exception_handler(fastapi.HTTPException, answer_http_exception)
```

```py title="Prefer"
# src/shop/root/errors.py
def register_error_handlers(app: FastAPI) -> None:
    for error_class in (
        ShopError,
        RequestValidationError,
        starlette.exceptions.HTTPException,
        Exception,
    ):
        app.add_exception_handler(error_class, answer_failure)
```
