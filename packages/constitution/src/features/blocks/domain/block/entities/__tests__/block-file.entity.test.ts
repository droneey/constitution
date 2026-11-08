import { describe, expect, it } from 'bun:test';

import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';

import { TreePath } from '../../../shared/value-objects';
import type { PlaceFinding } from '../block-file.entity';
import { BlockFile, PlaceCode } from '../block-file.entity';

describe('BlockFile.locate', () => {
  it('should report each file out of place and group the placed files by block folder when the tree mixes them', () => {
    // Arrange
    const listed = [
      'README.md',
      'blocks/notes.md',
      'blocks/domains/Bad_Name/x.md',
      'blocks/domains/Bad_Name/y.md',
      'blocks/domains/ui/notes.txt',
      'blocks/domains/ui/ui.md',
      'blocks/domains/ui/@foundation/screens.md',
      'blocks/domains/i18n/@foundation/plurals.md',
    ].map(TreePath.create);

    // Act
    const located = BlockFile.locate(listed);

    // Assert
    expect({
      findings: located.findings,
      groups: located.groups.map((group) => ({
        dir: group.folder.dir,
        paths: group.entries.map((entry) => String(entry.path)),
      })),
    }).toStrictEqual({
      findings: [
        {
          code: PlaceCode.OutsideBlockFolder,
          details: {},
          path: 'blocks/notes.md',
        },
        {
          code: ValueFailure.BlockId,
          details: {
            site: ValueSite.BlockFolder,
            written: 'Bad_Name',
          },
          path: 'blocks/domains/Bad_Name',
        },
        {
          code: PlaceCode.StrayBlockFile,
          details: {},
          path: 'blocks/domains/ui/notes.txt',
        },
      ],
      groups: [
        {
          dir: 'blocks/domains/ui',
          paths: [
            'blocks/domains/ui/ui.md',
            'blocks/domains/ui/@foundation/screens.md',
          ],
        },
        {
          dir: 'blocks/domains/i18n',
          paths: [
            'blocks/domains/i18n/@foundation/plurals.md',
          ],
        },
      ],
    });
  });

  it('should group the files of a parent and of each child block apart when the tree is nested', () => {
    // Arrange
    const listed = [
      'blocks/core/core.md',
      'blocks/core/@foundation/code.md',
      'blocks/implementations/react/react.md',
      'blocks/implementations/react/@foundation/hooks.md',
      'blocks/implementations/react/ink/ink.md',
      'blocks/implementations/react/ink/@foundation/with/presentation/design-system.md',
      'blocks/implementations/react/ink/notes.txt',
      'blocks/implementations/react/react-native/expo/expo.md',
    ].map(TreePath.create);

    // Act
    const located = BlockFile.locate(listed);

    // Assert
    expect({
      findings: located.findings,
      groups: located.groups.map((group) => ({
        id: String(group.folder.id),
        paths: group.entries.map((entry) => String(entry.path)),
      })),
    }).toStrictEqual({
      findings: [
        {
          code: PlaceCode.StrayBlockFile,
          details: {},
          path: 'blocks/implementations/react/ink/notes.txt',
        },
      ],
      groups: [
        {
          id: 'core',
          paths: [
            'blocks/core/core.md',
            'blocks/core/@foundation/code.md',
          ],
        },
        {
          id: 'react',
          paths: [
            'blocks/implementations/react/react.md',
            'blocks/implementations/react/@foundation/hooks.md',
          ],
        },
        {
          id: 'react/ink',
          paths: [
            'blocks/implementations/react/ink/ink.md',
            'blocks/implementations/react/ink/@foundation/with/presentation/design-system.md',
          ],
        },
        {
          id: 'react/react-native/expo',
          paths: [
            'blocks/implementations/react/react-native/expo/expo.md',
          ],
        },
      ],
    });
  });

  it.each<PlaceFinding>([
    {
      code: PlaceCode.ChapterNamedAfterBlock,
      details: {},
      path: 'blocks/implementations/react/ink/@foundation/ink.md',
    },
    {
      code: ValueFailure.BlockId,
      details: {
        site: ValueSite.SeamFile,
      },
      path: 'blocks/implementations/react/ink/@foundation/with/Design_System.md',
    },
  ])('should report $code at $path', (finding) => {
    // Act
    const located = BlockFile.locate([
      TreePath.create(finding.path),
    ]);

    // Assert
    expect(located.findings).toStrictEqual([
      finding,
    ]);
  });
});
