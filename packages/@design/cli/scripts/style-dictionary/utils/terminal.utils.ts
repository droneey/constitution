import type { FormatFn, TransformedToken } from 'style-dictionary/types';
import { fileHeader, getReferences } from 'style-dictionary/utils';

import { MalformedTokenError } from '../errors';

const JSON_INDENT = 2;

const ACCENT_SCALE_NAME = 'brand';

const nameOf = ({ path: [, ...nameSegments] }: TransformedToken): string => nameSegments.join('.');

const isOnAccentScale = ({ path: [, scaleName] }: TransformedToken): boolean =>
  scaleName === ACCENT_SCALE_NAME;

/** @throws {MalformedTokenError} when the token's value is no colour object */
const isOpaque = ({ name, original }: TransformedToken): boolean => {
  const colour: unknown = original.$value;

  if (!(colour instanceof Object)) {
    throw new MalformedTokenError(name);
  }

  return !('alpha' in colour);
};

/** @throws {MalformedTokenError} when the token's value is no measure */
const amountOf = ({ $value, name }: TransformedToken): number => {
  const measure: unknown = $value;

  if (measure instanceof Object && 'value' in measure && typeof measure.value === 'number') {
    return measure.value;
  }

  throw new MalformedTokenError(name);
};

// Why: Style Dictionary has no format for a terminal, and the module keeps the accent's roles as
// steps so that an app's own scale takes their place at run time.
/**
 * @throws {MalformedTokenError} when a colour's value is no colour object, or a duration's or a
 * spacing's value is no measure
 */
const terminalModule: FormatFn = async ({ dictionary }) => {
  const tokensOf = (groupName: string): TransformedToken[] =>
    dictionary.allTokens.filter(({ path: [tokenGroupName] }) => tokenGroupName === groupName);

  const colourTokens = tokensOf('color');
  const roleSteps = colourTokens.flatMap((role) =>
    getReferences(role.original.$value, dictionary.tokens).map((step) => ({
      role,
      step,
    })),
  );
  const terminalTokens = {
    accent: Object.fromEntries(
      roleSteps
        .filter(({ step }) => isOnAccentScale(step))
        .map(({ role, step }) => [
          nameOf(role),
          step.path.at(-1),
        ]),
    ),
    brand: Object.fromEntries(
      colourTokens.filter(isOnAccentScale).map((step) => [
        step.path.at(-1),
        step.$value,
      ]),
    ),
    // Why: a terminal cannot lay a colour over another.
    colour: Object.fromEntries(
      roleSteps
        .filter(({ step }) => !isOnAccentScale(step) && isOpaque(step))
        .map(({ role }) => [
          nameOf(role),
          role.$value,
        ]),
    ),
    durationsMs: Object.fromEntries(
      tokensOf('duration').map((token) => [
        nameOf(token),
        amountOf(token),
      ]),
    ),
    spacingsPx: Object.fromEntries(
      tokensOf('spacing').map((token) => [
        nameOf(token),
        amountOf(token),
      ]),
    ),
  };

  return `${await fileHeader({})}const tokens = ${JSON.stringify(terminalTokens, undefined, JSON_INDENT)} as const;\n\nexport { tokens };\n`;
};

export { terminalModule };
