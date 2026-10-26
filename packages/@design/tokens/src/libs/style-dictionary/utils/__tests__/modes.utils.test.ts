import { describe, expect, it } from 'bun:test';

import { configsOf } from '../modes.utils';
import { echoConfigOf, themeModes } from './modes.fixtures';

describe('configsOf', () => {
  it("should give each mode the platform's configuration of its name and default, reading the files every mode takes and its own in place of the platform's", () => {
    // Arrange
    const modes = themeModes;

    // Act
    const configs = configsOf(echoConfigOf, modes);

    // Assert
    expect(configs).toStrictEqual([
      {
        include: [
          '/tokens/color.tokens.json',
          '/tokens/size.tokens.json',
        ],
        source: [
          '/tokens/theme/light.tokens.json',
        ],
        platforms: {
          css: {
            options: {
              mode: {
                name: 'light',
                isDefault: true,
              },
            },
          },
        },
      },
      {
        include: [
          '/tokens/color.tokens.json',
          '/tokens/size.tokens.json',
        ],
        source: [
          '/tokens/theme/dark.tokens.json',
        ],
        platforms: {
          css: {
            options: {
              mode: {
                name: 'dark',
                isDefault: false,
              },
            },
          },
        },
      },
    ]);
  });
});
