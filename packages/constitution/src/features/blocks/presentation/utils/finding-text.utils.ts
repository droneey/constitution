import type { TextsOf } from '#/shared/cli';
import { textOf } from '#/shared/cli';

import type {
  BlockFinding,
  BlockFindingDetails,
} from '../../domain/validate-constitution/services';
import { heldRuleOf } from '../../domain/validate-constitution/services';
import { budgetTexts } from './budget-texts.utils';
import { decisionsTexts } from './decisions-texts.utils';
import { loadTexts } from './load-texts.utils';
import { namesTexts } from './names-texts.utils';
import { pluginTexts } from './plugin-texts.utils';
import { referencesTexts } from './references-texts.utils';
import { requirementsTexts } from './requirements-texts.utils';
import { requiresTexts } from './requires-texts.utils';
import { ruleFormTexts } from './rule-form-texts.utils';
import { ruleWordingTexts } from './rule-wording-texts.utils';
import { rulesTexts } from './rules-texts.utils';
import { structureTexts } from './structure-texts.utils';
import { termsTexts } from './terms-texts.utils';
import { valueTexts } from './value-texts.utils';

const findingTexts: TextsOf<BlockFindingDetails> = {
  ...budgetTexts,
  ...decisionsTexts,
  ...loadTexts,
  ...namesTexts,
  ...pluginTexts,
  ...referencesTexts,
  ...requirementsTexts,
  ...requiresTexts,
  ...ruleFormTexts,
  ...ruleWordingTexts,
  ...rulesTexts,
  ...structureTexts,
  ...termsTexts,
  ...valueTexts,
};

const findingTextOf = (finding: BlockFinding): string => {
  const held = heldRuleOf(finding.code);
  const text = textOf(findingTexts, finding.code, finding.details);

  return held === undefined ? text : `[${held.rule}] ${text}`;
};

export { findingTextOf };
