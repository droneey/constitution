# Decorators

> Governs decorators.

## General

### decorator-is-a-standard-decorator · MUST

Every decorator takes the form of the TC39 decorators proposal, never the legacy form of its earlier draft. Exempt: the legacy form where a framework's block requires it.

#### Why

The legacy form receives other arguments and runs at another time than the standard one, so a decorator written for one misbehaves under the other, and the legacy form follows an earlier draft the committee replaced — the TC39 decorators proposal.

#### Examples

```ts title="Avoid"
export const logged = (
  target: object,
  key: string,
  descriptor: TypedPropertyDescriptor<(...args: never[]) => unknown>,
): void => {
  const method = descriptor.value;
  descriptor.value = function (this: unknown, ...args: never[]): unknown {
    logger.debug({ method: key }, 'called');
    return method?.apply(this, args);
  };
};
```

```ts title="Prefer"
export const logged = <TThis, TArgs extends unknown[], TReturn>(
  method: (this: TThis, ...args: TArgs) => TReturn,
  context: ClassMethodDecoratorContext<TThis, (this: TThis, ...args: TArgs) => TReturn>,
) =>
  function (this: TThis, ...args: TArgs): TReturn {
    logger.debug({ method: String(context.name) }, 'called');
    return method.apply(this, args);
  };
```
