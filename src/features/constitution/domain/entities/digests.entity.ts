import type { Finding } from '#/kernel';

interface Digests {
  core: string;
  findings: readonly Finding[];
  index: string;
}

export type { Digests };
