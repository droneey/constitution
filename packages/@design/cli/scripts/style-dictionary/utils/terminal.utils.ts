import type { FormatFn, TransformedToken } from 'style-dictionary/types';
import { fileHeader, getReferences } from 'style-dictionary/utils';

import { MalformedTokenError } from '../errors';

const JSON_INDENT = 2;

/** the scale an app's own brand.tokens.json replaces */
const ACCENT_SCALE_NAME = 'brand';

const nameOf = ({ path: [, ...nameSegments] }: TransformedToken): string => nameSegments.join('.');

const isOnAccentScale = ({ path: [, scaleName] }: TransformedToken): boolean =>
  scaleName === ACCENT_SCALE_NAME;

/**
 * A colour without an alpha, which a terminal can draw as it is.
 *
 * @throws {@link MalformedTokenError} when the token's value is no colour object
 */
const isOpaque = ({ name, original }: TransformedToken): boolean => {
  const colour: unknown = original.$value;

  if (!(colour instanceof Object)) {
    throw new MalformedTokenError(name);
  }

  return !('alpha' in colour);
};

/** @throws {@link MalformedTokenError} when the token's value is no measure */
const amountOf = ({ $value, name }: TransformedToken): number => {
  const measure: unknown = $value;

  if (measure instanceof Object && 'value' in measure && typeof measure.value === 'number') {
    return measure.value;
  }

  throw new MalformedTokenError(name);
};

/**
 * Style Dictionary has no format for a terminal: the module holds the accent's roles as steps, so an
 * app's own scale takes their place at run time, every other role that is opaque in hex, the
 * durations in milliseconds and the spacings in pixels.
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
    // a terminal cannot lay a colour over another
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
