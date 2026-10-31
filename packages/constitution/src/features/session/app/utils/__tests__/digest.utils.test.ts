import { describe, expect, it } from 'bun:test';

import { goldenFileText, goldenOf } from '#/__tests__/golden.fixtures';
import { Axis, ConfigKey, Layer } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import {
  AbsolutePath,
  BlockId,
  BlockSource,
  PackPath,
  UnitPath,
  Version,
} from '#/kernel/value-objects';

import type { DigestContents, DigestListing, DigestUnit } from '../../../domain/entities';
import { DigestKind } from '../../../domain/entities';
import { digestOf } from '../digest.utils';

const release = {
  folderPath: AbsolutePath.create('/work/project/.droneey/constitution'),
  version: Version.create('1.0.0'),
};
const CORE = '---\nid: core\n---\n\n# Core\n\nThe rules a repository is built by.\n';
const fromRelease = BlockSource.create(undefined);
const fromPack = BlockSource.create(PackPath.create('./rules'));

const listing: DigestListing = {
  repository: [
    {
      id: BlockId.create('ui'),
      layer: Layer.Domain,
      source: fromRelease,
    },
    {
      id: BlockId.create('browser'),
      layer: Layer.Platform,
      source: fromRelease,
    },
    {
      id: BlockId.create('typescript'),
      layer: Layer.Language,
      source: fromRelease,
    },
    {
      id: BlockId.create('react'),
      layer: Layer.Implementation,
      source: fromRelease,
    },
    {
      id: BlockId.create('lint'),
      layer: Layer.Implementation,
      source: fromPack,
    },
  ],
  units: [
    {
      leftOutAxes: [
        Axis.Workflow,
      ],
      leftOutBlocks: [
        BlockId.create('browser'),
      ],
      own: [
        {
          id: BlockId.create('api'),
          source: fromRelease,
        },
        {
          id: BlockId.create('style'),
          source: fromPack,
        },
      ],
      unit: UnitPath.create('apps/web'),
    },
  ],
};

const memberOf = (index: number): DigestUnit => ({
  leftOutAxes: [
    Axis.Workflow,
  ],
  leftOutBlocks: [
    BlockId.create('ui'),
  ],
  own: [
    {
      id: BlockId.create('api'),
      source: fromRelease,
    },
  ],
  unit: UnitPath.create(`apps/member-${String(index).padStart(3, '0')}`),
});

const warnings: readonly ProjectWarning[] = [
  {
    details: {
      file: 'constitution.yaml',
      key: ConfigKey.Packs,
    },
    kind: WarningKind.KeyMissing,
  },
  {
    details: {},
    kind: WarningKind.NoRepository,
  },
];

const variants: Readonly<Record<string, DigestContents>> = {
  'resolved at the start of a session': {
    core: CORE,
    isStartup: true,
    kind: DigestKind.Resolved,
    listing,
    release,
    warnings,
  },
  'resolved, its map cut to the budget': {
    core: CORE,
    isStartup: false,
    kind: DigestKind.Resolved,
    listing: {
      repository: listing.repository,
      units: Array.from(
        {
          length: 160,
        },
        (_, index) => memberOf(index + 1),
      ),
    },
    release,
    warnings: [],
  },
  'resolved, its warnings cut to their share': {
    core: CORE,
    isStartup: false,
    kind: DigestKind.Resolved,
    listing,
    release,
    warnings: Array.from(
      {
        length: 40,
      },
      (): ProjectWarning => ({
        details: {},
        kind: WarningKind.NoRepository,
      }),
    ),
  },
  'constitution.yaml does not parse': {
    core: CORE,
    kind: DigestKind.Unparsed,
    lines: [
      3,
    ],
    release,
  },
  'no release is installed': {
    kind: DigestKind.NoRelease,
    releaseFolderPath: release.folderPath,
  },
};

describe('digestOf', () => {
  it('should word and lay out the digest of each kind as the golden file shows it', async () => {
    // Act
    const golden = goldenOf(
      Object.fromEntries(
        Object.entries(variants).map(([name, contents]) => {
          const digest = digestOf(contents);

          return [
            name,
            [
              ...digest.head,
              '',
              ...digest.body,
            ].join('\n'),
          ];
        }),
      ),
    );

    // Assert
    expect(golden).toBe(
      await goldenFileText(new URL('digest.golden.txt', import.meta.url), golden),
    );
  });
});
