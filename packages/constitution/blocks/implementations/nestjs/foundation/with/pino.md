# pino

> Governs a NestJS program whose records pass the one pino instance.

## General

### nest-logs-through-the-pino-instance → one-instance-writes-every-record · MUST

Nest logs through the program's pino instance. `LoggerModule.forRoot({ pinoHttp: { logger } })` takes the instance, `NestFactory.create` is given `bufferLogs: true`, and `app.useLogger(app.get(Logger))` makes the logger of **`nestjs-pino`** Nest's own.

| Why |
|---|
| Nest otherwise writes its own records (its start, its routes, an unhandled error) through its console logger, past the pipeline, and `bufferLogs` holds the records of the start until the logger is set. |
