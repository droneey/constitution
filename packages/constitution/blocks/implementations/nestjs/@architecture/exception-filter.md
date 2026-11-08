# Exception filter

> Governs the one filter that maps the errors of the program's error library to answers.

## General

### every-failure-mapped-by-one-exception-filter → one-error-handler-registered-by-the-root · MUST

One exception filter maps every failure. It is a filter whose `@Catch()` names no class, an interface-wide unit that the root's module registers globally as `APP_FILTER`.

#### Why

A filter that names no class receives every exception, the `NotFoundException` of an unknown route and the `BadRequestException` of a malformed body included, and one kept among the root's files maps failures where no case proves it.

#### Examples

```ts title="Avoid"
// src/presentation/bindings/errors.filter.ts
@Catch(AppError)
export class ErrorsFilter implements ExceptionFilter {
  catch(error: AppError, host: ArgumentsHost): void {
    host.switchToHttp().getResponse<FastifyReply>().status(422).send({ code: error.code });
  }
}
```

```ts title="Prefer"
// src/presentation/bindings/errors.filter.ts
@Catch()
export class ErrorsFilter implements ExceptionFilter {
  catch(error: unknown, host: ArgumentsHost): void {
    const answer = toErrorAnswer(error);

    host.switchToHttp().getResponse<FastifyReply>().status(answer.status).send(answer.body);
  }
}

// src/root/root.module.ts
@Module({ providers: [{ provide: APP_FILTER, useClass: ErrorsFilter }] })
export class RootModule {}
```

### use-filters-never-written → operation-never-answers-its-own-failure · MUST

No controller or method binds a filter of its own with `@UseFilters`.

#### Why

A filter bound to one controller answers its failures in a second shape, apart from the one filter every other failure reaches.

#### Examples

```ts title="Avoid"
@Controller('orders')
@UseFilters(OrderErrorsFilter)
export class OrdersController {
  constructor(@Inject(PLACE_ORDER) private readonly placeOrder: PlaceOrder) {}
}
```

```ts title="Prefer"
@Controller('orders')
export class OrdersController {
  constructor(@Inject(PLACE_ORDER) private readonly placeOrder: PlaceOrder) {}
}
```
