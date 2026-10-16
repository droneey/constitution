import { describe, expect, it } from 'bun:test';

import type { FieldIssue } from '../../../domain/entities';
import { createJsonManifestParser } from '../json-manifest-parser.adapter';

enum Manifest {
  Hooks = 'hooks',
  Marketplace = 'marketplace',
  Plugin = 'plugin',
}

interface MismatchCase {
  issues: readonly FieldIssue[];
  json: string;
  manifest: Manifest;
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
          repository: undefined,
          skills: expected,
        },
      });
    },
  );

  it('should read the repository when the plugin manifest names one', () => {
    // Arrange
    const parser = createJsonManifestParser();
    const json = '{"name":"constitution","repository":"https://github.com/droneey/constitution"}';

    // Act
    const read = parser.plugin(json);

    // Assert
    expect(read).toStrictEqual({
      status: 'parsed',
      value: {
        name: 'constitution',
        repository: 'https://github.com/droneey/constitution',
        skills: [],
      },
    });
  });

  it('should read the repository and ref of a GitHub source and neither of any other source when the marketplace is valid', () => {
    // Arrange
    const parser = createJsonManifestParser();
    const json =
      '{"name":"droneey","plugins":[{"name":"constitution","source":{"source":"github","repo":"droneey/constitution","ref":"v1.0.0"}},{"name":"local","source":"./local"},{"name":"remote","source":{"source":"url","url":"https://example.com/remote.git","ref":"v2.0.0"}}]}';

    // Act
    const read = parser.marketplace(json);

    // Assert
    expect(read).toStrictEqual({
      status: 'parsed',
      value: {
        plugins: [
          {
            name: 'constitution',
            ref: 'v1.0.0',
            repo: 'droneey/constitution',
          },
          {
            name: 'local',
            ref: undefined,
            repo: undefined,
          },
          {
            name: 'remote',
            ref: undefined,
            repo: undefined,
          },
        ],
      },
    });
  });

  it('should report the source when a plugin source object names no kind', () => {
    // Arrange
    const parser = createJsonManifestParser();
    const json =
      '{"name":"droneey","plugins":[{"name":"constitution","source":{"repo":"droneey/constitution"}}]}';

    // Act
    const read = parser.marketplace(json);

    // Assert
    expect(read).toStrictEqual({
      issues: [
        {
          field: 'plugins.0.source',
          message: 'Invalid input',
        },
      ],
      status: 'mismatched',
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
      manifest: Manifest.Plugin,
    },
    {
      issues: [
        {
          field: 'plugins.0.source',
          message: 'Invalid input',
        },
      ],
      json: '{"name":"droneey","plugins":[{"name":"constitution"}]}',
      manifest: Manifest.Marketplace,
    },
    {
      issues: [
        {
          field: 'hooks.Stop.0.hooks.0.command',
          message: 'Invalid input: expected string, received number',
        },
      ],
      json: '{"hooks":{"Stop":[{"hooks":[{"type":"command","command":42}]}]}}',
      manifest: Manifest.Hooks,
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
