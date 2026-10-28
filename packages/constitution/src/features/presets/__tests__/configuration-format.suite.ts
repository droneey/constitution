import { describe, expect, it } from 'bun:test';

import { RepositoryRelativePath } from '#/kernel/value-objects';

import type { ConfigurationFormat } from '../domain/contracts';
import type { Setting } from '../domain/entities';

interface ConfigurationFormatSuiteInput {
  readonly format: ConfigurationFormat;
  readonly name: string;
}

const NO_MARKS = {
  blocks: [],
  marks: [],
} as const;

const runConfigurationFormatSuite = (input: ConfigurationFormatSuiteInput): void => {
  const { format } = input;

  const readOf = (path: string, text: string): Setting | undefined =>
    format.read({
      filePath: RepositoryRelativePath.create(path),
      text,
    });

  const writeOf = (row: { path: string; settings: Setting; text: string }): string =>
    format.write({
      filePath: RepositoryRelativePath.create(row.path),
      marks: NO_MARKS,
      settings: row.settings,
      sorted: [],
      text: row.text,
    });

  describe(`${input.name}: the ConfigurationFormat contract`, () => {
    it('should read the settings a JSON text holds', () => {
      // Act
      const read = readOf('biome.json', '{ "files": ["src"], "line": { "width": 100 } }\n');

      // Assert
      expect(read).toStrictEqual({
        files: [
          'src',
        ],
        line: {
          width: 100,
        },
      });
    });

    it.each([
      {
        condition: 'its text does not parse',
        path: 'biome.json',
        text: '{ "files": ',
      },
      {
        condition: "no format is the file's",
        path: 'src/main.py',
        text: 'print()\n',
      },
    ])('should read no settings when $condition', ({ path, text }) => {
      // Act
      const read = readOf(path, text);

      // Assert
      expect(read).toBeUndefined();
    });

    it.each([
      {
        condition: 'a JSON file is new',
        path: 'biome.json',
        settings: {
          files: [
            'src',
          ],
        },
        text: '',
      },
      {
        condition: 'a JSON file held other settings',
        path: 'biome.json',
        settings: {
          added: true,
          kept: 2,
        },
        text: '{\n  "kept": 1,\n  "gone": "x"\n}\n',
      },
      {
        condition: 'a file of lines is new',
        path: '.gitignore',
        settings: [
          'dist/',
        ],
        text: '',
      },
      {
        condition: 'a file of lines gains a line',
        path: '.gitignore',
        settings: [
          'dist/',
          'node_modules/',
        ],
        text: 'dist/\n',
      },
    ])('should write a text that reads back as the settings when $condition', (row) => {
      // Arrange
      const written = writeOf(row);

      // Act
      const read = readOf(row.path, written);

      // Assert
      expect(read).toStrictEqual(row.settings);
    });

    it.each([
      {
        condition: 'a JSON file',
        path: 'biome.json',
        settings: {
          files: [
            'src',
          ],
        },
        text: '{\n  "files": [\n    "src"\n  ]\n}\n',
      },
      {
        condition: 'a file of lines',
        path: '.gitignore',
        settings: [
          'dist/',
          'node_modules/',
        ],
        text: 'dist/\nnode_modules/\n',
      },
    ])(
      'should leave the text as it is when it holds the settings already, as $condition',
      (row) => {
        // Act
        const written = writeOf(row);

        // Assert
        expect(written).toBe(row.text);
      },
    );

    it.each([
      {
        canSortKeys: true,
        path: 'biome.json',
      },
      {
        canSortKeys: false,
        path: 'src/main.py',
      },
    ])('should tell whether $path keeps sorted keys', ({ canSortKeys, path }) => {
      // Act
      const sortable = format.canSortKeys({
        writtenPath: path,
      });

      // Assert
      expect(sortable).toBe(canSortKeys);
    });

    it('should leave the text of a file of no format as it is', () => {
      // Act
      const written = writeOf({
        path: 'src/main.py',
        settings: {
          a: 1,
        },
        text: 'print()\n',
      });

      // Assert
      expect(written).toBe('print()\n');
    });
  });
};

export { runConfigurationFormatSuite };
