import type { TextsOf } from '#/shared/cli';

import type { RulesDetails } from '../../domain/validate-constitution/services';
import { RulesCode } from '../../domain/validate-constitution/services';

const rulesTexts: TextsOf<RulesDetails> = {
  [RulesCode.WithoutStatement]: ({ slug }) => `rule "${slug}" has no statement`,
  [RulesCode.WithoutWhy]: ({ slug }) => `rule "${slug}" has no Why`,
  [RulesCode.DefinedTwice]: ({ firstFile, slug }) =>
    `rule "${slug}" is also defined in ${firstFile}`,
  [RulesCode.ParentNotRule]: ({ parent, slug }) =>
    `rule "${slug}" carries out "${parent}", which is not a rule`,
  [RulesCode.ParentChainCycle]: ({ cycle, slug }) =>
    `rule "${slug}" carries out a chain that comes back to it: ${cycle.join(' → ')}`,
  [RulesCode.ParentInOwnBlock]: ({ parent, slug }) =>
    `rule "${slug}" carries out "${parent}", a rule of its own block; a rule carries out only a rule of another block`,
  [RulesCode.ParentOutOfReach]: ({ parent, parentBlock, slug }) =>
    `rule "${slug}" carries out "${parent}" of ${parentBlock}, which its block may not refer to`,
  [RulesCode.ParentSeamOutOfReach]: ({ parent, parentBlock, parentSeam, slug }) =>
    `rule "${slug}" carries out "${parent}" of ${parentBlock} with ${parentSeam}, which its place does not reach`,
  [RulesCode.ParentOffAxis]: ({ axis, parent, parentAxis, slug }) =>
    `rule "${slug}" carries out "${parent}" on ${parentAxis}, which a rule on ${axis} may not refer to`,
  [RulesCode.LooserThanParent]: ({ level, parent, parentLevel, slug }) =>
    `rule "${slug}" is ${level} while it carries out the ${parentLevel} rule "${parent}"; a rule is never looser than the rule it carries out`,
  [RulesCode.WithoutLevel]: ({ parent, slug }) =>
    `rule "${slug}" carries out "${parent}" without a level; a rule that carries out another states its own, never looser than it`,
};

export { rulesTexts };
