import type { Constitution, RequirementAnswer } from '#/features/constitution';
import type { Finding } from '#/kernel';

import type { Check } from '../check.types';
import type { BlocksById } from '../closure.utils';
import { byIdOf, mayReferTo } from '../closure.utils';

const STATUS = /^(?:met|not met|partial: \S.*)$/;

const at = (answer: RequirementAnswer, message: string): Finding => ({
  message,
  path: answer.file,
});

const targetFindings = (input: {
  answer: RequirementAnswer;
  byId: BlocksById;
  constitution: Constitution;
}): readonly Finding[] => {
  const { answer } = input;
  const target = input.constitution.rules.find(
    (rule) => rule.slug === answer.requirement,
  );

  if (target === undefined) {
    return [
      at(answer, `answers "${answer.requirement}", which is not a rule`),
    ];
  }

  const from = input.byId.get(answer.block);
  const file = from?.files.find((candidate) => candidate.path === answer.file);
  const isAllowed =
    from !== undefined &&
    file !== undefined &&
    mayReferTo({
      byId: input.byId,
      file,
      from,
      to: target.block,
    });

  return isAllowed
    ? []
    : [
        at(
          answer,
          `answers "${answer.requirement}" of ${target.block}, which its block may not refer to`,
        ),
      ];
};

const formFindings = (input: {
  answer: RequirementAnswer;
  isRepeated: boolean;
}): readonly Finding[] => {
  const { answer } = input;

  return [
    ...(STATUS.test(answer.status)
      ? []
      : [
          at(
            answer,
            `answers "${answer.requirement}" with the status "${answer.status}"; a status is met, partial: <workaround> or not met`,
          ),
        ]),
    ...(answer.how === ''
      ? [
          at(answer, `answers "${answer.requirement}" without saying how`),
        ]
      : []),
    ...(input.isRepeated
      ? [
          at(answer, `answers "${answer.requirement}" twice`),
        ]
      : []),
  ];
};

const requirementsCheck: Check = (
  constitution: Constitution,
): readonly Finding[] => {
  const byId = byIdOf(constitution.blocks);
  const answers = constitution.requirementAnswers;
  const isInImplementation = (answer: RequirementAnswer): boolean =>
    byId.get(answer.block)?.layer === 'implementation';
  const outside = [
    ...new Set(
      answers
        .filter((answer) => !isInImplementation(answer))
        .map((answer) => answer.file),
    ),
  ].map((path) => ({
    message: 'answers requirements, which only an implementation does',
    path,
  }));

  return [
    ...outside,
    ...answers.flatMap((answer, index) =>
      isInImplementation(answer)
        ? [
            ...targetFindings({
              answer,
              byId,
              constitution,
            }),
            ...formFindings({
              answer,
              isRepeated:
                answers.findIndex(
                  (candidate) =>
                    candidate.block === answer.block &&
                    candidate.requirement === answer.requirement,
                ) !== index,
            }),
          ]
        : [],
    ),
  ];
};

export { requirementsCheck };
