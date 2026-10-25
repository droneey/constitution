import { describe, expect, it } from 'bun:test';

import type { Setting } from '../../../domain/contracts';
import { createConfigurationParser } from '../configuration-parser.adapter';

describe('createConfigurationParser', () => {
  it.each<{
    condition: string;
    path: string;
    settings: Setting;
    text: string;
  }>([
    {
      condition: 'a JSON file holds comments and a trailing comma',
      path: 'biome.json',
      settings: {
        files: {
          includes: [
            '!!apps',
          ],
        },
      },
      text: '{\n  // the members\n  "files": { "includes": ["!!apps",] }\n}\n',
    },
    {
      condition: 'a JSONC file holds a list',
      path: 'presets/common/biome/foundation/self.jsonc',
      settings: [
        1,
        true,
      ],
      text: '[1, true]',
    },
    {
      condition: 'a TOML file holds a table and a date',
      path: '.rumdl.toml',
      settings: {
        global: {
          exclude: [
            'apps/**',
          ],
        },
        since: '1979-05-27T07:32:00Z',
      },
      text: 'since = 1979-05-27T07:32:00Z\n\n[global]\nexclude = ["apps/**"]\n',
    },
    {
      condition: 'a YAML file holds an anchor and its alias',
      path: 'lefthook.yaml',
      settings: {
        first: 'lint',
        second: 'lint',
      },
      text: 'first: &run lint\nsecond: *run\n',
    },
    {
      condition: 'a YML file holds a text of lines',
      path: '.yamllint.yml',
      settings: {
        ignore: '/apps/**\n/packages/**\n',
      },
      text: 'ignore: |\n  /apps/**\n  /packages/**\n',
    },
    {
      condition: 'a file holds nulls in a table and in a list',
      path: 'lefthook.yaml',
      settings: {
        jobs: [
          'lint',
        ],
      },
      text: 'jobs:\n  - ~\n  - lint\nexclude: ~\n',
    },
  ])('should read the settings when $condition', ({ path, settings, text }) => {
    // Arrange
    const parser = createConfigurationParser();

    // Act
    const read = parser.parse({
      path,
      text,
    });

    // Assert
    expect(read).toStrictEqual(settings);
  });

  it.each([
    {
      condition: 'a JSON file does not parse',
      path: 'biome.json',
      text: '{ "files": ',
    },
    {
      condition: 'a TOML file does not parse',
      path: '.rumdl.toml',
      text: 'exclude = [',
    },
    {
      condition: 'a YAML file does not parse',
      path: 'lefthook.yaml',
      text: 'jobs: [lint',
    },
    {
      condition: 'a YAML file holds nothing',
      path: 'lefthook.yaml',
      text: '',
    },
    {
      condition: 'the format is none it reads',
      path: '.shellcheckrc',
      text: 'disable=SC2086\n',
    },
    {
      condition: 'the path names no extension',
      path: 'Dockerfile',
      text: 'FROM scratch\n',
    },
  ])('should read no settings when $condition', ({ path, text }) => {
    // Arrange
    const parser = createConfigurationParser();

    // Act
    const read = parser.parse({
      path,
      text,
    });

    // Assert
    expect(read).toBeUndefined();
  });
});
