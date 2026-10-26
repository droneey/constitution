interface Source {
  readonly $ref: string;
}

/** the parts of a resolver of the Design Tokens Resolver module a build reads */
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
