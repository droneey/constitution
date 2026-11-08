# Lifecycle

> Governs how a Nest program hears its stop signal and waits out its pause for routing.

## Shutdown

### nest-shutdown-hooks-enabled → program-stops-cleanly · MUST

Every Nest program enables its shutdown hooks, by `app.enableShutdownHooks()`.

#### Why

Nest runs no lifecycle hook on `SIGTERM` until shutdown hooks are enabled, so a stopped process leaves its pools and work in flight unclosed.

#### Examples

```ts title="Avoid"
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { RootModule } from './root';

const app = await NestFactory.create(RootModule);

await app.listen(config.port);
```

```ts title="Prefer"
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { RootModule } from './root';

const app = await NestFactory.create(RootModule);

app.enableShutdownHooks();
await app.listen(config.port);
```

### nest-pause-for-routing-awaited-before-shutdown → server-stop-waits-out-its-pause-for-routing · MUST

Every Nest server waits out its pause for routing in a `beforeApplicationShutdown` hook, which Nest awaits before it closes its connections.

#### Why

Nest closes its connections once its `beforeApplicationShutdown` hooks complete, so a server that awaits no pause there refuses the requests its routers still send it (NestJS, lifecycle events).

#### Examples

```ts title="Avoid"
@Injectable()
export class Readiness implements OnModuleDestroy {
  isReady = true;

  onModuleDestroy(): void {
    this.isReady = false;
  }
}
```

```ts title="Prefer"
@Injectable()
export class Readiness implements BeforeApplicationShutdown {
  isReady = true;

  constructor(@Inject(SHUTDOWN_CONFIG) private readonly config: ShutdownConfig) {}

  async beforeApplicationShutdown(): Promise<void> {
    this.isReady = false;
    await setTimeout(this.config.routingPauseMs);
  }
}
```
