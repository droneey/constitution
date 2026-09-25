import { describe, expect, it } from 'bun:test';

import { readFrontMatter } from '../read-front-matter.utils';

const PATH = 'blocks/domains/ui/ui.md';

const complete = [
  '---',
  'id: ui',
  'kind: domain',
  'summary: Screens, components and tokens.',
  'chapters: []',
  'requires: []',
  'extends: null',
  'abstract: false',
  'checks: []',
  'owns: []',
  'governs: ["**/ui/**"]',
  'status: stable',
  '---',
  '',
  '# UI',
  '',
].join('\n');

describe('readFrontMatter', () => {
  it('should read a complete front matter and return the body', () => {
    // Act
    const result = readFrontMatter({
      path: PATH,
      text: complete,
    });

    // Assert
    expect(result.findings).toStrictEqual([]);
    expect(result.frontMatter?.governs).toStrictEqual([
      '**/ui/**',
    ]);
    expect(result.body).toBe('\n# UI\n');
  });

  it('should report a missing front matter', () => {
    // Act
    const result = readFrontMatter({
      path: PATH,
      text: '# UI\n',
    });

    // Assert
    expect(result.findings).toStrictEqual([
      {
        message: 'has no front matter; a main file opens with it',
        path: PATH,
      },
    ]);
  });

  it('should report a missing field and an unknown one by name', () => {
    // Arrange
    const text = complete
      .replace('status: stable\n', '')
      .replace('owns: []\n', 'owns: []\nbrands: []\n');

    // Act
    const result = readFrontMatter({
      path: PATH,
      text,
    });

    // Assert
    expect(result.findings).toStrictEqual([
      {
        message:
          'front matter lacks "status"; every block declares every field',
        path: PATH,
      },
      {
        message: 'front matter has "brands", which is not a field',
        path: PATH,
      },
    ]);
  });

  it('should report fields out of order', () => {
    // Arrange
    const text = complete.replace(
      'id: ui\nkind: domain\n',
      'kind: domain\nid: ui\n',
    );

    // Act
    const result = readFrontMatter({
      path: PATH,
      text,
    });

    // Assert
    expect(result.findings).toStrictEqual([
      {
        message:
          'front matter lists its fields out of order; the order is id, kind, summary, chapters, requires, extends, abstract, checks, owns, governs, status',
        path: PATH,
      },
    ]);
  });

  it('should report invalid YAML, such as an unquoted colon', () => {
    // Arrange
    const text = complete.replace(
      'summary: Screens, components and tokens.',
      'summary: Screens: components and tokens.',
    );

    // Act
    const result = readFrontMatter({
      path: PATH,
      text,
    });

    // Assert
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.message).toStartWith(
      'front matter is not valid YAML:',
    );
  });

  it('should report a front matter that is not a mapping', () => {
    // Act
    const result = readFrontMatter({
      path: PATH,
      text: '---\n- id\n---\n# UI\n',
    });

    // Assert
    expect(result.findings).toStrictEqual([
      {
        message: 'front matter is not a mapping of fields',
        path: PATH,
      },
    ]);
  });

  it('should report a value of the wrong shape with its field', () => {
    // Arrange
    const text = complete.replace('checks: []', 'checks: [spelling]');

    // Act
    const result = readFrontMatter({
      path: PATH,
      text,
    });

    // Assert
    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.message).toStartWith('front matter: checks.0:');
  });
});
