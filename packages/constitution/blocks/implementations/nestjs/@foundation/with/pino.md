# pino

> Governs a NestJS program whose records pass the one pino instance.

## General

### nest-logs-through-the-pino-instance → one-instance-writes-every-record · MUST

Every Nest program logs through the program's pino instance. `NestFactory.create` is given `bufferLogs: true`, and `app.useLogger(app.get(Logger))` makes the logger of `nestjs-pino` Nest's own; `LoggerModule.forRoot({ pinoHttp: { logger } })` is the form `request-logger-takes-the-instance` takes in Nest.

| Why |
|---|
| Nest otherwise writes its own records (its start, its routes, an unhandled error) through its console logger, past the pipeline, and `bufferLogs` holds the records of the start until the logger is set. |
