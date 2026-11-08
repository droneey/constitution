# Configuration

> Governs who creates the pino instance, the facade over it, and where its trace id is read back.

## General

### pino-configured-by-the-root → root-alone-configures-logging · MUST

Only `root/` configures pino. It creates the one instance with its `mixin`, its destination and, as its `hooks.streamWrite`, the mask of `libs/`, which masks each serialized line.

#### Why

Every option that makes the pipeline is an option of the instance, so code elsewhere that creates one configures logging behind the root's back, and the mask reaches the line pino writes only through that option.

#### Examples

```ts title="Avoid"
// src/libs/logging/logger.ts
import pino from 'pino';

export const logger = pino({ level: 'info' });
```

```ts title="Prefer"
// src/root/logger.ts
import pino from 'pino';
import { maskLine } from '../libs/masking';
import { traceMixin } from '../libs/tracing';

export const createLogger = (config: LoggingConfig): Logger =>
  pino({ level: config.level, mixin: traceMixin, hooks: { streamWrite: maskLine } });
```

### logging-facade-implemented-over-the-pino-instance → composition-root-decides-nothing · MUST

The root implements the logging facade over the pino instance or its child, handing each call on as it is.

#### Why

A facade that reshapes a call before pino sees it decides how records look in the root, where no case proves it, and hides from the mask and the `mixin` what it changed — the dependency inversion principle.

#### Examples

```ts title="Avoid"
// src/root/logging.ts
export const createLog = (logger: pino.Logger): Log => ({
  info: (message, fields) =>
    logger.info({ ...fields, at: new Date().toISOString() }, message.toUpperCase()),
  error: (message, fields) => logger.error(fields, message),
});
```

```ts title="Prefer"
// src/root/logging.ts
export const createLog = (logger: pino.Logger): Log => ({
  info: (message, fields) => logger.info(fields, message),
  error: (message, fields) => logger.error(fields, message),
});
```

### trace-id-mixin-kept-beside-the-middleware → trace-middleware-kept-in-libs · SHOULD

Every `mixin` that reads the trace id lives in the module of `libs/` that holds the trace middleware. `root/` hands it to the pino instance it creates.

#### Why

The instance's `mixin` reads the id the middleware enters, so with the two ends in different modules a change to how one keeps the id leaves the other reading nothing, and the records lose the id unseen.

#### Examples

```text title="Avoid"
src/
├── libs/tracing/
│   ├── trace-middleware.ts
│   └── index.ts
└── root/
    ├── trace-mixin.ts
    └── logger.ts
```

```text title="Prefer"
src/
├── libs/tracing/
│   ├── trace-middleware.ts
│   ├── trace-mixin.ts
│   └── index.ts
└── root/
    └── logger.ts
```
