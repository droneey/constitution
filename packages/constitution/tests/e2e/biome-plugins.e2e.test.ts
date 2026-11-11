import { beforeAll, describe, expect, it } from 'bun:test';

import type { PluginRow } from './biome-plugins.fixtures';
import { createPluginBatch, pluginsWithNoRow } from './biome-plugins.fixtures';

const { allowedCases, lintRegistered, pluginsOf, reportedCases } = createPluginBatch();

const LINT_TIMEOUT = 120_000;

const pluginRows: readonly PluginRow[] = [
  {
    language: 'typescript',
    slug: 'statements-grouped-by-blank-lines',
    unit: {
      axes: [],
      blocks: [],
    },
    reported: [
      {
        condition: 'a branch follows a declaration with no blank line',
        files: {
          'src/order.ts':
            'export const total = (price: number): number => {\n  const tax = price * 2;\n  if (tax > 1) {\n    return tax;\n  }\n\n  return price;\n};\n',
        },
      },
    ],
    allowed: [
      {
        condition: 'a blank line sets the branch apart from the declaration',
        files: {
          'src/order.ts':
            'export const total = (price: number): number => {\n  const tax = price * 2;\n\n  if (tax > 1) {\n    return tax;\n  }\n\n  return price;\n};\n',
        },
      },
    ],
  },
];

beforeAll(lintRegistered, LINT_TIMEOUT);

describe("the GritQL plugins of Biome's presets", () => {
  it('should hold a row for each plugin file when the presets give a plugin', () => {
    // Act
    const unnamed = pluginsWithNoRow(pluginRows);

    // Assert
    expect(unnamed).toStrictEqual([]);
  });

  it.each(reportedCases(pluginRows))('should report $slug when $condition', ({ project, slug }) => {
    // Act
    const plugins = pluginsOf(project);

    // Assert
    expect(plugins).toContain(slug);
  });

  it.each(allowedCases(pluginRows))(
    'should report no $slug finding when $condition',
    ({ project, slug }) => {
      // Act
      const plugins = pluginsOf(project);

      // Assert
      expect(plugins).not.toContain(slug);
    },
  );
});
