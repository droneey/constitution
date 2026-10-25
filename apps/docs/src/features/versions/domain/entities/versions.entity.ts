import type { Version } from '../value-objects';

interface Versions {
  readonly latest: Version;
  readonly versions: readonly Version[];
}

const RELEASE_SITE_PREFIX = /^\/v\d+\.\d+\.\d+(?=\/|$)/;

const releaseSiteOf = (version: Version, latest: Version): string =>
  version === latest ? '' : `/v${version}`;

interface PageAddressInput {
  readonly latest: Version;
  readonly path: string;
  readonly version: Version;
}

const pageAddressIn = (input: PageAddressInput): string =>
  `${releaseSiteOf(input.version, input.latest)}${input.path.replace(RELEASE_SITE_PREFIX, '') || '/'}`;

const Versions = {
  pageAddressIn,
} as const;

export { Versions };
