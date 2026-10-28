import { Layer } from '#/kernel/constants';
import { Met, RequirementAnswer, Rule } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { firstBy, inlineCodeSpans } from '#/kernel/utils';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import { BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { findingsAt } from '../utils';

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

interface RequirementsDetails {
  readonly [RequirementsCode.OutsideImplementation]: object;
  readonly [RequirementsCode.OutsidePassport]: object;
  readonly [RequirementsCode.NotRule]: {
    readonly requirement: RuleSlug;
  };
  readonly [RequirementsCode.OwnRule]: {
    readonly requirement: RuleSlug;
  };
  readonly [RequirementsCode.OutOfReach]: {
    /** the block of the rule the answer names */
    readonly owner: BlockId;
    readonly requirement: RuleSlug;
  };
  readonly [RequirementsCode.MetUnknown]: {
    /** the Met cell as written */
    readonly met: string;
    readonly requirement: RuleSlug;
  };
  readonly [RequirementsCode.WithoutHow]: {
    readonly requirement: RuleSlug;
  };
  readonly [RequirementsCode.WithoutCover]: {
    readonly met: Met;
    readonly requirement: RuleSlug;
  };
  readonly [RequirementsCode.Repeated]: {
    readonly requirement: RuleSlug;
  };
}

type RequirementsFinding = FindingOf<RequirementsDetails>;

type RequirementsProblem = ProblemOf<RequirementsDetails>;

const shortOf: ReadonlySet<Met> = new Set([
  Met.Partly,
  Met.No,
]);

const targetProblem = (input: {
  answer: RequirementAnswer;
  graph: BlockGraph;
  target: Rule | undefined;
}): RequirementsProblem | undefined => {
  const { requirement } = input.answer;

  if (input.target === undefined) {
    return {
      code: RequirementsCode.NotRule,
      details: {
        requirement,
      },
    };
  }

  if (BlockId.equals(input.target.block, input.answer.block)) {
    return {
      code: RequirementsCode.OwnRule,
      details: {
        requirement,
      },
    };
  }

  return BlockGraph.mayReferTo(input.graph, {
    from: input.answer,
    to: input.target.block,
  })
    ? undefined
    : {
        code: RequirementsCode.OutOfReach,
        details: {
          owner: input.target.block,
          requirement,
        },
      };
};

const coverProblem = (input: {
  answer: RequirementAnswer;
  ownSlugs: ReadonlySet<RuleSlug>;
}): RequirementsProblem | undefined => {
  const met = RequirementAnswer.metOf(input.answer);

  // Stryker disable next-line ConditionalExpression: the test only narrows the type
  return met === undefined ||
    !shortOf.has(met) ||
    inlineCodeSpans(input.answer.how).some((span) => RuleSlug.is(span) && input.ownSlugs.has(span))
    ? undefined
    : {
        code: RequirementsCode.WithoutCover,
        details: {
          met,
          requirement: input.answer.requirement,
        },
      };
};

const formProblems = (input: {
  answer: RequirementAnswer;
  isRepeated: boolean;
  ownSlugs: ReadonlySet<RuleSlug>;
}): readonly (RequirementsProblem | undefined)[] => {
  const { how, requirement, writtenMet } = input.answer;

  return [
    RequirementAnswer.metOf(input.answer) === undefined
      ? {
          code: RequirementsCode.MetUnknown,
          details: {
            met: writtenMet,
            requirement,
          },
        }
      : undefined,
    how === ''
      ? {
          code: RequirementsCode.WithoutHow,
          details: {
            requirement,
          },
        }
      : undefined,
    coverProblem(input),
    input.isRepeated
      ? {
          code: RequirementsCode.Repeated,
          details: {
            requirement,
          },
        }
      : undefined,
  ];
};

const answerKeyOf = (answer: RequirementAnswer): string => `${answer.block} ${answer.requirement}`;

const answerFindings = (input: {
  answers: readonly RequirementAnswer[];
  graph: BlockGraph;
  rules: readonly Rule[];
}): readonly RequirementsFinding[] => {
  const slugs = Rule.bySlug(input.rules);
  const firsts = firstBy(input.answers, answerKeyOf);

  return input.answers.flatMap((answer) => {
    const problems: readonly (RequirementsProblem | undefined)[] = [
      targetProblem({
        answer,
        graph: input.graph,
        target: slugs.get(answer.requirement),
      }),
      ...formProblems({
        answer,
        isRepeated: firsts.get(answerKeyOf(answer)) !== answer,
        ownSlugs: new Set(
          input.rules
            .filter((rule) => BlockId.equals(rule.block, answer.block))
            .map((rule) => rule.slug),
        ),
      }),
    ];

    return findingsAt(answer.file, problems);
  });
};

const requirementsCheck: Check<RequirementsFinding> = ({
  graph,
  constitution,
}: CheckInput): readonly RequirementsFinding[] => {
  const isInImplementation = (answer: RequirementAnswer): boolean =>
    // Stryker disable next-line OptionalChaining: every answer comes from a loaded block
    graph.get(answer.block)?.layer === Layer.Implementation;

  const isInPassport = (answer: RequirementAnswer): boolean =>
    // Stryker disable next-line OptionalChaining: every answer comes from a loaded block
    graph.get(answer.block)?.passport.path === answer.file;

  const fileFindings = (input: {
    isMisplaced: (answer: RequirementAnswer) => boolean;
    problem: RequirementsProblem;
  }): readonly RequirementsFinding[] =>
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
        details: {},
      },
    }),
    // The answers describe the block whole, so its passport holds them, never a chapter or a seam.
    ...fileFindings({
      isMisplaced: (answer: RequirementAnswer): boolean =>
        isInImplementation(answer) && !isInPassport(answer),
      problem: {
        code: RequirementsCode.OutsidePassport,
        details: {},
      },
    }),
  ];

  return [
    ...outside,
    ...answerFindings({
      answers: constitution.requirementAnswers.filter(isInImplementation),
      graph,
      rules: constitution.rules,
    }),
  ];
};

export type { RequirementsDetails };
export { RequirementsCode, requirementsCheck };
