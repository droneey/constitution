import { describe, expect, it } from 'bun:test';

import {
  codesOfWholeTree,
  repeatedPluginPaths,
  unwrittenPresetWords,
  warnedRules,
  widestStatus,
} from './biome-preset.fixtures';

describe("the configuration Biome's presets write", () => {
  it('should load in Biome with no key, rule or plugin it does not know when a unit follows every block Biome is configured for', async () => {
    // Act
    const status = await widestStatus();

    // Assert
    expect(status).toBe(0);
  });

  it('should declare each plugin in one entry when a unit follows every block Biome is configured for', () => {
    // Act
    const repeated = repeatedPluginPaths();

    // Assert
    expect(repeated).toStrictEqual([]);
  });

  it('should name only folders, files and suffixes the blocks write when the preset scopes its rules', () => {
    // Act
    const unwritten = unwrittenPresetWords();

    // Assert
    expect(unwritten).toStrictEqual([]);
  });

  it('should hold no rule at warn when a unit follows every block Biome is configured for', () => {
    // Act
    const warned = warnedRules();

    // Assert
    expect(warned).toStrictEqual([]);
  });

  it('should leave .droneey/constitution alone when a project lints its whole tree', async () => {
    // Act
    const codes = await codesOfWholeTree({
      '.droneey/constitution/probe.ts': 'export const data = null;\n',
      'src/order.ts': "export const ORDER_KIND = 'order';\n",
    });

    // Assert
    expect(codes).toStrictEqual([]);
  });
});
