import { describe, expect, it } from 'bun:test';

import { MalformedTokenError } from '../../errors';
import { HEADER, outputsOf } from './configs.fixtures';

describe('configsOf', () => {
  it("should write each mode's module: the accent's roles as steps, the opaque roles, the accent's scale and the motion and spacing in hex and numbers", async () => {
    // Arrange
    const build = outputsOf();

    // Act
    const modules = await build;

    // Assert
    expect(modules).toStrictEqual([
      {
        'theme/light.gen.ts': `${HEADER}const tokens = {
  "accent": {
    "accent.solid": "600"
  },
  "brand": {
    "600": "#a239be"
  },
  "colour": {
    "surface.base": "#ffffff"
  },
  "duration": {
    "fast": 100
  },
  "spacing": {
    "sm": 16
  }
};

export { tokens };
`,
      },
      {
        'theme/dark.gen.ts': `${HEADER}const tokens = {
  "accent": {
    "accent.solid": "600"
  },
  "brand": {
    "600": "#a239be"
  },
  "colour": {
    "surface.base": "#131316"
  },
  "duration": {
    "fast": 100
  },
  "spacing": {
    "sm": 16
  }
};

export { tokens };
`,
      },
    ]);
  });

  it.each([
    {
      name: 'a measure written as a bare number',
      file: 'bare-measure.fixtures.tokens.json',
      token: 'duration-slow',
    },
    {
      name: 'a measure left empty',
      file: 'absent-measure.fixtures.tokens.json',
      token: 'duration-slow',
    },
    {
      name: 'a measure whose value is text',
      file: 'text-measure.fixtures.tokens.json',
      token: 'duration-slow',
    },
    {
      name: 'a colour written as text',
      file: 'hex-colour.fixtures.tokens.json',
      token: 'color-plain-0',
    },
  ])('should refuse $name', async ({ file, token }) => {
    // Arrange
    const malformed = [
      file,
    ];

    // Act
    const build = outputsOf(malformed);

    // Assert
    await expect(build).rejects.toThrow(new MalformedTokenError(token));
  });
});
