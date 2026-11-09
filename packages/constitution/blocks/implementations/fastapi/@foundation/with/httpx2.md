# httpx2

> Governs the transport a spec drives the app through.

## General

### specs-through-the-asgi-transport → server-spec-runs-in-process · MUST

Every spec sends its requests to the app through `httpx2.ASGITransport(app=app)`, and enters the app's `lifespan` itself when the case needs it.

#### Why

A spec over a socket needs a running server outside the case, while the transport hands each request to the app as a server would; the transport runs no `lifespan`, so a case that needs what it opens fails on a resource never opened unless it enters it.

#### Examples

```py title="Avoid"
async def test_should_answer_404_when_the_order_is_unknown() -> None:
    # Arrange
    async with httpx2.AsyncClient(base_url="http://localhost:8000") as client:
        # Act
        response = await client.get("/orders/unknown")
    # Assert
    assert response.status_code == 404
```

```py title="Prefer"
async def test_should_answer_404_when_the_order_is_unknown() -> None:
    # Arrange
    app = build_app(fake_dependencies())
    transport = httpx2.ASGITransport(app=app)
    async with httpx2.AsyncClient(transport=transport, base_url="http://shop.test") as client:
        # Act
        response = await client.get("/orders/unknown")
    # Assert
    assert response.status_code == 404
```
