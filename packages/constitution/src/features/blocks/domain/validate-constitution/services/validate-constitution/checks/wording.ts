import type { Rule } from '#/kernel/entities';
import type { FindingOf, ProblemOf } from '#/kernel/types';
import { withoutInlineCode } from '#/kernel/utils';
import type { RuleSlug } from '#/kernel/value-objects';

import { findingsAt } from '../../../utils';
import type { Check, CheckInput } from '../check.types';

enum WordingCode {
  SloganTooLong = 'slogan-too-long',
  SloganUnscoped = 'slogan-unscoped',
  ExceptionMisplaced = 'exception-outside-exempt',
  ModalVerb = 'statement-holds-modal-verb',
  WhyDashes = 'why-with-many-dashes',
  WhyUnclosed = 'why-without-period',
  SlugJoinsWithAnd = 'slug-joins-with-and',
}

interface WordingDetails {
  readonly [WordingCode.SloganTooLong]: {
    readonly slug: RuleSlug;
    readonly words: number;
  };
  readonly [WordingCode.SloganUnscoped]: {
    readonly slug: RuleSlug;
  };
  readonly [WordingCode.ExceptionMisplaced]: {
    readonly slug: RuleSlug;
  };
  readonly [WordingCode.ModalVerb]: {
    readonly slug: RuleSlug;
    readonly verb: string;
  };
  readonly [WordingCode.WhyDashes]: {
    readonly dashes: number;
    readonly slug: RuleSlug;
  };
  readonly [WordingCode.WhyUnclosed]: {
    readonly slug: RuleSlug;
  };
  readonly [WordingCode.SlugJoinsWithAnd]: {
    readonly slug: RuleSlug;
  };
}

type WordingFinding = FindingOf<WordingDetails>;

type WordingProblem = ProblemOf<WordingDetails>;

const SLOGAN_WORDS = 22;
const SLOGAN_END = /(?<=[.:;])\s/;
const SENTENCE_END = /(?<=\.) (?=[A-Z«`])/;
const SCOPE = /\b(?:every|each|all|everything|no|none|nothing|only|never|wherever|whatever)\b/i;
const NAMED_SUBJECT = /^(?:The|Core|One) /;
const EXCEPTION = /\b(?:except|unless)\b|, save\b|Exempt:/;
const EXEMPT = 'Exempt:';
const MODAL = /(?<!`)\b(must|should)\b(?!`)/;
const WHY_DASH = ' — ';
const WHY_DASHES = 1;
const PERIOD = '.';
const AND = '-and-';

const WHITESPACE = /\s+/;

const sloganOf = (statement: string): string => String(statement.split(SLOGAN_END, 1));

const wordsOf = (text: string): number => text.split(WHITESPACE).length;

const sloganProblems = (rule: Rule): readonly (WordingProblem | undefined)[] => {
  const slogan = sloganOf(rule.statement);
  const words = wordsOf(slogan);

  return [
    words > SLOGAN_WORDS
      ? {
          code: WordingCode.SloganTooLong,
          details: {
            slug: rule.slug,
            words,
          },
        }
      : undefined,
    SCOPE.test(slogan) || NAMED_SUBJECT.test(slogan)
      ? undefined
      : {
          code: WordingCode.SloganUnscoped,
          details: {
            slug: rule.slug,
          },
        },
  ];
};

const exceptionProblem = (rule: Rule): WordingProblem | undefined => {
  const sentences = withoutInlineCode(rule.statement).split(SENTENCE_END);
  const last = String(sentences.slice(-1));
  const isMisplaced =
    sentences.slice(0, -1).some((sentence) => EXCEPTION.test(sentence)) ||
    (EXCEPTION.test(last) && !last.startsWith(EXEMPT));

  return isMisplaced
    ? {
        code: WordingCode.ExceptionMisplaced,
        details: {
          slug: rule.slug,
        },
      }
    : undefined;
};

const modalProblem = (rule: Rule): WordingProblem | undefined => {
  const verb = MODAL.exec(rule.statement)?.[1];

  return verb === undefined
    ? undefined
    : {
        code: WordingCode.ModalVerb,
        details: {
          slug: rule.slug,
          verb,
        },
      };
};

const whyProblems = (rule: Rule): readonly (WordingProblem | undefined)[] => {
  const dashes = rule.why.split(WHY_DASH).length - 1;

  return [
    dashes > WHY_DASHES
      ? {
          code: WordingCode.WhyDashes,
          details: {
            dashes,
            slug: rule.slug,
          },
        }
      : undefined,
    rule.why === '' || rule.why.endsWith(PERIOD)
      ? undefined
      : {
          code: WordingCode.WhyUnclosed,
          details: {
            slug: rule.slug,
          },
        },
  ];
};

const slugProblem = (rule: Rule): WordingProblem | undefined =>
  rule.slug.includes(AND)
    ? {
        code: WordingCode.SlugJoinsWithAnd,
        details: {
          slug: rule.slug,
        },
      }
    : undefined;

const wordingCheck: Check<WordingFinding> = ({
  constitution,
}: CheckInput): readonly WordingFinding[] =>
  constitution.rules
    .filter((rule) => rule.statement !== '')
    .flatMap((rule) =>
      findingsAt(rule.file, [
        ...sloganProblems(rule),
        exceptionProblem(rule),
        modalProblem(rule),
        ...whyProblems(rule),
        slugProblem(rule),
      ]),
    );

export type { WordingDetails };
export { WordingCode, wordingCheck };
