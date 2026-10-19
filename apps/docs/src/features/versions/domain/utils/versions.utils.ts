const VERSION_PREFIX = /^\/v\d+\.\d+\.\d+(?=\/|$)/;

const baseOf = (version: string, latest: string): string =>
  version === latest ? '' : `/v${version}`;

export const addressIn = (input: { latest: string; path: string; version: string }): string =>
  `${baseOf(input.version, input.latest)}${input.path.replace(VERSION_PREFIX, '') || '/'}`;
