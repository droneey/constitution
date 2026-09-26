import { describe, expect, it } from 'bun:test';

import { createJsonManifestParser } from '../json-manifest-parser';

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

  it('should report the root issue with an empty field when the manifest is not an object', () => {
    // Arrange
    const parser = createJsonManifestParser();

    // Act
    const read = parser.plugin('[]');

    // Assert
    expect(read).toStrictEqual({
      issues: [
        {
          field: '',
          message: 'Invalid input: expected object, received array',
        },
      ],
      status: 'mismatched',
    });
  });

  it('should report every issue when the name and the skills are both wrong', () => {
    // Arrange
    const parser = createJsonManifestParser();

    // Act
    const read = parser.plugin('{"name":"Not A Slug","skills":"skills"}');

    // Assert
    expect(read).toStrictEqual({
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
      status: 'mismatched',
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

  it('should read every plugin with its source when the marketplace is valid', () => {
    // Arrange
    const parser = createJsonManifestParser();
    const json =
      '{"name":"droneey","plugins":[{"name":"constitution","source":"./"}]}';

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
});
