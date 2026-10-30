import type { ConfigRead } from '../../domain/entities';

interface ConfigParser {
  readonly parse: (text: string) => ConfigRead;
}

export type { ConfigParser };
