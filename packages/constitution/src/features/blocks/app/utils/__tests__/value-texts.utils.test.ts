import { describe, expect, it } from 'bun:test';

import type { ValueFindingDetails } from '#/kernel/entities';
import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import type { ProblemOf } from '#/kernel/types';
import { textOf } from '#/shared/cli';

import { valueTexts } from '../value-texts.utils';

describe('valueTexts', () => {
  it.each<{
    problem: ProblemOf<ValueFindingDetails>;
    text: string;
  }>([
    {
      problem: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.FrontMatterId,
          written: 'Ui',
        },
      },
      text: 'front matter: id "Ui" is not a kebab-case block id',
    },
    {
      problem: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.BlockFolder,
          written: 'Ui',
        },
      },
      text: 'is a block folder named "Ui", which is not a kebab-case block id',
    },
    {
      problem: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.SeamFile,
        },
      },
      text: "is a seam whose name is not a kebab-case block id; a seam is with/<block>.md, named after the other block's id",
    },
    {
      problem: {
        code: ValueFailure.Glob,
        details: {
          site: ValueSite.Governs,
          written: 'src/**/*.ts lib',
        },
      },
      text: 'front matter: governs lists "src/**/*.ts lib", which holds whitespace; the index separates globs with spaces',
    },
    {
      problem: {
        code: ValueFailure.PartAddress,
        details: {
          site: ValueSite.BoundPart,
          written: 'a/b',
        },
      },
      text: 'binds the part "a/b", which is not a file name: it is empty or holds a "/"',
    },
    {
      problem: {
        code: ValueFailure.RuleSlug,
        details: {
          site: ValueSite.BoundRule,
          written: 'Not_A_Slug',
        },
      },
      text: 'binds "Not_A_Slug", which is not a kebab-case slug',
    },
    {
      problem: {
        code: ValueFailure.RuleSlug,
        details: {
          site: ValueSite.RuleHeading,
          written: 'Not_A_Slug',
        },
      },
      text: 'rule "Not_A_Slug" is not a kebab-case slug',
    },
    {
      problem: {
        code: ValueFailure.RuleSlug,
        details: {
          rule: 'loading-state-shown',
          site: ValueSite.TightenedRule,
          written: 'Not_A_Slug',
        },
      },
      text: 'rule "loading-state-shown" tightens "Not_A_Slug", which is not a kebab-case slug',
    },
  ])(
    'should say $problem.code at $problem.details.site as the report words it',
    ({ problem, text }) => {
      // Act
      const said = textOf(valueTexts, problem.code, problem.details);

      // Assert
      expect(said).toBe(text);
    },
  );
});
