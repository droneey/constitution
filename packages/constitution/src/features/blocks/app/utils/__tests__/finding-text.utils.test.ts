import { describe, expect, it } from 'bun:test';

import { RuleFormCode, ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';
import { RuleSlug } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import type { BlockFinding } from '../../../domain/use-cases/queries/check';
import {
  BudgetCode,
  CyclesCode,
  DecisionsCode,
  LinksCode,
  LoadCode,
  PluginCode,
  RequirementsCode,
  RequiresCode,
  RulesCode,
  TermsCode,
} from '../../../domain/use-cases/queries/check';
import { budgetTexts } from '../budget-texts.utils';
import { decisionsTexts } from '../decisions-texts.utils';
import { findingTextOf } from '../finding-text.utils';
import { loadTexts } from '../load-texts.utils';
import { presetsTexts } from '../presets-texts.utils';
import { referencesTexts } from '../references-texts.utils';
import { requirementsTexts } from '../requirements-texts.utils';
import { requiresTexts } from '../requires-texts.utils';
import { ruleFormTexts } from '../rule-form-texts.utils';
import { rulesTexts } from '../rules-texts.utils';
import { structureTexts } from '../structure-texts.utils';
import { termsTexts } from '../terms-texts.utils';
import { valueTexts } from '../value-texts.utils';

const PATH = 'blocks/domains/ui/ui.md';
const slug = RuleSlug.create('loading-state-shown');

const overBudget = {
  code: BudgetCode.FileOverBudget,
  details: {
    budget: 500,
    lines: 501,
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
const answeredOutside = {
  code: RequirementsCode.OutsideImplementation,
  details: {},
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
      text: textOf(presetsTexts, manifestMissing.code, manifestMissing.details),
    },
    {
      finding: missingTarget,
      text: textOf(referencesTexts, missingTarget.code, missingTarget.details),
    },
    {
      finding: answeredOutside,
      text: textOf(requirementsTexts, answeredOutside.code, answeredOutside.details),
    },
    {
      finding: requiresItself,
      text: textOf(requiresTexts, requiresItself.code, requiresItself.details),
    },
    {
      finding: withoutTable,
      text: textOf(ruleFormTexts, withoutTable.code, withoutTable.details),
    },
    {
      finding: withoutWhy,
      text: textOf(rulesTexts, withoutWhy.code, withoutWhy.details),
    },
    {
      finding: cycle,
      text: textOf(structureTexts, cycle.code, cycle.details),
    },
    {
      finding: termMisshapen,
      text: textOf(termsTexts, termMisshapen.code, termMisshapen.details),
    },
    {
      finding: globWithSpace,
      text: textOf(valueTexts, globWithSpace.code, globWithSpace.details),
    },
  ])(
    'should say a finding of $finding.code as the table of its check words it',
    ({ finding, text }) => {
      // Arrange
      const reported = finding;

      // Act
      const said = findingTextOf(reported);

      // Assert
      expect(said).toBe(text);
    },
  );
});
