import { describe, expect, it } from 'bun:test';

import { swcRefusalsOf } from './nestjs-preset.fixtures';
import { widestAppliedUnit } from './preset-load.fixtures';

const SOURCE = 'src/order.ts';

describe("the configuration NestJS's presets write", () => {
  it('should load in swc with no field it does not know when a unit follows every block NestJS is configured for', () => {
    // Arrange
    const folder = widestAppliedUnit('nestjs', {
      files: {
        [SOURCE]: "export const ORDER_KIND = 'order';\n",
      },
    });

    // Act
    const refusals = swcRefusalsOf({
      file: SOURCE,
      folder,
    });

    // Assert
    expect(refusals).toStrictEqual([]);
  });
});
