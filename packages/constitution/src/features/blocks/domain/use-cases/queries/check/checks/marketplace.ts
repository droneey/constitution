import { PATH_SEPARATOR } from '#/kernel/constants';
import type { FindingOf } from '#/kernel/types';

import type { ManifestRead, MarketplacePlugin, PluginManifest } from '../../../../entities';
import { DocumentPath, ReadStatus } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import type { ManifestReadDetails } from '../utils';
import { unreadFindings } from '../utils';

enum MarketplaceCode {
  Missing = 'marketplace-missing',
  OmitsPlugin = 'marketplace-omits-plugin',
}

interface MarketplaceDetails {
  readonly [MarketplaceCode.Missing]: object;
  readonly [MarketplaceCode.OmitsPlugin]: {
    readonly plugin?: string;
    readonly repo?: string;
  };
}

type MarketplaceFinding = FindingOf<ManifestReadDetails & MarketplaceDetails>;

const GITHUB_URL = 'https://github.com/';
const RELEASE_TAG = /^v\d+\.\d+\.\d+$/;

const servedOf = (
  read: ManifestRead<PluginManifest> | undefined,
): Partial<Pick<PluginManifest, 'name' | 'repository'>> =>
  read === undefined || read.status !== ReadStatus.Parsed ? {} : read.value;

const isServing = (input: {
  name: string | undefined;
  plugin: MarketplacePlugin;
  repo: string | undefined;
  repositoryPaths: ReadonlySet<string>;
}): boolean => {
  const { plugin } = input;

  return (
    plugin.name === input.name &&
    input.repo !== undefined &&
    plugin.repo === input.repo &&
    // Stryker disable next-line StringLiteral: no text in place of a missing ref is a release tag
    RELEASE_TAG.test(plugin.ref ?? '') &&
    input.repositoryPaths.has(
      plugin.path === ''
        ? DocumentPath.Plugin
        : `${plugin.path}${PATH_SEPARATOR}${DocumentPath.Plugin}`,
    )
  );
};

const marketplaceCheck: Check<MarketplaceFinding> = ({
  constitution,
}: CheckInput): readonly MarketplaceFinding[] => {
  const read = constitution.documents.marketplace;

  if (read === undefined) {
    return [
      {
        code: MarketplaceCode.Missing,
        details: {},
        path: DocumentPath.Marketplace,
      },
    ];
  }

  if (read.status !== ReadStatus.Parsed) {
    return unreadFindings({
      path: DocumentPath.Marketplace,
      read,
    });
  }

  const served = servedOf(constitution.documents.plugin);
  const repo = served.repository?.startsWith(GITHUB_URL)
    ? served.repository.slice(GITHUB_URL.length)
    : undefined;

  return read.value.plugins.some((plugin) =>
    isServing({
      name: served.name,
      plugin,
      repo,
      repositoryPaths: constitution.repositoryPaths,
    }),
  )
    ? []
    : [
        {
          code: MarketplaceCode.OmitsPlugin,
          details: {
            ...(served.name === undefined
              ? {}
              : {
                  plugin: served.name,
                }),
            ...(repo === undefined
              ? {}
              : {
                  repo,
                }),
          },
          path: DocumentPath.Marketplace,
        },
      ];
};

export type { MarketplaceDetails };
export { MarketplaceCode, marketplaceCheck };
