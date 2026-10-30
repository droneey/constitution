import { describe, expect, it } from 'bun:test';

import { BlockId, Glob } from '#/kernel/value-objects';

import type { Files } from '../../../../../../__tests__/constitution.fixtures';
import { blockFiles } from '../../../../../../__tests__/constitution.fixtures';
import { validFiles } from '../../../../../../__tests__/valid-files.fixtures';
import { checkInputOf } from '../../__tests__/check.fixtures';
import {
  ConfigurationLanguagesCode,
  configurationLanguagesCheck,
} from '../configuration-languages';

const TOOL_PATH = 'blocks/implementations/tool/tool.md';

const filesWith = (tool: {
  extends?: string;
  governs: readonly string[];
  requires?: readonly string[];
}): Files => ({
  ...validFiles(),
  ...blockFiles({
    dir: 'blocks/contexts/languages/json',
    governs: [
      '**/*.json',
      '**/.jsonrc',
    ],
    id: 'json',
  }),
  ...blockFiles({
    abstract: true,
    dir: 'blocks/implementations/_tool',
    governs: [
      '**/*.json',
    ],
    id: '_tool',
    requires: [
      'json',
    ],
  }),
  ...blockFiles({
    ...tool,
    dir: 'blocks/implementations/tool',
    id: 'tool',
  }),
});

describe('configurationLanguagesCheck', () => {
  it.each([
    'tool.json',
    '**/*.json',
    '**/.jsonrc',
  ])('should report a json file %p that the tool governs without requiring json', (glob) => {
    // Arrange
    const input = checkInputOf(
      filesWith({
        governs: [
          glob,
        ],
      }),
    );

    // Act
    const findings = configurationLanguagesCheck(input);

    // Assert
    expect(findings).toStrictEqual([
      {
        code: ConfigurationLanguagesCode.NotRequired,
        details: {
          glob: Glob.create(glob),
          language: BlockId.create('json'),
        },
        path: TOOL_PATH,
      },
    ]);
  });

  it.each([
    {
      condition: 'requires json',
      tool: {
        governs: [
          'tool.json',
        ],
        requires: [
          'json',
        ],
      },
    },
    {
      condition: 'reaches json through a block it requires',
      tool: {
        governs: [
          'tool.json',
        ],
        requires: [
          '_tool',
        ],
      },
    },
    {
      condition: 'reaches json through the block it extends',
      tool: {
        extends: '_tool',
        governs: [
          'tool.json',
        ],
      },
    },
    {
      condition: 'governs a file of a wildcard extension',
      tool: {
        governs: [
          'tool.config.*',
        ],
      },
    },
    {
      condition: 'governs a folder',
      tool: {
        governs: [
          'tool/**',
        ],
      },
    },
  ])('should accept a tool that $condition', ({ tool }) => {
    // Arrange
    const input = checkInputOf(filesWith(tool));

    // Act
    const findings = configurationLanguagesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });

  it('should accept a language that governs its own files', () => {
    // Arrange
    const input = checkInputOf(
      filesWith({
        governs: [],
      }),
    );

    // Act
    const findings = configurationLanguagesCheck(input);

    // Assert
    expect(findings).toStrictEqual([]);
  });
});
