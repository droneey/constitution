import { describe, expect, it } from 'bun:test';

import { TemplatePath } from '../template-path.value-object';

describe('TemplatePath.parse', () => {
  it.each([
    {
      expected: {
        scope: 'typescript',
        tool: 'biome',
        writes: 'biome.json',
      },
      name: 'a template at the root of the folder it serves',
      path: 'templates/project/typescript/biome/biome.json',
    },
    {
      expected: {
        scope: 'common',
        tool: 'lefthook',
        writes: '.config/lefthook.yml',
      },
      name: 'a template in a folder below it',
      path: 'templates/project/common/lefthook/.config/lefthook.yml',
    },
    {
      expected: undefined,
      name: 'a file of a scope with no tool',
      path: 'templates/project/typescript/biome.json',
    },
    {
      expected: undefined,
      name: 'a file of an empty scope',
      path: 'templates/project//biome/biome.json',
    },
    {
      expected: undefined,
      name: 'a file outside the templates of a project',
      path: 'templates/block/block.md',
    },
    {
      expected: undefined,
      name: 'a file of a folder as long as the templates',
      path: 'documents/project/typescript/biome/biome.json',
    },
    {
      expected: undefined,
      name: 'a file outside the templates',
      path: 'presets/typescript/biome/foundation/core.jsonc',
    },
  ])('should read $name when the path is $path', ({ expected, path }) => {
    // Act
    // the template a caller reads: its fields, the brand being the compiler's alone
    const read: object | undefined = TemplatePath.parse(path);

    // Assert
    expect(read).toStrictEqual(expected);
  });
});

const biomeJson = {
  scope: 'typescript',
  tool: 'biome',
  writes: 'biome.json',
};

const templateOf = (path: string): TemplatePath => {
  const template = TemplatePath.parse(path);

  if (template === undefined) {
    throw new Error(`${path} is no template`);
  }

  return template;
};

describe('TemplatePath', () => {
  it.each([
    {
      candidate: biomeJson,
      condition: 'it names a template',
      isTemplate: true,
    },
    {
      candidate: {
        ...biomeJson,
        scope: 'type/script',
      },
      condition: 'its scope holds a "/"',
      isTemplate: false,
    },
    {
      candidate: {
        ...biomeJson,
        tool: '',
      },
      condition: 'its tool is empty',
      isTemplate: false,
    },
    {
      candidate: {
        ...biomeJson,
        writes: '',
      },
      condition: 'it writes no path',
      isTemplate: false,
    },
    {
      candidate: {
        ...biomeJson,
        writes: 7,
      },
      condition: 'its path is no text',
      isTemplate: false,
    },
  ])('should say $isTemplate when $condition', ({ candidate, isTemplate }) => {
    // Act
    const answer = TemplatePath.is(candidate);

    // Assert
    expect(answer).toBe(isTemplate);
  });

  it.each([
    {
      condition: 'they name one template',
      isEqual: true,
      other: 'templates/project/typescript/biome/biome.json',
    },
    {
      condition: 'their scopes differ',
      isEqual: false,
      other: 'templates/project/common/biome/biome.json',
    },
    {
      condition: 'their tools differ',
      isEqual: false,
      other: 'templates/project/typescript/knip/biome.json',
    },
    {
      condition: 'they write two paths',
      isEqual: false,
      other: 'templates/project/typescript/biome/biome.jsonc',
    },
  ])('should say $isEqual when $condition', ({ isEqual, other }) => {
    // Arrange
    const template = templateOf('templates/project/typescript/biome/biome.json');
    const another = templateOf(other);

    // Act
    const isSame = TemplatePath.equals(template, another);

    // Assert
    expect(isSame).toBe(isEqual);
  });
});
