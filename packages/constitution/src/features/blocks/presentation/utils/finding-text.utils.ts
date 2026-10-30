import type { TextsOf } from '#/shared/cli';
import { textOf } from '#/shared/cli';

import type { BlockFinding, BlockFindingDetails } from '../../application/use-cases/queries/check';
import { budgetTexts } from './budget-texts.utils';
import { decisionsTexts } from './decisions-texts.utils';
import { loadTexts } from './load-texts.utils';
import { pluginTexts } from './plugin-texts.utils';
import { referencesTexts } from './references-texts.utils';
import { requirementsTexts } from './requirements-texts.utils';
import { requiresTexts } from './requires-texts.utils';
import { ruleFormTexts } from './rule-form-texts.utils';
import { rulesTexts } from './rules-texts.utils';
import { structureTexts } from './structure-texts.utils';
import { termsTexts } from './terms-texts.utils';
import { valueTexts } from './value-texts.utils';

const findingTexts: TextsOf<BlockFindingDetails> = {
  ...budgetTexts,
  ...decisionsTexts,
  ...loadTexts,
  ...pluginTexts,
  ...referencesTexts,
  ...requirementsTexts,
  ...requiresTexts,
  ...ruleFormTexts,
  ...rulesTexts,
  ...structureTexts,
  ...termsTexts,
  ...valueTexts,
};

const findingTextOf = (finding: BlockFinding): string =>
  textOf(findingTexts, finding.code, finding.details);

export { findingTextOf };
