import { describe, expect, it } from 'bun:test';

import { BlockId } from '#/kernel/value-objects';

import type { BlockFinding } from '../../../domain/use-cases/queries/check';
import {
  BindingsFileCode,
  BlockLoadCode,
  FrontMatterField,
  FrontMatterReadCode,
  LoadCode,
  PlaceCode,
} from '../../../domain/use-cases/queries/check';
import { findingTextOf } from '../finding-text.utils';

const PATH = 'blocks/domains/ui/ui.md';

describe('loadTexts', () => {
  it.each<{
    finding: BlockFinding;
    text: string;
  }>([
    {
      finding: {
        code: BindingsFileCode.NotYaml,
        details: {
          reason: 'Unexpected flow-seq-end token',
        },
        path: PATH,
      },
      text: 'is not valid YAML: Unexpected flow-seq-end token',
    },
    {
      finding: {
        code: BindingsFileCode.OffSchema,
        details: {
          field: 'core.any-never-typed',
          reason: 'Too small',
        },
        path: PATH,
      },
      text: 'does not match its schema: core.any-never-typed: Too small',
    },
    {
      finding: {
        code: BindingsFileCode.OffSchema,
        details: {
          field: '',
          reason: 'Invalid input',
        },
        path: PATH,
      },
      text: 'does not match its schema: <root>: Invalid input',
    },
    {
      finding: {
        code: BlockLoadCode.SecondaryFrontMatter,
        details: {},
        path: PATH,
      },
      text: 'has front matter; only the passport of a block carries it',
    },
    {
      finding: {
        code: BlockLoadCode.WithoutPassport,
        details: {
          id: BlockId.create('ui'),
        },
        path: PATH,
      },
      text: 'has no passport ui.md',
    },
    {
      finding: {
        code: FrontMatterReadCode.Missing,
        details: {},
        path: PATH,
      },
      text: 'has no front matter; a passport opens with it',
    },
    {
      finding: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          reason: 'broken',
        },
        path: PATH,
      },
      text: 'front matter is not valid YAML: broken',
    },
    {
      finding: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            line: 2,
          },
          reason: 'broken',
        },
        path: PATH,
      },
      text: 'front matter line 2 is not valid YAML: broken',
    },
    {
      finding: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            key: 'summary',
            line: 3,
          },
          reason: 'broken',
        },
        path: PATH,
      },
      text: 'front matter line 3 (summary) is not valid YAML: broken',
    },
    {
      finding: {
        code: FrontMatterReadCode.NotMapping,
        details: {},
        path: PATH,
      },
      text: 'front matter is not a mapping of fields',
    },
    {
      finding: {
        code: FrontMatterReadCode.FieldMissing,
        details: {
          field: FrontMatterField.Governs,
        },
        path: PATH,
      },
      text: 'front matter lacks "governs"; every block declares every field',
    },
    {
      finding: {
        code: FrontMatterReadCode.FieldUnknown,
        details: {
          key: 'brands',
        },
        path: PATH,
      },
      text: 'front matter has "brands", which is not a field',
    },
    {
      finding: {
        code: FrontMatterReadCode.OutOfOrder,
        details: {
          order: [
            FrontMatterField.Id,
            FrontMatterField.Summary,
            FrontMatterField.Requires,
          ],
        },
        path: PATH,
      },
      text: 'front matter lists its fields out of order; the order is id, summary, requires',
    },
    {
      finding: {
        code: FrontMatterReadCode.OffSchema,
        details: {
          field: 'abstract',
          reason: 'expected a boolean',
        },
        path: PATH,
      },
      text: 'front matter: abstract: expected a boolean',
    },
    {
      finding: {
        code: FrontMatterReadCode.OffSchema,
        details: {
          field: '',
          reason: 'expected an object',
        },
        path: PATH,
      },
      text: 'front matter: <root>: expected an object',
    },
    {
      finding: {
        code: FrontMatterReadCode.SummaryTooLong,
        details: {
          characters: 71,
          limit: 70,
        },
        path: PATH,
      },
      text: 'front matter: summary has 71 characters; it holds at most 70',
    },
    {
      finding: {
        code: FrontMatterReadCode.SummaryNotSentence,
        details: {},
        path: PATH,
      },
      text: 'front matter: summary is one sentence on one line, ending with a full stop',
    },
    {
      finding: {
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry: 'Bad',
          field: FrontMatterField.Extends,
        },
        path: PATH,
      },
      text: 'front matter: extends "Bad", which is not a block id',
    },
    {
      finding: {
        code: FrontMatterReadCode.EntryEmpty,
        details: {},
        path: PATH,
      },
      text: 'front matter: governs holds no empty entry',
    },
    {
      finding: {
        code: FrontMatterReadCode.EntryRepeated,
        details: {
          entry: 'css',
          field: FrontMatterField.Languages,
        },
        path: PATH,
      },
      text: 'front matter: languages lists "css" twice',
    },
    {
      finding: {
        code: LoadCode.BaseDoesNotLoad,
        details: {},
        path: PATH,
      },
      text: 'is the Constitution this pack extends, and it does not load; check it before the pack',
    },
    {
      finding: {
        code: LoadCode.IdShared,
        details: {
          id: BlockId.create('ui'),
          others: [
            'blocks/implementations/ui/ui.md',
          ],
        },
        path: PATH,
      },
      text: 'shares the id "ui" with blocks/implementations/ui/ui.md; an id names one block',
    },
    {
      finding: {
        code: LoadCode.IdShared,
        details: {
          id: BlockId.create('ui'),
          others: [
            'blocks/contexts/platforms/ui/ui.md',
            'blocks/implementations/ui/ui.md',
          ],
        },
        path: PATH,
      },
      text: 'shares the id "ui" with blocks/contexts/platforms/ui/ui.md, blocks/implementations/ui/ui.md; an id names one block',
    },
    {
      finding: {
        code: PlaceCode.OutsideBlockFolder,
        details: {},
        path: PATH,
      },
      text: 'is not inside a block folder; a block is blocks/core, or a folder <id>/ in domains, contexts/platforms, contexts/languages or implementations',
    },
    {
      finding: {
        code: PlaceCode.StrayBlockFile,
        details: {},
        path: PATH,
      },
      text: 'is not a block file; a block holds at its root its passport <id>.md, and in foundation/, architecture/ and workflow/ its chapters <name>.md and its seams with/<block>.md',
    },
    {
      finding: {
        code: PlaceCode.ChapterNamedAfterBlock,
        details: {},
        path: PATH,
      },
      text: "is named after its block; an axis holds named chapters and seams, and the block's id names only its passport <id>.md",
    },
  ])('should say $finding.code as the report words it', ({ finding, text }) => {
    // Arrange
    const reported = finding;

    // Act
    const said = findingTextOf(reported);

    // Assert
    expect(said).toBe(text);
  });
});
