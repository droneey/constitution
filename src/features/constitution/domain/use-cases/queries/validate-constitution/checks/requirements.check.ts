import type { Finding } from '#/kernel';

import type { RequirementAnswer, Rule } from '../../../../entities';
import type { BlocksById } from '../../../../utils';
import { mayReferTo } from '../../../../utils';
import type { Check, CheckInput } from '../check.types';

const STATUS = /^(?:met|not met|partial: \S.*)$/;

const at = (input: {
  answer: RequirementAnswer;
  message: string;
}): Finding => ({
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

const formMessages = (input: {
  answer: RequirementAnswer;
  isRepeated: boolean;
}): readonly (string | undefined)[] => [
  STATUS.test(input.answer.status)
    ? undefined
    : ` with the status "${input.answer.status}"; a status is met, partial: <workaround> or not met`,
  input.answer.how === '' ? ' without saying how' : undefined,
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

const requirementsCheck: Check = ({
  byId,
  constitution,
}: CheckInput): readonly Finding[] => {
  const isInImplementation = (answer: RequirementAnswer): boolean =>
    // Stryker disable next-line OptionalChaining: every answer comes from a loaded block
    byId.get(answer.block)?.layer === 'implementation';
  const fileFindings = (input: {
    isMisplaced: (answer: RequirementAnswer) => boolean;
    message: string;
  }): readonly Finding[] =>
    [
      ...new Set(
        constitution.requirementAnswers
          .filter(input.isMisplaced)
          .map((answer) => answer.file),
      ),
    ].map((path) => ({
      message: input.message,
      path,
    }));
  const outside = [
    ...fileFindings({
      isMisplaced: (answer: RequirementAnswer): boolean =>
        !isInImplementation(answer),
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
