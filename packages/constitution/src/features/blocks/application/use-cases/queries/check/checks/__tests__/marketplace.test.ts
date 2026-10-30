import { describe, expect, it } from 'bun:test';

import type { FindingOf } from '#/kernel/types';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { without } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../__tests__/check.fixtures';
import type { ManifestReadDetails } from '../../utils';
import { ManifestReadCode } from '../../utils';
import type { MarketplaceDetails } from '../marketplace';
import { MarketplaceCode, marketplaceCheck } from '../marketplace';

type MarketplaceFinding = FindingOf<ManifestReadDetails & MarketplaceDetails>;

const PLUGIN = '.claude-plugin/plugin.json';
const MARKETPLACE = '.claude-plugin/marketplace.json';
const LISTING_SKILLS =
  '{"name":"constitution","repository":"https://github.com/droneey/constitution","skills":["./skills/"]}';

const unserved = (
  overrides: Partial<MarketplaceDetails[MarketplaceCode.OmitsPlugin]> = {},
): MarketplaceFinding => ({
  code: MarketplaceCode.OmitsPlugin,
  details: {
    plugin: 'constitution',
    ...overrides,
  },
  path: MARKETPLACE,
});

const listed = (source: unknown): string =>
  JSON.stringify({
    name: 'droneey',
    plugins: [
      {
        name: 'constitution',
        source,
      },
    ],
  });

const github = {
  repo: 'droneey/constitution',
  source: 'github',
};

interface ManifestCase {
  expected: MarketplaceFinding[];
  files: Files;
  name: string;
}

const withFiles = (extra: Readonly<Files>): Files => ({
  ...validFiles(),
  ...extra,
});

