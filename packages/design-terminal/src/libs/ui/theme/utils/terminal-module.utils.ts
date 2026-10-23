import { ACCENT_SCALE, ThemeMode, TokenGroupPath } from '../constants';
import { ThemeTokenError } from '../errors';
import type { DesignTokens, ModeTokens } from '../types';
import { colourOf, measureOf, pathsUnder, pixelsOf, roleTargetsOf } from './tokens.utils';

const JSON_INDENT = 2;

const ACCENT_STEP = `${ACCENT_SCALE}.`;

const hexOf = (tokens: DesignTokens, path: string): string => {
  const { hex } = colourOf(tokens, path);

  if (hex === undefined) {
    throw new ThemeTokenError(`${path} holds a colour with no hex`);
  }

  return hex;
};

const nameOf = (path: string, group: string): string => path.slice(group.length);

const accentStepsOf = (tokens: DesignTokens): Readonly<Record<string, string>> =>
  Object.fromEntries(
    roleTargetsOf(tokens).flatMap(([path, target]) =>
      target.startsWith(ACCENT_STEP)
        ? [
            [
              nameOf(path, TokenGroupPath.Colour),
              nameOf(target, ACCENT_STEP),
            ],
          ]
        : [],
    ),
  );

/** a translucent role is left out: a terminal cannot lay a colour over another */
const colourHexesOf = (tokens: DesignTokens): Readonly<Record<string, string>> =>
  Object.fromEntries(
    roleTargetsOf(tokens).flatMap(([path, target]) =>
      target.startsWith(ACCENT_STEP) || colourOf(tokens, target).alpha !== undefined
        ? []
        : [
            [
              nameOf(path, TokenGroupPath.Colour),
              hexOf(tokens, target),
            ],
          ],
    ),
  );

const measuresOf = (
  tokens: DesignTokens,
  group: TokenGroupPath,
  read: (path: string) => number,
): Readonly<Record<string, number>> =>
  Object.fromEntries(
    pathsUnder(tokens, group).map((path) => [
      nameOf(path, group),
      read(path),
    ]),
  );

/**
 * The accent's roles as steps, so an app's own scale takes their place at run time; every other
 * role in hex. The caller writes the banner.
 *
 * @throws {@link ThemeTokenError} when a colour has no hex, or a role names no token
 */
const emitTerminalModule = (modes: ModeTokens): string[] => {
  const light = modes[ThemeMode.Light];
  const dark = modes[ThemeMode.Dark];
  const designTokens = {
    accent: {
      [ThemeMode.Light]: accentStepsOf(light),
      [ThemeMode.Dark]: accentStepsOf(dark),
    },
    brand: Object.fromEntries(
      pathsUnder(light, ACCENT_STEP).map((path) => [
        nameOf(path, ACCENT_STEP),
        hexOf(light, path),
      ]),
    ),
    colour: {
      [ThemeMode.Light]: colourHexesOf(light),
      [ThemeMode.Dark]: colourHexesOf(dark),
    },
    duration: measuresOf(light, TokenGroupPath.Duration, (path) => measureOf(light, path)),
    spacing: measuresOf(light, TokenGroupPath.Spacing, (path) => pixelsOf(light, path)),
  };

  return [
    '',
    `const designTokens = ${JSON.stringify(designTokens, undefined, JSON_INDENT)};`,
    '',
    'export { designTokens };',
    '',
  ];
};

export { emitTerminalModule };
