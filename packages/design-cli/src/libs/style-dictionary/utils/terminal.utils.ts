import type { FormatFn, TransformedToken } from 'style-dictionary/types';
import { fileHeader, getReferences } from 'style-dictionary/utils';

const JSON_INDENT = 2;

/** the scale an app's own brand.tokens.json replaces */
const ACCENT_SCALE = 'brand';

const nameOf = ({ path: [, ...name] }: TransformedToken): string => name.join('.');

const isOnAccentScale = ({ path: [, scale] }: TransformedToken): boolean => scale === ACCENT_SCALE;

/**
 * Style Dictionary has no format for a terminal: the module holds the accent's roles as steps, so an
 * app's own scale takes their place at run time, every other role that is opaque in hex, the
 * durations in milliseconds and the spacings in pixels.
 */
const terminalModule: FormatFn = async ({ dictionary }) => {
  const tokensOf = (group: string): TransformedToken[] =>
    dictionary.allTokens.filter(({ path: [first] }) => first === group);

  const colours = tokensOf('color');
  const roles = colours.flatMap((role) =>
    getReferences(role.original.$value, dictionary.tokens).map((step) => ({
      role,
      step,
    })),
  );
  const tokens = {
    accent: Object.fromEntries(
      roles
        .filter(({ step }) => isOnAccentScale(step))
        .map(({ role, step }) => [
          nameOf(role),
          step.path.at(-1),
        ]),
    ),
    brand: Object.fromEntries(
      colours.filter(isOnAccentScale).map((step) => [
        step.path.at(-1),
        step.$value,
      ]),
    ),
    // a terminal cannot lay a colour over another
    colour: Object.fromEntries(
      roles
        .filter(({ step }) => !isOnAccentScale(step) && step.original.$value.alpha === undefined)
        .map(({ role }) => [
          nameOf(role),
          role.$value,
        ]),
    ),
    duration: Object.fromEntries(
      tokensOf('duration').map((token) => [
        nameOf(token),
        token.$value.value,
      ]),
    ),
    spacing: Object.fromEntries(
      tokensOf('spacing').map((token) => [
        nameOf(token),
        token.$value.value,
      ]),
    ),
  };

  return `${await fileHeader({})}const tokens = ${JSON.stringify(tokens, undefined, JSON_INDENT)};\n\nexport { tokens };\n`;
};

export { terminalModule };
