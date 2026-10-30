interface Source {
  readonly $ref: string;
}

interface Resolver {
  readonly modifiers: {
    readonly theme: {
      readonly contexts: Readonly<Record<string, readonly Source[]>>;
      readonly default: string;
    };
  };
  readonly sets: Readonly<
    Record<
      string,
      {
        readonly sources: readonly Source[];
      }
    >
  >;
}

export type { Resolver, Source };
