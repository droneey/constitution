import type { Version } from '../value-objects';

interface Versions {
  readonly latest: Version;
  readonly versions: readonly Version[];
}

const RELEASE_SITE_PREFIX = /^\/v\d+\.\d+\.\d+(?=\/|$)/;

const releaseSiteOf = (version: Version, latest: Version): string =>
  version === latest ? '' : `/v${version}`;

const pageAddressIn = (input: { latest: Version; path: string; version: Version }): string =>
  `${releaseSiteOf(input.version, input.latest)}${input.path.replace(RELEASE_SITE_PREFIX, '') || '/'}`;

export type { Versions };
export { pageAddressIn };
