import { describe, expect, it } from 'bun:test';

import { ConfigKey, Layer, Level } from '#/kernel/constants';
import type { ProjectWarning } from '#/kernel/entities';
import { WarningKind } from '#/kernel/entities';
import {
  AbsolutePath,
  BlockId,
  BlockSource,
  RuleSlug,
  repositoryUnit,
  Version,
} from '#/kernel/value-objects';
import { warningTextOf } from '#/shared/cli';

import { DigestKind } from '../../../domain/session-digest/entities';
import { blockListLines } from '../block-list.utils';
import { digestOf } from '../digest.utils';
import { overrideListLines } from '../override-list.utils';

const RELEASE_FOLDER_PATH = '/work/project/.droneey/constitution';
const releaseFiles = {
  folderPath: AbsolutePath.create(RELEASE_FOLDER_PATH),
  version: Version.create('1.0.0'),
};
const RELEASE_LINE =
  "The Droneey Constitution 1.0.0 supplies this repository's rules. Block files live under /work/project/.droneey/constitution.";
const emptyListing = {
  overrides: [],
  repository: [],
  units: [],
};

describe('digestOf', () => {
  it.each([
    {
      condition: 'one block is active',
      count: 1,
      counted: 'constitution.yaml makes 1 block active.',
    },
    {
      condition: 'several blocks are active',
      count: 2,
      counted: 'constitution.yaml makes 2 blocks active.',
    },
  ])(
    'should give the release and the count, then the warnings, core, the overrides and the block list, when $condition',
    ({ count, counted }) => {
      // Arrange
      const warning: ProjectWarning = {
        details: {
          file: 'constitution.yaml',
          key: ConfigKey.Packs,
        },
        kind: WarningKind.KeyMissing,
      };
      const contents = {
        core: '# Core\n',
        count,
        isStartup: false,
        kind: DigestKind.Resolved,
        listing: {
          ...emptyListing,
          overrides: [
            {
              level: Level.May,
              rule: RuleSlug.create('inputs-are-labelled'),
              unit: repositoryUnit,
            },
          ],
          repository: [
            {
              files: [],
              id: BlockId.create('ui'),
              layer: Layer.Domain,
              source: BlockSource.create(),
              summary: 'The screens.',
            },
          ],
        },
        release: releaseFiles,
        warnings: [
          warning,
        ],
      } as const;

      // Act
      const digest = digestOf(contents);

      // Assert
      expect(digest).toStrictEqual({
        body: [
          '⚠️ Warnings',
          `- config: ${warningTextOf(warning)}`,
          '',
          '# Core',
          '',
          ...overrideListLines(contents.listing.overrides),
          '',
          ...blockListLines(contents.listing),
        ],
        head: [
          RELEASE_LINE,
          counted,
        ],
      });
    },
  );

  it('should give core alone and the line constitution.yaml stops at when it does not parse', () => {
    // Arrange
    const contents = {
      core: '---\nid: core\n---\n\n# Core\n',
      kind: DigestKind.Unparsed,
      lines: [
        4,
      ],
      release: releaseFiles,
    } as const;

    // Act
    const digest = digestOf(contents);

    // Assert
    expect(digest).toStrictEqual({
      body: [
        '# Core',
      ],
      head: [
        RELEASE_LINE,
        'constitution.yaml does not parse at line 4; only core applies.',
      ],
    });
  });

  it('should give one line that names the release folder and points to doctor when the release cannot give the rules', () => {
    // Arrange
    const contents = {
      kind: DigestKind.NoRelease,
      releaseFolderPath: AbsolutePath.create(RELEASE_FOLDER_PATH),
    } as const;

    // Act
    const digest = digestOf(contents);

    // Assert
    expect({
      body: digest.body,
      lines: digest.head.length,
      names: [
        RELEASE_FOLDER_PATH,
        'constitution doctor',
      ].map((name) => digest.head[0]?.includes(name)),
    }).toStrictEqual({
      body: [],
      lines: 1,
      names: [
        true,
        true,
      ],
    });
  });
});
