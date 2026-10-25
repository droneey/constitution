import { formats, transforms } from 'style-dictionary/enums';
import type { Config, Hooks, TransformedToken } from 'style-dictionary/types';
import { usesReferences } from 'style-dictionary/utils';

import type { ThemeMode } from '../types';
import { tailwindTheme } from './tailwind.utils';

const TAILWIND_THEME_FORMAT = 'tailwind/theme';

/** writes every duration as none, for those who ask for reduced motion */
// Stryker disable next-line StringLiteral: the name only joins the transform to the platform that runs it, so any name serves
const DURATION_NONE_TRANSFORM = 'duration/none';

/** the tokens Tailwind's theme takes besides the roles */
const tailwindTypes: ReadonlySet<string | undefined> = new Set([
  'duration',
  'cubicBezier',
  'fontWeight',
]);

/**
 * The configuration of a mode, writing in `buildPath`: the default mode writes every token on the
 * root, the durations of reduced motion and Tailwind's theme; another mode writes only its own
 * tokens, under its class.
 */
const configOf = ({ name: mode, isDefault }: ThemeMode, buildPath: string): Config => {
  const hooks: Hooks = {
    formats: {
      [TAILWIND_THEME_FORMAT]: tailwindTheme,
    },
    transforms: {
      [DURATION_NONE_TRANSFORM]: {
        type: 'value',
        transform: (): string => '0s',
      },
    },
  };

  const modeFile = {
    destination: `${mode}.gen.css`,
    format: formats.cssVariables,
  };

  return {
    // another mode's roles refer to the steps the default mode declares, which its filter leaves out
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
                  usesReferences(token.original.$value) || tailwindTypes.has(token.$type),
              },
            ]
          : [
              {
                ...modeFile,
                filter: (token: TransformedToken) => token.isSource,
                options: {
                  selector: `.${mode}`,
                  outputReferences: true,
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
