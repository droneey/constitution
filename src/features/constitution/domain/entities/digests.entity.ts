import type { Finding } from '#/kernel/types';

interface Digests {
  readonly core: string;
  readonly findings: readonly Finding[];
  readonly index: string;
}

export type { Digests };
