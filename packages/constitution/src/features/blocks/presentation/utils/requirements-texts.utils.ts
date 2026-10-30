import { Met } from '#/kernel/entities';
import type { TextsOf } from '#/shared/cli';

import type { RequirementsDetails } from '../../application/use-cases/queries/check';
import { RequirementsCode } from '../../application/use-cases/queries/check';

const requirementsTexts: TextsOf<RequirementsDetails> = {
  [RequirementsCode.OutsideImplementation]: () =>
    'answers requirements, which only an implementation does',
  [RequirementsCode.OutsidePassport]: () =>
    "answers requirements outside the block's passport; an implementation answers them in its passport <id>.md",
  [RequirementsCode.NotRule]: ({ requirement }) => `answers "${requirement}", which is not a rule`,
  [RequirementsCode.OwnRule]: ({ requirement }) =>
    `answers "${requirement}", a rule of its own block; a Requirements table answers the blocks above`,
  [RequirementsCode.OutOfReach]: ({ owner, requirement }) =>
    `answers "${requirement}" of ${owner}, which its block may not refer to`,
  [RequirementsCode.MetUnknown]: ({ met, requirement }) =>
    `answers "${requirement}" with Met "${met}"; Met is ${Met.Yes}, ${Met.Partly} or ${Met.No}`,
  [RequirementsCode.WithoutHow]: ({ requirement }) => `answers "${requirement}" without saying how`,
  [RequirementsCode.WithoutCover]: ({ met, requirement }) =>
    `answers "${requirement}" ${met} without naming the rule that covers the rest`,
  [RequirementsCode.Repeated]: ({ requirement }) => `answers "${requirement}" twice`,
};

export { requirementsTexts };
