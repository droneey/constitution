import type { TextsOf } from '#/shared/cli';

import type {
  BlockFinding,
  BlockFindingCode,
  BlockFindingDetails,
} from '../../domain/use-cases/queries/check';
import { loadTexts } from './load-texts.utils';
import { presetsTexts } from './presets-texts.utils';
import { requiresTexts } from './requires-texts.utils';
import { ruleFormTexts } from './rule-form-texts.utils';
import { rulesTexts } from './rules-texts.utils';
import { structureTexts } from './structure-texts.utils';
import { valueTexts } from './value-texts.utils';

const findingTexts: TextsOf<BlockFindingDetails> = {
  ...loadTexts,
  ...presetsTexts,
  ...requiresTexts,
  ...ruleFormTexts,
  ...rulesTexts,
  ...structureTexts,
  ...valueTexts,
};

const textOf = <TCode extends BlockFindingCode>(
  code: TCode,
  details: BlockFindingDetails[TCode],
): string => findingTexts[code](details);

/** What a finding of the blocks says, as the report of the blocks words it. */
const findingTextOf = (finding: BlockFinding): string => textOf(finding.code, finding.details);

export { findingTextOf };
