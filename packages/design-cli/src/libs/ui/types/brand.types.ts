declare const brand: unique symbol;

type Brand<TBase, TName extends string> = TBase & {
  readonly [brand]: TName;
};

export type { Brand };
