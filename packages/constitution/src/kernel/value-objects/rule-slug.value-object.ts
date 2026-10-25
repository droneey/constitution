import { InvalidValueError, ValueFailure } from '../errors';
import type { Brand } from '../types';

type RuleSlug = Brand<string, 'RuleSlug'>;

const KEBAB_CASE_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const is = (candidate: unknown): candidate is RuleSlug =>
  typeof candidate === 'string' && KEBAB_CASE_SLUG.test(candidate);

/** @throws {@link InvalidValueError} when the text is no kebab-case slug */
const create = (text: string): RuleSlug => {
  if (!is(text)) {
    throw new InvalidValueError({
      code: ValueFailure.RuleSlug,
      details: {
        text,
      },
    });
  }

  return text;
};

const equals = (left: RuleSlug, right: RuleSlug): boolean => left === right;

const RuleSlug = {
  create,
  equals,
  is,
} as const;

export { RuleSlug };
