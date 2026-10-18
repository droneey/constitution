import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it } from 'bun:test';

import { enterRepository } from '../repository/__tests__/repository.fixtures';
import { markdownSchema } from '../schema.adapter';

const repository = {
  leave: (): void => undefined,
  root: '',
};

beforeEach(() => {
  const entered = enterRepository({
    files: {
      'bare.md': 'Only a body.\n',
      'names.md': '# Names\n\n> Governs **names** and `code`.\n> And more.\n\nBody.\n',
    },
  });

  repository.leave = entered.leave;
  repository.root = entered.root;
});

afterEach(() => {
  repository.leave();
});

describe('markdownSchema', () => {
  it('should default the title, summary and icon from the file when the page gives none', () => {
    // Arrange
    const schema = markdownSchema(() => 'Tag')({
      path: join(repository.root, 'names.md'),
    });

    // Act
    const page = schema.parse({});

    // Assert
    expect(page).toStrictEqual({
      description: 'Governs names and code.',
      icon: 'Tag',
      title: 'Names',
    });
  });

  it('should default the title to the path when the file has no heading and no quote', () => {
    // Arrange
    const path = join(repository.root, 'bare.md');
    const schema = markdownSchema(() => undefined)({
      path,
    });

    // Act
    const page: Readonly<Record<string, unknown>> = schema.parse({});

    // Assert
    expect(page).toStrictEqual({
      description: '',
      title: path,
    });
  });

  it('should keep what the page gives when it gives its own', () => {
    // Arrange
    const schema = markdownSchema(() => 'Tag')({
      path: join(repository.root, 'names.md'),
    });

    // Act
    const page = schema.parse({
      description: 'Given.',
      icon: 'Other',
      title: 'Given',
    });

    // Assert
    expect(page).toStrictEqual({
      description: 'Given.',
      icon: 'Other',
      title: 'Given',
    });
  });

  it('should ask for the icon by the path of the file', () => {
    // Arrange
    const path = join(repository.root, 'names.md');
    const schema = markdownSchema((asked) => asked)({
      path,
    });

    // Act
    const page = schema.parse({});

    // Assert
    expect(page).toStrictEqual({
      description: 'Governs names and code.',
      icon: path,
      title: 'Names',
    });
  });
});
