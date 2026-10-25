import { describe, expect, it } from 'bun:test';

import { analyseYaml } from './yamllint-preset.fixtures';

describe('the yamllint preset', () => {
  it('should accept a file in block style with plain booleans and unique keys', () => {
    // Arrange
    const yaml = [
      'name: constitution',
      'private: true',
      'mode: "0755"',
      'base: &base',
      '  retries: 2',
      'job:',
      '  <<: *base',
      'list:',
      '  - first',
      '',
    ].join('\n');

    // Act
    const analysis = analyseYaml(yaml);

    // Assert
    expect(analysis).toStrictEqual({
      exitCode: 0,
      rules: [],
    });
  });

  it('should report an unused anchor, an implicit octal, a truthy word, a flow collection and a repeated key', () => {
    // Arrange
    const yaml = [
      'base: &unused 1',
      'mode: 0755',
      'flag: yes',
      'list: [a]',
      'map: {a: 1}',
      'key: 1',
      'key: 2',
      '',
    ].join('\n');

    // Act
    const analysis = analyseYaml(yaml);

    // Assert
    expect(analysis).toStrictEqual({
      exitCode: 1,
      rules: [
        'anchors',
        'braces',
        'brackets',
        'key-duplicates',
        'octal-values',
        'truthy',
      ],
    });
  });
});