describe('marketplaceCheck', () => {
  it.each<ManifestCase>([
    {
      expected: [],
      files: without({
        files: validFiles(),
        path: PLUGIN,
      }),
      name: 'missing',
    },
    {
      expected: [],
      files: withFiles({
        [PLUGIN]: '{',
      }),
      name: 'not JSON',
    },
  ])(
    'should report the marketplace entry, naming no plugin, when the plugin manifest is $name',
    ({ files }) => {
      // Arrange
      const input = checkInputOf(files);

      // Act
      const findings = marketplaceCheck(input);

      // Assert
      expect(findings).toStrictEqual([
        {
          code: MarketplaceCode.OmitsPlugin,
          details: {},
          path: MARKETPLACE,
        },
      ]);
    },
  );

  it.each([
    {
      expected: [],
      name: 'the folder that holds the plugin manifest',
      source: {
        path: 'packages/constitution',
        url: 'droneey/constitution',
      },
    },
    {
      expected: [],
      name: 'the folder that holds the plugin manifest, by the URL of the repository',
      source: {
        path: 'packages/constitution',
        url: 'https://github.com/droneey/constitution.git',
      },
    },
    {
      expected: [
        unserved({
          repo: 'droneey/constitution',
        }),
      ],
      name: 'a folder that holds no plugin manifest',
      source: {
        path: 'packages/tools',
        url: 'droneey/constitution',
      },
    },
    {
      expected: [
        unserved({
          repo: 'droneey/constitution',
        }),
      ],
      name: 'the root of a repository that holds the manifest in a folder',
      source: {
        url: 'droneey/constitution',
      },
    },
    {
      expected: [
        unserved({
          repo: 'droneey/constitution',
        }),
      ],
      name: 'a folder of no named repository',
      source: {
        path: 'packages/constitution',
      },
    },
  ])(
    'should check a marketplace in the repository when it serves the plugin from $name',
    ({ expected, source }) => {
      // Arrange
      const input = checkInputOf(
        without({
          files: validFiles(),
          path: MARKETPLACE,
        }),
        {
          [MARKETPLACE]: listed({
            ...source,
            ref: 'v1.0.0',
            source: 'git-subdir',
          }),
          [`packages/constitution/${PLUGIN}`]: LISTING_SKILLS,
        },
      );

      // Act
      const findings = marketplaceCheck(input);

      // Assert
      expect(findings).toStrictEqual(expected);
    },
  );

  it('should report the marketplace when it serves the plugin from a source of neither GitHub nor a folder of it', () => {
    // Arrange
    const files = withFiles({
      [MARKETPLACE]: listed({
        ref: 'v1.0.0',
        source: 'url',
        url: 'https://github.com/droneey/constitution.git',
      }),
    });
    const input = checkInputOf(files);

    // Act
    const findings = marketplaceCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      unserved({
        repo: 'droneey/constitution',
      }),
    ]);
  });

  it.each<ManifestCase>([
    {
      expected: [
        {
          code: MarketplaceCode.Missing,
          details: {},
          path: MARKETPLACE,
        },
      ],
      files: without({
        files: validFiles(),
        path: MARKETPLACE,
      }),
      name: 'missing',
    },
    {
      expected: [
        unserved({
          repo: 'droneey/constitution',
        }),
      ],
      files: withFiles({
        [MARKETPLACE]: listed('./'),
      }),
      name: 'serving the plugin from its own folder',
    },
    {
      expected: [
        unserved({
          repo: 'droneey/constitution',
        }),
      ],
      files: withFiles({
        [MARKETPLACE]: listed({
          ...github,
          repo: 'someone/constitution',
          ref: 'v1.0.0',
        }),
      }),
      name: 'serving the plugin from another repository',
    },
    ...[
      'v1.0.0-rc.1',
      'release-v1.0.0',
      undefined,
    ].map((ref) => ({
      expected: [
        unserved({
          repo: 'droneey/constitution',
        }),
      ],
      files: withFiles({
        [MARKETPLACE]: listed({
          ...github,
          ref,
        }),
      }),
      name: `serving the plugin at ${ref ?? 'no ref'}`,
    })),
    {
      expected: [
        unserved(),
      ],
      files: withFiles({
        '.claude-plugin/plugin.json': '{"name":"constitution"}',
        [MARKETPLACE]: listed({
          ref: 'v1.0.0',
          source: 'github',
        }),
      }),
      name: 'listed while the plugin manifest names no repository',
    },
    {
      expected: [
        unserved(),
      ],
      files: withFiles({
        '.claude-plugin/plugin.json':
          '{"name":"constitution","repository":"https://gitlab.com/droneey/constitution"}',
        [MARKETPLACE]: listed({
          ...github,
          ref: 'v1.0.0',
        }),
      }),
      name: 'listed while the plugin manifest names a repository off GitHub',
    },
    {
      expected: [
        unserved({
          repo: 'droneey/constitution',
        }),
      ],
      files: withFiles({
        [MARKETPLACE]:
          '{"name":"droneey","plugins":[{"name":"devkit","source":{"source":"github","repo":"droneey/constitution","ref":"v1.0.0"}}]}',
      }),
      name: 'serving another plugin from the repository and release tag',
    },
    {
      expected: [
        {
          code: ManifestReadCode.OffSchema,
          details: {
            field: 'plugins',
            reason: expect.any(String),
          },
          path: MARKETPLACE,
        },
      ],
      files: withFiles({
        [MARKETPLACE]: '{"name":"droneey","plugins":[]}',
      }),
      name: 'listing no plugin',
    },
    {
      expected: [],
      files: withFiles({
        [MARKETPLACE]:
          '{"name":"droneey","plugins":[{"name":"devkit","source":"./devkit/"},{"name":"constitution","source":{"source":"github","repo":"droneey/constitution","ref":"v10.10.10"}}]}',
      }),
      name: 'listing another plugin beside it',
    },
  ])('should check the marketplace when it is $name', ({ expected, files }) => {
    // Arrange
    const input = checkInputOf(files);

    // Act
    const findings = marketplaceCheck(input);

    // Assert
    expect(findings).toStrictEqual(expected);
  });
});
