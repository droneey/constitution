import type { Version } from '../value-objects';

interface Versions {
  readonly latest: Version;
  readonly versions: readonly Version[];
}

interface PageAddressInput {
  /** the page's address as the router reads it, without the base of the site it is served from */
  readonly path: string;
  readonly version: Version;
}

/** every release's site is served under `/v<version>/`, the latest's included */
const pageAddressIn = (input: PageAddressInput): string => `/v${input.version}${input.path}`;

const Versions = {
  pageAddressIn,
} as const;

export { Versions };
