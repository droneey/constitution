# Specs

> Governs how a spec builds, drives and closes the Nest program.

## General

### specs-through-the-testing-module → server-spec-runs-in-process · MUST

Every unit or integration spec that drives the Nest server builds it from the root's module with `Test.createTestingModule`. It sends its requests in the spec's process, by `app.inject()` where the HTTP library Nest runs on offers it, or by supertest on `app.getHttpServer()`. Exempt: an end-to-end spec, and a spec that proves the server's own start or stop.

#### Why

A spec that assembles its own modules proves another program than the one that ships.

#### Examples

```ts title="Avoid"
test('should list the orders', async () => {
  // Arrange
  const app = express().use(createOrdersRouter(new OrderRepositoryFake()));

  // Act
  const response = await request(app).get('/orders');

  // Assert
  expect(response.status).toBe(200);
});
```

```ts title="Prefer"
test('should list the orders', async () => {
  // Arrange
  const moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();
  const app = moduleRef.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

  await app.init();

  // Act
  const response = await app.inject({ method: 'GET', url: '/orders' });
  await app.close();

  // Assert
  expect(response.statusCode).toBe(200);
});
```

### nest-app-closed-inside-its-case → case-independent-of-order · MUST

Every Nest spec that builds its app with `Test.createTestingModule` runs its `init()` and `close()` inside its case.

#### Why

An app a case leaves open keeps its connections and timers for the next case, which then passes or fails by what ran before it, and keeps the runner from ending.

#### Examples

```ts title="Avoid"
let app: INestApplication;

beforeAll(async () => {
  const moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();
  app = moduleRef.createNestApplication();
  await app.init();
});

test('should list the orders', async () => {
  // Act
  const response = await request(app.getHttpServer()).get('/orders');

  // Assert
  expect(response.status).toBe(200);
});
```

```ts title="Prefer"
test('should list the orders', async () => {
  // Arrange
  const moduleRef = await Test.createTestingModule({ imports: [RootModule] }).compile();
  const app = moduleRef.createNestApplication();

  await app.init();

  // Act
  const response = await request(app.getHttpServer()).get('/orders');
  await app.close();

  // Assert
  expect(response.status).toBe(200);
});
```

### nest-spec-endpoint-left-to-the-system → server-spec-port-chosen-by-the-system · MUST

Every Nest spec that has its app listen has it listen by `app.listen(0, '127.0.0.1')`, before supertest drives `app.getHttpServer()`.

#### Why

A spec that listens on a fixed endpoint collides with another run's, and fails at random when specs run side by side.

#### Examples

```ts title="Avoid"
// Arrange
const app = moduleRef.createNestApplication();

await app.listen(3000);
```

```ts title="Prefer"
// Arrange
const app = moduleRef.createNestApplication();

await app.listen(0, '127.0.0.1');

const agent = request(app.getHttpServer());
```
