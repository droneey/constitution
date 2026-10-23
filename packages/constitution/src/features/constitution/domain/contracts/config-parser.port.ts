import type { ConfigRead } from '../entities';

interface ConfigParser {
  parse: (text: string) => ConfigRead;
}

export type { ConfigParser };
