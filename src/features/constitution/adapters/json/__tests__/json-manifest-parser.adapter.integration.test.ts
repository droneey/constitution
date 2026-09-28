import { describe, expect, it } from 'bun:test';

import type { FieldIssue } from '../../../domain/entities';
import { createJsonManifestParser } from '../json-manifest-parser.adapter';

interface MismatchCase {
  issues: readonly FieldIssue[];
  json: string;
  manifest: 'hooks' | 'marketplace' | 'plugin';
}

describe('createJsonManifestParser', () => {
  it.each([
    {
      expected: [],
      json: '{"name":"constitution"}',
      name: 'no skills key',
    },
    {
      expected: [
        './skills/',
      ],
      json: '{"name":"constitution","skills":"./skills/"}',
      name: 'one skills directory',
    },
    {
      expected: [
        './a/',
        './b/',
      ],
      json: '{"name":"constitution","skills":["./a/","./b/"]}',
      name: 'a list of skills directories',
    },
  ])(
    'should read the plugin name and skills when the plugin manifest has $name',
    ({ expected, json }) => {
      // Arrange
      const parser = createJsonManifestParser();

      // Act
      const read = parser.plugin(json);

      // Assert
      expect(read).toStrictEqual({
        status: 'parsed',
        value: {
          name: 'constitution',
          skills: expected,
        },
      });
    },
  );

  it('should read every plugin with its source when the marketplace is valid', () => {
    // Arrange
    const parser = createJsonManifestParser();
    const json =
      '{"name":"droneey","plugins":[{"name":"constitution","source":"./"},{"name":"devkit","source":"./devkit"}]}';

    // Act
    const read = parser.marketplace(json);

    // Assert
    expect(read).toStrictEqual({
      status: 'parsed',
      value: {
        plugins: [
          {
            name: 'constitution',
            source: './',
          },
          {
            name: 'devkit',
            source: './devkit',
          },
        ],
      },
    });
  });

  it('should collect every command and skip a hook without one when the hooks manifest is valid', () => {
    // Arrange
    const parser = createJsonManifestParser();
    const json =
      '{"hooks":{"SessionStart":[{"hooks":[{"type":"command","command":"sh a.sh"},{}]}],"Stop":[{"hooks":[{"command":"sh b.sh"}]}]}}';

    // Act
    const read = parser.hooks(json);

    // Assert
    expect(read).toStrictEqual({
      status: 'parsed',
      value: {
        commands: [
          'sh a.sh',
          'sh b.sh',
        ],
      },
    });
  });

  it('should report the first line of the parse error when the text is not JSON', () => {
    // Arrange
    const parser = createJsonManifestParser();

    // Act
    const read = parser.marketplace('[');

    // Assert
    expect(read).toStrictEqual({
      reason: 'JSON Parse error: Unexpected EOF',
      status: 'not-json',
    });
  });

  it.each<MismatchCase>([
    {
      issues: [
        {
          field: 'name',
          message: 'Invalid string: must match pattern /^[a-z0-9-]+$/',
        },
        {
          field: 'skills',
          message: 'Invalid string: must match pattern /^\\.\\/.*\\/$/',
        },
      ],
      json: '{"name":"Not A Slug","skills":"skills"}',
      manifest: 'plugin',
    },
    {
      issues: [
        {
          field: 'plugins.0.source',
          message: 'Invalid input: expected string, received undefined',
        },
      ],
      json: '{"name":"droneey","plugins":[{"name":"constitution"}]}',
      manifest: 'marketplace',
    },
    {
      issues: [
        {
          field: 'hooks.Stop.0.hooks.0.command',
          message: 'Invalid input: expected string, received number',
        },
      ],
      json: '{"hooks":{"Stop":[{"hooks":[{"type":"command","command":42}]}]}}',
      manifest: 'hooks',
    },
  ])(
    'should report every issue at its dotted field when the $manifest manifest does not match its schema',
    ({ issues, json, manifest }) => {
      // Arrange
      const parser = createJsonManifestParser();

      // Act
      const read = parser[manifest](json);

      // Assert
      expect(read).toStrictEqual({
        issues,
        status: 'mismatched',
      });
    },
  );
});
