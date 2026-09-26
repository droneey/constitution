import { describe, expect, it } from 'bun:test';

import {
  checkInputOf,
  rule,
  textOf,
} from '#/features/constitution/__tests__/fixtures';
import { validFiles } from '#/features/constitution/__tests__/valid-files';

import { adviseConstitution } from '../advise-constitution.use-case';

describe('adviseConstitution', () => {
  it('should give the role coverage, then the similar rules, when both apply', () => {
    // Arrange
    const files = validFiles();
    const ui = 'blocks/domains/ui/ui.md';
    const i18n = 'blocks/domains/i18n/i18n.md';
    files[ui] = `${textOf({
      files,
      path: ui,
    })}\n${rule({
      check: 'tool — architecture',
      slug: 'labels-from-catalogs',
      statement: 'Every visible label comes from a message catalog.',
    })}`;
    files[i18n] = `${textOf({
      files,
      path: i18n,
    })}\n${rule({
      slug: 'labels-come-from-catalogs',
      statement: 'Every visible label comes from the message catalog.',
    })}`;
    const input = checkInputOf(files);

    // Act
    const advice = adviseConstitution(input);

    // Assert
    expect(advice).toStrictEqual([
      'role coverage: typescript has no tool for architecture',
      'similar rules: labels-come-from-catalogs (i18n) and labels-from-catalogs (ui)',
    ]);
  });
});
