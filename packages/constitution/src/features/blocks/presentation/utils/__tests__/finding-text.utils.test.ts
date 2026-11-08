import { describe, expect, it } from 'bun:test';

import { RuleFormCode, ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import { BlockId, RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import { LoadCode } from '../../../domain/constitution/entities';
import type { BlockFinding } from '../../../domain/validate-constitution/services';
import {
  BudgetCode,
  CyclesCode,
  DecisionsCode,
  LinksCode,
  NamesCode,
  PluginCode,
  RequiresCode,
  RulesCode,
  TermsCode,
  WordingCode,
} from '../../../domain/validate-constitution/services';
import { budgetTexts } from '../budget-texts.utils';
import { decisionsTexts } from '../decisions-texts.utils';
import { findingTextOf } from '../finding-text.utils';
import { loadTexts } from '../load-texts.utils';
import { namesTexts } from '../names-texts.utils';
import { pluginTexts } from '../plugin-texts.utils';
import { referencesTexts } from '../references-texts.utils';
import { requiresTexts } from '../requires-texts.utils';
import { ruleFormTexts } from '../rule-form-texts.utils';
import { ruleWordingTexts } from '../rule-wording-texts.utils';
import { rulesTexts } from '../rules-texts.utils';
import { structureTexts } from '../structure-texts.utils';
import { termsTexts } from '../terms-texts.utils';
import { valueTexts } from '../value-texts.utils';

const PATH = 'blocks/domains/ui/ui.md';
const slug = RuleSlug.create('loading-state-shown');

const overBudget = {
  code: BudgetCode.FileOverBudget,
  details: {
    budget: 1500,
    lines: 1501,
  },
  path: PATH,
} satisfies BlockFinding;
const logMissing = {
  code: DecisionsCode.LogMissing,
  details: {},
  path: PATH,
} satisfies BlockFinding;
const baseUnloaded = {
  code: LoadCode.BaseDoesNotLoad,
  details: {},
  path: PATH,
} satisfies BlockFinding;
const manifestMissing = {
  code: PluginCode.ManifestMissing,
  details: {},
  path: PATH,
} satisfies BlockFinding;
const missingTarget = {
  code: LinksCode.MissingTarget,
  details: {
    target: 'local/plan.md',
  },
  path: PATH,
} satisfies BlockFinding;
const requiresItself = {
  code: RequiresCode.RequiresItself,
  details: {},
  path: PATH,
} satisfies BlockFinding;
const withoutTable = {
  code: RuleFormCode.WithoutTable,
  details: {
    slug,
  },
  path: PATH,
} satisfies BlockFinding;
const withoutWhy = {
  code: RulesCode.WithoutWhy,
  details: {
    slug,
  },
  path: PATH,
} satisfies BlockFinding;
const cycle = {
  code: CyclesCode.Cycle,
  details: {
    cycle: [],
  },
  path: PATH,
} satisfies BlockFinding;
const termMisshapen = {
  code: TermsCode.Misshapen,
  details: {
    written: 'Server state',
  },
  path: PATH,
} satisfies BlockFinding;
const sloganTooLong = {
  code: WordingCode.SloganTooLong,
  details: {
    slug,
    words: 23,
  },
  path: PATH,
} satisfies BlockFinding;
const parentNamesChild = {
  code: NamesCode.ParentNamesChild,
  details: {
    child: BlockId.create('react/ink'),
    name: 'Ink',
  },
  path: PATH,
} satisfies BlockFinding;
const globWithSpace = {
  code: ValueFailure.Glob,
  details: {
    site: ValueSite.Governs,
    written: 'src/**/*.tsx ',
  },
  path: PATH,
} satisfies BlockFinding;

describe('findingTextOf', () => {
  it.each<{
    finding: BlockFinding;
    text: string;
  }>([
    {
      finding: overBudget,
      text: textOf(budgetTexts, overBudget.code, overBudget.details),
    },
    {
      finding: logMissing,
      text: textOf(decisionsTexts, logMissing.code, logMissing.details),
    },
    {
      finding: baseUnloaded,
      text: textOf(loadTexts, baseUnloaded.code, baseUnloaded.details),
    },
    {
      finding: manifestMissing,
      text: textOf(pluginTexts, manifestMissing.code, manifestMissing.details),
    },
    {
      finding: missingTarget,
      text: textOf(referencesTexts, missingTarget.code, missingTarget.details),
    },
    {
      finding: requiresItself,
      text: `[passport-requires-only-what-its-block-needs] ${textOf(requiresTexts, requiresItself.code, requiresItself.details)}`,
    },
    {
      finding: withoutTable,
      text: `[core.md: How to use it] ${textOf(ruleFormTexts, withoutTable.code, withoutTable.details)}`,
    },
    {
      finding: withoutWhy,
      text: `[core.md: How to use it] ${textOf(rulesTexts, withoutWhy.code, withoutWhy.details)}`,
    },
    {
      finding: cycle,
      text: `[passport-requires-only-what-its-block-needs] ${textOf(structureTexts, cycle.code, cycle.details)}`,
    },
    {
      finding: termMisshapen,
      text: `[rule-term-defined-in-a-vocabulary] ${textOf(termsTexts, termMisshapen.code, termMisshapen.details)}`,
    },
    {
      finding: sloganTooLong,
      text: `[rule-opens-with-its-slogan] ${textOf(ruleWordingTexts, sloganTooLong.code, sloganTooLong.details)}`,
    },
    {
      finding: parentNamesChild,
      text: `[rule-placed-in-the-rank-whose-loss-voids-it] ${textOf(namesTexts, parentNamesChild.code, parentNamesChild.details)}`,
    },
    {
      finding: globWithSpace,
      text: textOf(valueTexts, globWithSpace.code, globWithSpace.details),
    },
  ])(
    'should say a finding of $finding.code as the table of its check words it',
    ({ finding, text }) => {
      // Act
      const said = findingTextOf(finding);

      // Assert
      expect(said).toBe(text);
    },
  );
});
