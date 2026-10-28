import type { ThemeMode } from '@droneey/design-tokens';
import { formats, transforms } from 'style-dictionary/enums';
import type { Config, Hooks, TransformedToken } from 'style-dictionary/types';
import { usesReferences } from 'style-dictionary/utils';

import { modeVariables } from './mode-variables.utils';
import { tailwindTheme } from './tailwind-theme.utils';

const TAILWIND_THEME_FORMAT = 'tailwind/theme';
const MODE_VARIABLES_FORMAT = 'css/mode-variables';

// Stryker disable next-line StringLiteral: the name only joins the transform to the platform that runs it, so any name serves
const REDUCED_MOTION_DURATION_TRANSFORM = 'duration/none';

const tailwindPrimitiveGroupNames: ReadonlySet<string | undefined> = new Set([
  'duration',
  'ease',
  'font',
]);

const configOf = ({ name: modeName, isDefault }: ThemeMode, buildPath: string): Config => {
  const hooks: Hooks = {
    formats: {
      [TAILWIND_THEME_FORMAT]: tailwindTheme,
      [MODE_VARIABLES_FORMAT]: modeVariables,
    },
    transforms: {
      [REDUCED_MOTION_DURATION_TRANSFORM]: {
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
    // Why: another mode's roles refer to steps the default mode declares and it does not write, so
    // its warnings are noise.
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
                  usesReferences(token.original.$value) ||
                  tailwindPrimitiveGroupNames.has(token.path[0]),
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
                REDUCED_MOTION_DURATION_TRANSFORM,
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
