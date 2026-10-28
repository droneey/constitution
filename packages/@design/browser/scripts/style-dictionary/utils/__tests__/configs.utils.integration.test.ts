import { describe, expect, it } from 'bun:test';

import type { FixtureOutputs } from './configs.fixtures';
import { goldenTextOf, outputsOf, refusalOf } from './configs.fixtures';

describe('configOf', () => {
  it.each<{
    readonly fileName: string;
    readonly format: string;
    readonly goldenFileName: string;
    readonly modeName: keyof FixtureOutputs;
  }>([
    {
      format:
        'every token of the default mode on the root, a role naming its step and a style of text as the font shorthand of its parts beside its letter spacing',
      modeName: 'light',
      fileName: 'theme/light.gen.css',
      goldenFileName: 'light.golden.txt',
    },
    {
      format: "Tailwind's theme, its own names kept apart from its aliases",
      modeName: 'light',
      fileName: 'theme/tailwind.gen.css',
      goldenFileName: 'tailwind.golden.txt',
    },
    {
      format: 'the durations of reduced motion',
      modeName: 'light',
      fileName: 'theme/reduced-motion.gen.css',
      goldenFileName: 'reduced-motion.golden.txt',
    },
    {
      format: "another mode's own tokens and each that reads one of them, under its class",
      modeName: 'dark',
      fileName: 'theme/dark.gen.css',
      goldenFileName: 'dark.golden.txt',
    },
  ])(
    'should write $format, as the golden file shows it',
    async ({ modeName, fileName, goldenFileName }) => {
      // Act
      const outputs = await outputsOf();

      // Assert
      expect(outputs[modeName][fileName]).toBe(await goldenTextOf(goldenFileName));
    },
  );

  it("should write Tailwind's theme and the durations of reduced motion for the default mode alone", async () => {
    // Act
    const outputs = await outputsOf();

    // Assert
    expect({
      light: Object.keys(outputs.light),
      dark: Object.keys(outputs.dark),
    }).toStrictEqual({
      light: [
        'theme/light.gen.css',
        'theme/tailwind.gen.css',
        'theme/reduced-motion.gen.css',
      ],
      dark: [
        'theme/dark.gen.css',
      ],
    });
  });

  it.each([
    {
      condition: 'a style of text with a part written in place',
      fileNames: [
        'base.fixtures.tokens.json',
        'radius.fixtures.tokens.json',
        'literal-composite.fixtures.tokens.json',
      ],
      tokenName: 'font-body-sm',
    },
    {
      condition: 'a style of text that refers to another style in place of its parts',
      fileNames: [
        'base.fixtures.tokens.json',
        'radius.fixtures.tokens.json',
        'alias-composite.fixtures.tokens.json',
      ],
      tokenName: 'font-body-sm',
    },
    {
      condition: 'a style of text in another family than the rest of its kind',
      fileNames: [
        'base.fixtures.tokens.json',
        'radius.fixtures.tokens.json',
        'mixed-family.fixtures.tokens.json',
      ],
      tokenName: 'font-code-xs',
    },
    {
      condition: 'a style of text with no kind',
      fileNames: [
        'base.fixtures.tokens.json',
        'radius.fixtures.tokens.json',
        'kindless-style.fixtures.tokens.json',
      ],
      tokenName: 'body',
    },
    {
      condition: "no primitive of the pixels a radius of Tailwind's stands on",
      fileNames: [
        'base.fixtures.tokens.json',
      ],
      tokenName: 'radius-4',
    },
  ])('should refuse the tokens when they hold $condition', async ({ fileNames, tokenName }) => {
    // Act
    const refusal = await refusalOf(outputsOf(fileNames));

    // Assert
    expect(refusal).toStrictEqual({
      code: 'malformed-token',
      tokenName,
    });
  });
});
