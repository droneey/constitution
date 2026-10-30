import { describe, expect, it } from 'bun:test';

import { Axis, RELEASE_FOLDER_PATH } from '#/kernel/constants';
import { BlockId, BlockSource, RepositoryRelativePath } from '#/kernel/value-objects';

import { unitOf } from '../../../../__tests__/presets.fixtures';
import { EVERY } from '../../../constants';
import type { TargetFile } from '../../../value-objects';
import { Fact, FactName, TargetKind } from '../../../value-objects';
import type { PresetEntry } from '../../preset-entry/preset-entry.entity';
import { PresetValue } from '../../preset-value/preset-value.entity';
import type { FileCandidate } from '../candidate.entity';
import { Candidate } from '../candidate.entity';

const constitutionPath = Fact.textOf(Fact.of(FactName.ConstitutionPath));

const entryOf = (text: string): PresetEntry & TargetFile => ({
  kind: TargetKind.File,
  writtenPath: 'biome.json',
  block: BlockId.create('biome'),
  index: 0,
  language: EVERY,
  rule: EVERY,
  set: {
    filePath: RepositoryRelativePath.create('presets/biome/foundation.yaml'),
    placeInPresets: {
      axis: Axis.Foundation,
      reader: BlockId.create('biome'),
      withs: [],
    },
    source: BlockSource.create(),
  },
  value: PresetValue.plain(text),
});

const fileCandidateOf = (input: {
  dropped?: readonly string[];
  texts: readonly string[];
}): FileCandidate => ({
  droppedByOverrideOrAxis: (input.dropped ?? []).map(entryOf),
  entries: input.texts.map(entryOf),
  filePath: RepositoryRelativePath.create('packages/kit/biome.json'),
  kind: TargetKind.File,
  unit: unitOf({
    path: 'packages/kit',
  }),
});

describe('Candidate.namesConstitutionPath', () => {
  it.each([
    {
      condition: 'an entry it writes names it',
      expected: true,
      given: {
        texts: [
          `${constitutionPath}/presets`,
        ],
      },
    },
    {
      condition: 'only an entry an override or an axis dropped names it',
      expected: true,
      given: {
        dropped: [
          constitutionPath,
        ],
        texts: [
          'plain',
        ],
      },
    },
    {
      condition: 'no entry names it',
      expected: false,
      given: {
        texts: [
          'plain',
        ],
      },
    },
  ])(
    'should tell whether the candidate needs the Constitution’s path when $condition',
    ({ expected, given }) => {
      // Act
      const names = Candidate.namesConstitutionPath(fileCandidateOf(given));

      // Assert
      expect(names).toBe(expected);
    },
  );
});

describe('Candidate.releaseProbesOf', () => {
  it('should probe the folders from the file’s own up to the repository’s', () => {
    // Act
    const probes = Candidate.releaseProbesOf(
      fileCandidateOf({
        texts: [],
      }),
    );

    // Assert
    expect(probes).toStrictEqual([
      {
        constitutionPath: RELEASE_FOLDER_PATH,
        releaseFolderPath: `packages/kit/${RELEASE_FOLDER_PATH}`,
      },
      {
        constitutionPath: `../${RELEASE_FOLDER_PATH}`,
        releaseFolderPath: `packages/${RELEASE_FOLDER_PATH}`,
      },
      {
        constitutionPath: `../../${RELEASE_FOLDER_PATH}`,
        releaseFolderPath: RELEASE_FOLDER_PATH,
      },
    ]);
  });
});

describe('Candidate.pathOf', () => {
  it('should give a run’s candidate the path of its unit’s declaration', () => {
    // Act
    const path = Candidate.pathOf({
      droppedByOverrideOrAxis: [],
      entries: [],
      kind: TargetKind.Run,
      unit: unitOf({
        path: 'packages/kit',
      }),
    });

    // Assert
    expect(path).toBe(RepositoryRelativePath.create('packages/kit/constitution.yaml'));
  });
});
