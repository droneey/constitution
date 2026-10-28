import type { Dictionary, TransformedToken } from 'style-dictionary/types';
import { getReferences } from 'style-dictionary/utils';

import type { TypographyPart } from '../constants';
import { MalformedTokenError } from '../errors';

const isRecord = (tokenValue: unknown): tokenValue is Readonly<Record<string, unknown>> =>
  // Stryker disable next-line ConditionalExpression,LogicalOperator: a string has no parts, and Style Dictionary finds no reference in a number or in null, so the check only types the value
  typeof tokenValue === 'object' && tokenValue !== null;

const referencesOf = (tokenValue: unknown, dictionary: Dictionary): TransformedToken[] =>
  // Stryker disable next-line ConditionalExpression: Style Dictionary finds no reference in any other value, so the check only types it
  typeof tokenValue === 'string' || isRecord(tokenValue)
    ? getReferences(tokenValue, dictionary.tokens)
    : [];

/** @throws {MalformedTokenError} when the part refers to no token */
const referencedNameOf = (
  token: TransformedToken,
  partName: TypographyPart,
  dictionary: Dictionary,
): string => {
  const parts: unknown = token.original.$value;
  const [reference] = isRecord(parts) ? referencesOf(parts[partName], dictionary) : [];

  if (reference === undefined) {
    throw new MalformedTokenError(token.name);
  }

  return reference.name;
};

export { referencedNameOf, referencesOf };
