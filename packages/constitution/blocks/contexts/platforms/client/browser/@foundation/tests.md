# Tests

> Governs the specs of what a browser program's files are served with.

## General

### served-headers-proven-by-a-test · MUST

Every caching and security header a browser rule asks of a served file is read by a test from what is sent.

#### Why

A header nobody reads goes missing unseen, and a missing security header leaves the browser's defence off.

#### Examples

```ts title="Avoid"
test("should set the content security policy", () => {
  // Act
  const policy = securityHeaders["Content-Security-Policy"];

  // Assert
  expect(policy).toContain("object-src 'none'"); // the config, not what is sent
});
```

```ts title="Prefer"
test("should serve the orders page with its content security policy", async ({ request }) => {
  // Act
  const response = await request.get("/orders");

  // Assert
  expect(response.headers()["content-security-policy"]).toContain("object-src 'none'");
});
```
