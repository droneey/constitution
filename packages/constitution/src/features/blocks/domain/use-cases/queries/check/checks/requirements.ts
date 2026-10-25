import { Layer } from '#/kernel/constants';
import { Met, RequirementAnswer, Rule } from '#/kernel/entities';
import type { Finding, Problem } from '#/kernel/types';
import { BlockId, RuleSlug } from '#/kernel/value-objects';

import { BlockGraph } from '../../../../entities';
import type { Check, CheckInput } from '../check.types';
import { inlineCodeSpans } from '../shared/markdown';

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

const shortOf: ReadonlySet<Met> = new Set([
  Met.Partly,
  Met.No,
]);

const targetProblem = (input: {
  answer: RequirementAnswer;
  graph: BlockGraph;
  target: Rule | undefined;
}): Problem | undefined => {
  const { requirement } = input.answer;

  if (input.target === undefined) {
    return {
      code: RequirementsCode.NotRule,
      message: `answers "${requirement}", which is not a rule`,
    };
  }

  if (BlockId.equals(input.target.block, input.answer.block)) {
    return {
      code: RequirementsCode.OwnRule,
      message: `answers "${requirement}", a rule of its own block; a Requirements table answers the blocks above`,
    };
  }

  return BlockGraph.mayReferTo(input.graph, {
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
  ownSlugs: ReadonlySet<RuleSlug>;
}): Problem | undefined => {
  const met = RequirementAnswer.metOf(input.answer);

  // Stryker disable next-line ConditionalExpression: the test only narrows the type
  return met === undefined ||
    !shortOf.has(met) ||
    inlineCodeSpans(input.answer.how).some((span) => RuleSlug.is(span) && input.ownSlugs.has(span))
    ? undefined
    : {
        code: RequirementsCode.WithoutCover,
        message: `answers "${input.answer.requirement}" ${met} without naming the rule that covers the rest`,
      };
};

const formProblems = (input: {
  answer: RequirementAnswer;
  isRepeated: boolean;
  ownSlugs: ReadonlySet<RuleSlug>;
}): readonly (Problem | undefined)[] => {
  const { how, requirement, writtenMet } = input.answer;

  return [
    RequirementAnswer.metOf(input.answer) === undefined
      ? {
          code: RequirementsCode.MetUnknown,
          message: `answers "${requirement}" with Met "${writtenMet}"; Met is ${Met.Yes}, ${Met.Partly} or ${Met.No}`,
        }
      : undefined,
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
  graph: BlockGraph;
  rules: readonly Rule[];
}): readonly Finding[] => {
  const slugs = Rule.bySlug(input.rules);
  const seen = new Set<string>();

  return input.answers.flatMap((answer) => {
    const key = `${answer.block} ${answer.requirement}`;
    const isRepeated = seen.has(key);

    seen.add(key);

    return [
      targetProblem({
        answer,
        graph: input.graph,
        target: slugs.get(answer.requirement),
      }),
      ...formProblems({
        answer,
        isRepeated,
        ownSlugs: new Set(
          input.rules
            .filter((rule) => BlockId.equals(rule.block, answer.block))
            .map((rule) => rule.slug),
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

const requirementsCheck: Check = ({ graph, constitution }: CheckInput): readonly Finding[] => {
  const isInImplementation = (answer: RequirementAnswer): boolean =>
    // Stryker disable next-line OptionalChaining: every answer comes from a loaded block
    graph.get(answer.block)?.layer === Layer.Implementation;

  const isInPassport = (answer: RequirementAnswer): boolean =>
    // Stryker disable next-line OptionalChaining: every answer comes from a loaded block
    graph.get(answer.block)?.passport.path === answer.file;

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
      graph,
      rules: constitution.rules,
    }),
  ];
};

export { requirementsCheck };
