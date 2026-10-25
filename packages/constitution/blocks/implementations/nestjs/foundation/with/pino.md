# pino

> Governs a NestJS program whose records pass the one pino instance.

## General

### nest-logs-through-the-pino-instance → one-instance-writes-every-record · MUST

The `LoggerModule.forRoot({ pinoHttp: { logger } })` takes the instance, the application is created with `bufferLogs: true`, and `app.useLogger(app.get(Logger))` makes the logger of **`nestjs-pino`** Nest's own.

| Why |
|---|
| Nest otherwise writes its own records — its start, its routes, an unhandled error — through its console logger, past the pipeline, and `bufferLogs` holds the records of the start until the logger is set. |
