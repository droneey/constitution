import type { BindingsRead } from '../entities';

interface BindingsParser {
  parse: (yaml: string) => BindingsRead;
}

export type { BindingsParser };
