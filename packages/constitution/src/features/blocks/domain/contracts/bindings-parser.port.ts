import type { BindingsRead } from '../entities';

interface BindingsParser {
  readonly parse: (yaml: string) => BindingsRead;
}

export type { BindingsParser };
