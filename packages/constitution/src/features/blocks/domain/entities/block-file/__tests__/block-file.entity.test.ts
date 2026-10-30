import { describe, expect, it } from 'bun:test';

import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';

import { TreePath } from '../../../value-objects';
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
      'blocks/domains/ui/foundation/screens.md',
      'blocks/domains/i18n/foundation/plurals.md',
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
            'blocks/domains/ui/foundation/screens.md',
          ],
        },
        {
          dir: 'blocks/domains/i18n',
          paths: [
            'blocks/domains/i18n/foundation/plurals.md',
          ],
        },
      ],
    });
  });
});
