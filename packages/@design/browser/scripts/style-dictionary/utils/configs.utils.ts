import type { ThemeMode } from '@droneey/design-tokens';
import { formats, transforms } from 'style-dictionary/enums';
import type { Config, Hooks, TransformedToken } from 'style-dictionary/types';
import { usesReferences } from 'style-dictionary/utils';

import { modeVariables } from './mode-variables.utils';
import { tailwindTheme } from './tailwind-theme.utils';

const TAILWIND_THEME_FORMAT = 'tailwind/theme';
const MODE_VARIABLES_FORMAT = 'css/mode-variables';

/** writes every duration as none, for those who ask for reduced motion */
// Stryker disable next-line StringLiteral: the name only joins the transform to the platform that runs it, so any name serves
const DURATION_NONE_TRANSFORM = 'duration/none';

/** the groups whose primitives Tailwind's theme takes besides the roles */
const tailwindGroupNames: ReadonlySet<string | undefined> = new Set([
  'duration',
  'ease',
  'font',
]);

/**
 * The configuration of a mode, writing in `buildPath`: the default mode writes every token on the
 * root, the durations of reduced motion and Tailwind's theme; another mode writes, under its class,
 * its own tokens and those that read them.
 */
const configOf = ({ name: modeName, isDefault }: ThemeMode, buildPath: string): Config => {
  const hooks: Hooks = {
    formats: {
      [TAILWIND_THEME_FORMAT]: tailwindTheme,
      [MODE_VARIABLES_FORMAT]: modeVariables,
    },
    transforms: {
      [DURATION_NONE_TRANSFORM]: {
        type: 'value',
        transform: (): string => '0s',
      },
    },
  };

  const modeFile = {
    destination: `${modeName}.gen.css`,
    format: MODE_VARIABLES_FORMAT,
  };

  return {
    // another mode's roles refer to the steps the default mode declares, which it does not write
    // Stryker disable ObjectLiteral,ConditionalExpression,StringLiteral: the log only quiets the build
    log: {
      warnings: isDefault ? 'warn' : 'disabled',
    },
    // Stryker restore ObjectLiteral,ConditionalExpression,StringLiteral
    platforms: {
      css: {
        transforms: [
          transforms.nameKebab,
          transforms.colorOklch,
          transforms.sizePxToRem,
          transforms.timeSeconds,
          transforms.cubicBezierCss,
          transforms.shadowCssShorthand,
          transforms.fontFamilyCss,
        ],
        buildPath,
        files: isDefault
          ? [
              {
                ...modeFile,
                options: {
                  outputReferences: true,
                },
              },
              {
                destination: 'tailwind.gen.css',
                format: TAILWIND_THEME_FORMAT,
                filter: (token: TransformedToken) =>
                  usesReferences(token.original.$value) || tailwindGroupNames.has(token.path[0]),
              },
            ]
          : [
              {
                ...modeFile,
                options: {
                  selector: `.${modeName}`,
                  outputReferences: true,
                  modeTokensOnly: true,
                },
              },
            ],
      },
      ...(isDefault
        ? {
            'reduced-motion': {
              transforms: [
                transforms.nameKebab,
                DURATION_NONE_TRANSFORM,
              ],
              buildPath,
              files: [
                {
                  destination: 'reduced-motion.gen.css',
                  format: formats.cssVariables,
                  filter: {
                    $type: 'duration',
                  },
                  options: {
                    selector: [
                      '@media (prefers-reduced-motion: reduce)',
                      ':root',
                    ],
                  },
                },
              ],
            },
          }
        : {}),
    },
    hooks,
  };
};

export { configOf };
