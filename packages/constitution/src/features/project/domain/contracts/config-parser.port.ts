import type { ConfigRead } from '../entities';

interface ConfigParser {
  readonly parse: (text: string) => ConfigRead;
}

export type { ConfigParser };
