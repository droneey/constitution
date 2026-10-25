import { describe, expect, it } from 'bun:test';

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
});
