import { describe, expect, it } from 'bun:test';

import {
  loadFiles,
  validFiles,
} from '#/features/constitution/__tests__/fixtures';

import { byIdOf, closureOf, mayReferTo } from '../closure.utils';

describe('closureOf', () => {
  it('should follow requires and extends transitively', () => {
    // Arrange
    const byId = byIdOf(loadFiles(validFiles()).blocks);

    // Act
    const closure = closureOf({
      blockId: 'react-dom',
      byId,
    });

    // Assert
    expect(
      [
        ...closure,
      ].toSorted(),
    ).toStrictEqual([
      '_react',
      'browser',
      'ui',
      'untrusted-client',
    ]);
  });

  it('should be empty for an unknown block', () => {
    // Act
    const closure = closureOf({
      blockId: 'nothing',
      byId: new Map(),
    });

    // Assert
    expect(closure.size).toBe(0);
  });
});

describe('mayReferTo', () => {
  it('should allow a layer above, the closure and the with/ block, and nothing else', () => {
    // Arrange
    const byId = byIdOf(loadFiles(validFiles()).blocks);
    const ui = byId.get('ui');
    const [main, seam] = ui?.files ?? [];

    // Act
    const answers =
      ui === undefined || main === undefined || seam === undefined
        ? []
        : [
            mayReferTo({
              byId,
              file: main,
              from: ui,
              to: 'core',
            }),
            mayReferTo({
              byId,
              file: main,
              from: ui,
              to: 'remote-data',
            }),
            mayReferTo({
              byId,
              file: seam,
              from: ui,
              to: 'remote-data',
            }),
            mayReferTo({
              byId,
              file: main,
              from: ui,
              to: 'ui',
            }),
            mayReferTo({
              byId,
              file: main,
              from: ui,
              to: 'nothing',
            }),
          ];

    // Assert
    expect(answers).toStrictEqual([
      true,
      false,
      true,
      false,
      false,
    ]);
  });

  it('should allow a peer implementation in the closure', () => {
    // Arrange
    const byId = byIdOf(loadFiles(validFiles()).blocks);
    const reactDom = byId.get('react-dom');
    const [main] = reactDom?.files ?? [];

    // Act
    const answer =
      reactDom !== undefined &&
      main !== undefined &&
      mayReferTo({
        byId,
        file: main,
        from: reactDom,
        to: '_react',
      });

    // Assert
    expect(answer).toBe(true);
  });
});
