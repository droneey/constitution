import { Layer } from '#/kernel/constants';
import type { Finding, Problem } from '#/kernel/types';

import type { RequirementAnswer, Rule } from '../../../../entities';
import { Met } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { inlineCodeSpans, mayReferTo } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

enum RequirementsCode {
  OutsideImplementation = 'requirements-outside-implementation',
  OutsidePassport = 'requirements-outside-passport',
  NotRule = 'answer-names-no-rule',
  OwnRule = 'answer-names-own-rule',
  OutOfReach = 'answer-out-of-reach',
  MetUnknown = 'answer-met-unknown',
  WithoutHow = 'answer-without-how',
  WithoutCover = 'answer-without-covering-rule',
  Repeated = 'answer-repeated',
}

const METS: readonly string[] = Object.values(Met);
const SHORT_OF: readonly string[] = [
  Met.Partly,
  Met.No,
];

const targetProblem = (input: {
  answer: RequirementAnswer;
  byId: BlocksById;
  target: Rule | undefined;
}): Problem | undefined => {
  const { requirement } = input.answer;

  if (input.target === undefined) {
    return {
      code: RequirementsCode.NotRule,
      message: `answers "${requirement}", which is not a rule`,
    };
  }

  if (input.target.block === input.answer.block) {
    return {
      code: RequirementsCode.OwnRule,
      message: `answers "${requirement}", a rule of its own block; a Requirements table answers the blocks above`,
    };
  }

  return mayReferTo({
    byId: input.byId,
    from: input.answer,
    to: input.target.block,
  })
    ? undefined
    : {
        code: RequirementsCode.OutOfReach,
        message: `answers "${requirement}" of ${input.target.block}, which its block may not refer to`,
      };
};

const coverProblem = (input: {
  answer: RequirementAnswer;
  ownSlugs: ReadonlySet<string>;
}): Problem | undefined =>
  !SHORT_OF.includes(input.answer.met) ||
  inlineCodeSpans(input.answer.how).some((slug) => input.ownSlugs.has(slug))
    ? undefined
    : {
        code: RequirementsCode.WithoutCover,
        message: `answers "${input.answer.requirement}" ${input.answer.met} without naming the rule that covers the rest`,
      };

const formProblems = (input: {
  answer: RequirementAnswer;
  isRepeated: boolean;
  ownSlugs: ReadonlySet<string>;
}): readonly (Problem | undefined)[] => {
  const { how, met, requirement } = input.answer;

  return [
    METS.includes(met)
      ? undefined
      : {
          code: RequirementsCode.MetUnknown,
          message: `answers "${requirement}" with Met "${met}"; Met is ${Met.Yes}, ${Met.Partly} or ${Met.No}`,
        },
    how === ''
      ? {
          code: RequirementsCode.WithoutHow,
          message: `answers "${requirement}" without saying how`,
        }
      : undefined,
    coverProblem(input),
    input.isRepeated
      ? {
          code: RequirementsCode.Repeated,
          message: `answers "${requirement}" twice`,
        }
      : undefined,
  ];
};

const answerFindings = (input: {
  answers: readonly RequirementAnswer[];
  byId: BlocksById;
  rules: readonly Rule[];
}): readonly Finding[] => {
  const slugs = new Map(
    input.rules.toReversed().map((rule) => [
      rule.slug,
      rule,
    ]),
  );
  const seen = new Set<string>();

  return input.answers.flatMap((answer) => {
    const key = `${answer.block} ${answer.requirement}`;
    const isRepeated = seen.has(key);

    seen.add(key);

    return [
      targetProblem({
        answer,
        byId: input.byId,
        target: slugs.get(answer.requirement),
      }),
      ...formProblems({
        answer,
        isRepeated,
        ownSlugs: new Set(
          input.rules.filter((rule) => rule.block === answer.block).map((rule) => rule.slug),
        ),
      }),
    ].flatMap((problem) =>
      problem === undefined
        ? []
        : [
            {
              ...problem,
              path: answer.file,
            },
          ],
    );
  });
};

const requirementsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
  const isInImplementation = (answer: RequirementAnswer): boolean =>
    // Stryker disable next-line OptionalChaining: every answer comes from a loaded block
    byId.get(answer.block)?.layer === Layer.Implementation;
  const isInPassport = (answer: RequirementAnswer): boolean =>
    // Stryker disable next-line OptionalChaining: every answer comes from a loaded block
    byId.get(answer.block)?.path === answer.file;
  const fileFindings = (input: {
    isMisplaced: (answer: RequirementAnswer) => boolean;
    problem: Problem;
  }): readonly Finding[] =>
    [
      ...new Set(
        constitution.requirementAnswers.filter(input.isMisplaced).map((answer) => answer.file),
      ),
    ].map((path) => ({
      ...input.problem,
      path,
    }));
  const outside = [
    ...fileFindings({
      isMisplaced: (answer: RequirementAnswer): boolean => !isInImplementation(answer),
      problem: {
        code: RequirementsCode.OutsideImplementation,
        message: 'answers requirements, which only an implementation does',
      },
    }),
    // The answers describe the block whole, so its passport holds them, never a chapter or a seam.
    ...fileFindings({
      isMisplaced: (answer: RequirementAnswer): boolean =>
        isInImplementation(answer) && !isInPassport(answer),
      problem: {
        code: RequirementsCode.OutsidePassport,
        message:
          "answers requirements outside the block's passport; an implementation answers them in its passport <id>.md",
      },
    }),
  ];

  return [
    ...outside,
    ...answerFindings({
      answers: constitution.requirementAnswers.filter(isInImplementation),
      byId,
      rules: constitution.rules,
    }),
  ];
};

export { requirementsCheck };
