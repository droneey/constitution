import type { Finding } from '#/kernel';
import { Layer } from '#/kernel';

import type { RequirementAnswer, Rule } from '../../../../entities';
import { Met } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { inlineCodeSpans, mayReferTo } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

const METS: readonly string[] = Object.values(Met);
const SHORT_OF: readonly string[] = [
  Met.Partly,
  Met.No,
];

const at = (input: { answer: RequirementAnswer; message: string }): Finding => ({
  message: `answers "${input.answer.requirement}"${input.message}`,
  path: input.answer.file,
});

const targetMessage = (input: {
  answer: RequirementAnswer;
  byId: BlocksById;
  target: Rule | undefined;
}): string | undefined => {
  if (input.target === undefined) {
    return ', which is not a rule';
  }

  if (input.target.block === input.answer.block) {
    return ', a rule of its own block; a Requirements table answers the blocks above';
  }

  return mayReferTo({
    byId: input.byId,
    from: input.answer,
    to: input.target.block,
  })
    ? undefined
    : ` of ${input.target.block}, which its block may not refer to`;
};

// A partly or no answer names, in backticks, the rule of its own block that
// covers what the library misses or replaces the requirement.
const coverMessage = (input: {
  answer: RequirementAnswer;
  ownSlugs: ReadonlySet<string>;
}): string | undefined =>
  !SHORT_OF.includes(input.answer.met) ||
  inlineCodeSpans(input.answer.how).some((slug) => input.ownSlugs.has(slug))
    ? undefined
    : ` ${input.answer.met} without naming the rule that covers the rest`;

const formMessages = (input: {
  answer: RequirementAnswer;
  isRepeated: boolean;
  ownSlugs: ReadonlySet<string>;
}): readonly (string | undefined)[] => [
  METS.includes(input.answer.met)
    ? undefined
    : ` with Met "${input.answer.met}"; Met is ${Met.Yes}, ${Met.Partly} or ${Met.No}`,
  input.answer.how === '' ? ' without saying how' : undefined,
  coverMessage(input),
  input.isRepeated ? ' twice' : undefined,
];

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
      targetMessage({
        answer,
        byId: input.byId,
        target: slugs.get(answer.requirement),
      }),
      ...formMessages({
        answer,
        isRepeated,
        ownSlugs: new Set(
          input.rules.filter((rule) => rule.block === answer.block).map((rule) => rule.slug),
        ),
      }),
    ].flatMap((message) =>
      message === undefined
        ? []
        : [
            at({
              answer,
              message,
            }),
          ],
    );
  });
};

const requirementsCheck: Check = ({ byId, constitution }: CheckInput): readonly Finding[] => {
  const isInImplementation = (answer: RequirementAnswer): boolean =>
    // Stryker disable next-line OptionalChaining: every answer comes from a loaded block
    byId.get(answer.block)?.layer === Layer.Implementation;
  const fileFindings = (input: {
    isMisplaced: (answer: RequirementAnswer) => boolean;
    message: string;
  }): readonly Finding[] =>
    [
      ...new Set(
        constitution.requirementAnswers.filter(input.isMisplaced).map((answer) => answer.file),
      ),
    ].map((path) => ({
      message: input.message,
      path,
    }));
  const outside = [
    ...fileFindings({
      isMisplaced: (answer: RequirementAnswer): boolean => !isInImplementation(answer),
      message: 'answers requirements, which only an implementation does',
    }),
    // The index gives an answer no seam, so a with/ file holds no answer.
    ...fileFindings({
      isMisplaced: (answer: RequirementAnswer): boolean =>
        isInImplementation(answer) && answer.with !== undefined,
      message:
        'answers requirements in a with/ file; a block answers them in its main file or a chapter',
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
