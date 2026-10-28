import { describe, expect, it } from 'bun:test';

import { syncpackIssues } from './syncpack-preset.fixtures';

const NESTED = 'nested/package.json';

const manifestOf = (fields: Readonly<Record<string, unknown>>): string =>
  `${JSON.stringify(
    {
      name: 'unit',
      version: '1.0.0',
      ...fields,
    },
    null,
    2,
  )}\n`;

describe("the configuration syncpack's presets write", () => {
  it('should load in syncpack with no key or policy it does not know when a unit follows every block syncpack is configured for', async () => {
    // Act
    const lint = await syncpackIssues({
      args: [
        'lint',
      ],
      files: {
        'package.json': manifestOf({}),
      },
    });

    // Assert
    expect(lint).toStrictEqual({
      issues: [],
      status: 0,
    });
  });

  // Why: syncpack takes a range it does not know, and a field to sort it never finds, without a
  // word, so each the presets set has a manifest it must judge otherwise than syncpack does by
  // default.
  it.each([
    {
      condition: 'a tool takes a caret range, where the tools are pinned exactly',
      fields: {
        devDependencies: {
          tool: '^1.0.0',
        },
      },
    },
    {
      condition:
        "a dependency of the program is pinned exactly, where the program's take caret ranges",
      fields: {
        dependencies: {
          library: '1.0.0',
        },
      },
    },
  ])('should report a range that breaks its group when $condition', async ({ fields }) => {
    // Act
    const lint = await syncpackIssues({
      args: [
        'lint',
      ],
      files: {
        'package.json': manifestOf(fields),
      },
    });

    // Assert
    expect(lint).toStrictEqual({
      issues: [
        'SemverRangeMismatch',
      ],
      status: 1,
    });
  });

  it.each([
    {
      condition: 'its scripts are out of order, which the presets leave to apply',
      issues: [],
      manifest:
        '{\n  "name": "nested",\n  "version": "1.0.0",\n  "scripts": {\n    "zeta": "true",\n    "alpha": "true"\n  }\n}\n',
      status: 0,
    },
    {
      condition: 'its description precedes its version, which the presets set first',
      issues: [
        'PackagePropertiesAreNotSorted',
      ],
      manifest: '{\n  "name": "nested",\n  "description": "A unit.",\n  "version": "1.0.0"\n}\n',
      status: 1,
    },
  ])(
    'should report $issues in the format check when $condition',
    async ({ issues, manifest, status }) => {
      // Act
      const format = await syncpackIssues({
        args: [
          'format',
          '--check',
          '--source',
          NESTED,
        ],
        files: {
          [NESTED]: manifest,
        },
      });

      // Assert
      expect(format).toStrictEqual({
        issues,
        status,
      });
    },
  );
});
