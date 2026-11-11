import { describe, expect, it } from 'bun:test';

import { Axis } from '#/kernel/constants';
import type { WholeHold } from '#/kernel/entities';
import type { RuleSlug } from '#/kernel/value-objects';
import {
  BlockId,
  BlockSource,
  RepositoryRelativePath,
  RuleSlug as Slug,
  UnitPath,
} from '#/kernel/value-objects';

import { unitOf } from '../../../../../__tests__/presets.fixtures';
import type { LanguageKey, PresetEntry } from '../../../../preset-entry/entities';
import { PresetValue } from '../../../../setting/entities';
import { EVERY } from '../../../../shared/constants';
import type { TargetFile } from '../../../../shared/value-objects';
import { TargetKind } from '../../../../shared/value-objects';
import type { FileCandidate } from '../../../entities';
import { heldRulesOf } from '../held-rules.service';

interface EntryAsked {
  readonly isWhole: boolean;
  readonly language: LanguageKey;
  readonly rule: RuleSlug | typeof EVERY;
}

const entryOf = (asked: EntryAsked): PresetEntry & TargetFile => ({
  kind: TargetKind.File,
  writtenPath: 'biome.json',
  block: BlockId.create('biome'),
  index: 0,
  isWhole: asked.isWhole,
  language: asked.language,
  rule: asked.rule,
  set: {
    filePath: RepositoryRelativePath.create('presets/biome/@foundation.yaml'),
    placeInPresets: {
      axis: Axis.Foundation,
      reader: BlockId.create('biome'),
      withs: [],
    },
    source: BlockSource.create(),
  },
  value: PresetValue.plain('on'),
});

const candidateOf = (input: {
  dropped?: readonly EntryAsked[];
  entries: readonly EntryAsked[];
  path: string;
}): FileCandidate => ({
  droppedByOverrideOrAxis: (input.dropped ?? []).map(entryOf),
  entries: input.entries.map(entryOf),
  filePath: RepositoryRelativePath.create(`${input.path}/biome.json`),
  kind: TargetKind.File,
  unit: unitOf({
    path: input.path,
  }),
});

const typescript = BlockId.create('typescript');
const python = BlockId.create('python');

const WEB = 'apps/web';
const fileWithin = Slug.create('file-within-500-lines');
const oneWidth = Slug.create('formatters-share-one-width');

describe('heldRulesOf', () => {
  it.each<{
    candidates: readonly {
      dropped?: readonly EntryAsked[];
      entries: readonly EntryAsked[];
    }[];
    condition: string;
    held: ReadonlyMap<RuleSlug, WholeHold>;
  }>([
    {
      candidates: [
        {
          entries: [
            {
              isWhole: true,
              language: typescript,
              rule: fileWithin,
            },
          ],
        },
      ],
      condition: 'a whole setting names one language',
      held: new Map([
        [
          fileWithin,
          {
            isEveryLanguage: false,
            languages: new Set([
              typescript,
            ]),
          },
        ],
      ]),
    },
    {
      candidates: [
        {
          entries: [
            {
              isWhole: true,
              language: typescript,
              rule: fileWithin,
            },
          ],
        },
        {
          entries: [
            {
              isWhole: true,
              language: python,
              rule: fileWithin,
            },
          ],
        },
      ],
      condition: 'two files of the unit hold one rule whole in two languages',
      held: new Map([
        [
          fileWithin,
          {
            isEveryLanguage: false,
            languages: new Set([
              typescript,
              python,
            ]),
          },
        ],
      ]),
    },
    {
      candidates: [
        {
          entries: [
            {
              isWhole: true,
              language: EVERY,
              rule: oneWidth,
            },
            {
              isWhole: true,
              language: typescript,
              rule: oneWidth,
            },
          ],
        },
      ],
      condition: 'a whole setting is keyed by every language',
      held: new Map([
        [
          oneWidth,
          {
            isEveryLanguage: true,
            languages: new Set([
              typescript,
            ]),
          },
        ],
      ]),
    },
    {
      candidates: [
        {
          entries: [
            {
              isWhole: false,
              language: python,
              rule: Slug.create('code-reads-plainly'),
            },
          ],
        },
      ],
      condition: 'its setting is not whole',
      held: new Map(),
    },
    {
      candidates: [
        {
          entries: [
            {
              isWhole: true,
              language: EVERY,
              rule: EVERY,
            },
          ],
        },
      ],
      condition: 'its whole setting is keyed by no rule',
      held: new Map(),
    },
    {
      candidates: [
        {
          dropped: [
            {
              isWhole: true,
              language: typescript,
              rule: Slug.create('dead-code-deleted'),
            },
          ],
          entries: [],
        },
      ],
      condition: 'its whole setting was dropped by an override or an axis',
      held: new Map(),
    },
  ])(
    'should give the unit the rules its whole settings hold when $condition',
    ({ candidates, held }) => {
      // Arrange
      const unitCandidates = candidates.map((candidate) =>
        candidateOf({
          ...candidate,
          path: WEB,
        }),
      );

      // Act
      const holds = heldRulesOf(unitCandidates);

      // Assert
      expect(holds.get(UnitPath.create(WEB))).toStrictEqual(held);
    },
  );
});
