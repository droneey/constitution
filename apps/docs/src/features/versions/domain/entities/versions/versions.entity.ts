import type { Version } from '../../value-objects';

interface Versions {
  readonly latest: Version;
  readonly versions: readonly Version[];
}

interface PageAddressInput {
  readonly pageHref: string;
  readonly version: Version;
}

const pageAddressIn = (input: PageAddressInput): string => `/v${input.version}${input.pageHref}`;

const Versions = {
  pageAddressIn,
} as const;

export { Versions };
