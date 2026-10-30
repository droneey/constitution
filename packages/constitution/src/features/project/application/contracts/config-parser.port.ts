import type { ConfigRead } from '../../domain/project-config/entities';

interface ConfigParser {
  readonly parse: (text: string) => ConfigRead;
}

export type { ConfigParser };
