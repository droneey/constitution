import { describe, expect, it } from 'bun:test';

import type { ProblemOf } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import type {
  LinksDetails,
  ReferencesDetails,
} from '../../../domain/validate-constitution/services';
import { LinksCode, ReferencesCode } from '../../../domain/validate-constitution/services';
import { referencesTexts } from '../references-texts.utils';

describe('referencesTexts', () => {
  it.each<{
    problem: ProblemOf<LinksDetails & ReferencesDetails>;
    text: string;
  }>([
    {
      problem: {
        code: ReferencesCode.LinkIntoOtherBlock,
        details: {
          owner: BlockId.create('i18n'),
          target: '../../i18n/',
        },
      },
      text: 'links to ../../i18n/, a file of the block i18n, which its place does not reach; a block refers only to core, itself and the blocks it requires or sits under',
    },
    {
      problem: {
        code: ReferencesCode.NamesOtherRule,
        details: {
          owner: BlockId.create('react-dom'),
          slug: RuleSlug.create('portals'),
        },
      },
      text: 'names the rule portals of react-dom, which its place does not reach; a block refers only to core, itself and the blocks it requires or sits under',
    },
    {
      problem: {
        code: ReferencesCode.CitesDecision,
        details: {
          decision: 'ADR-0012',
        },
      },
      text: 'cites ADR-0012; a rule is read alone, without the decision log',
    },
    {
      problem: {
        code: LinksCode.MissingTarget,
        details: {
          target: 'local/plan.md',
        },
      },
      text: 'links to a missing file "local/plan.md"',
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(referencesTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
