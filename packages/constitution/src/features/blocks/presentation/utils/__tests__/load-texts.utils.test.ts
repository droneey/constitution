import { describe, expect, it } from 'bun:test';

import type { ProblemOf } from '#/kernel/types';
import { BlockId } from '#/kernel/value-objects';
import { textOf } from '#/shared/cli';

import type { LoadFindingDetails } from '../../../application/use-cases/queries/check';
import { BlockLoadCode, LoadCode, PlaceCode } from '../../../application/use-cases/queries/check';
import { FrontMatterField, FrontMatterReadCode } from '../../../domain/entities';
import { loadTexts } from '../load-texts.utils';

describe('loadTexts', () => {
  it.each<{
    problem: ProblemOf<LoadFindingDetails>;
    text: string;
  }>([
    {
      problem: {
        code: BlockLoadCode.SecondaryFrontMatter,
        details: {},
      },
      text: 'has front matter; only the passport of a block carries it',
    },
    {
      problem: {
        code: BlockLoadCode.WithoutPassport,
        details: {
          id: BlockId.create('ui'),
        },
      },
      text: 'has no passport ui.md',
    },
    {
      problem: {
        code: FrontMatterReadCode.Missing,
        details: {},
      },
      text: 'has no front matter; a passport opens with it',
    },
    {
      problem: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          reason: 'broken',
        },
      },
      text: 'front matter is not valid YAML: broken',
    },
    {
      problem: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            line: 2,
          },
          reason: 'broken',
        },
      },
      text: 'front matter line 2 is not valid YAML: broken',
    },
    {
      problem: {
        code: FrontMatterReadCode.NotYaml,
        details: {
          at: {
            key: 'summary',
            line: 3,
          },
          reason: 'broken',
        },
      },
      text: 'front matter line 3 (summary) is not valid YAML: broken',
    },
    {
      problem: {
        code: FrontMatterReadCode.NotMapping,
        details: {},
      },
      text: 'front matter is not a mapping of fields',
    },
    {
      problem: {
        code: FrontMatterReadCode.FieldMissing,
        details: {
          field: FrontMatterField.Governs,
        },
      },
      text: 'front matter lacks "governs"; every block declares every field',
    },
    {
      problem: {
        code: FrontMatterReadCode.FieldUnknown,
        details: {
          key: 'brands',
        },
      },
      text: 'front matter has "brands", which is not a field',
    },
    {
      problem: {
        code: FrontMatterReadCode.OutOfOrder,
        details: {
          order: [
            FrontMatterField.Id,
            FrontMatterField.Summary,
            FrontMatterField.Requires,
          ],
        },
      },
      text: 'front matter lists its fields out of order; the order is id, summary, requires',
    },
    {
      problem: {
        code: FrontMatterReadCode.OffSchema,
        details: {
          field: 'abstract',
          reason: 'expected a boolean',
        },
      },
      text: 'front matter: abstract: expected a boolean',
    },
    {
      problem: {
        code: FrontMatterReadCode.OffSchema,
        details: {
          field: '',
          reason: 'expected an object',
        },
      },
      text: 'front matter: <root>: expected an object',
    },
    {
      problem: {
        code: FrontMatterReadCode.SummaryTooLong,
        details: {
          characters: 71,
          limit: 70,
        },
      },
      text: 'front matter: summary has 71 characters; it holds at most 70',
    },
    {
      problem: {
        code: FrontMatterReadCode.SummaryNotSentence,
        details: {},
      },
      text: 'front matter: summary is one sentence on one line, ending with a full stop',
    },
    {
      problem: {
        code: FrontMatterReadCode.NotBlockId,
        details: {
          entry: 'Bad',
          field: FrontMatterField.Extends,
        },
      },
      text: 'front matter: extends "Bad", which is not a block id',
    },
    {
      problem: {
        code: FrontMatterReadCode.EntryEmpty,
        details: {},
      },
      text: 'front matter: governs holds no empty entry',
    },
    {
      problem: {
        code: FrontMatterReadCode.EntryRepeated,
        details: {
          entry: 'css',
          field: FrontMatterField.Languages,
        },
      },
      text: 'front matter: languages lists "css" twice',
    },
    {
      problem: {
        code: LoadCode.BaseDoesNotLoad,
        details: {},
      },
      text: 'is the Constitution this pack extends, and it does not load; check it before the pack',
    },
    {
      problem: {
        code: LoadCode.IdShared,
        details: {
          id: BlockId.create('ui'),
          others: [
            'blocks/implementations/ui/ui.md',
          ],
        },
      },
      text: 'shares the id "ui" with blocks/implementations/ui/ui.md; an id names one block',
    },
    {
      problem: {
        code: LoadCode.IdShared,
        details: {
          id: BlockId.create('ui'),
          others: [
            'blocks/contexts/platforms/ui/ui.md',
            'blocks/implementations/ui/ui.md',
          ],
        },
      },
      text: 'shares the id "ui" with blocks/contexts/platforms/ui/ui.md, blocks/implementations/ui/ui.md; an id names one block',
    },
    {
      problem: {
        code: PlaceCode.OutsideBlockFolder,
        details: {},
      },
      text: 'is not inside a block folder; a block is blocks/core, or a folder <id>/ in domains, contexts/platforms, contexts/languages or implementations',
    },
    {
      problem: {
        code: PlaceCode.StrayBlockFile,
        details: {},
      },
      text: 'is not a block file; a block holds at its root its passport <id>.md, and in foundation/, architecture/ and workflow/ its chapters <name>.md and its seams with/<block>.md',
    },
    {
      problem: {
        code: PlaceCode.ChapterNamedAfterBlock,
        details: {},
      },
      text: "is named after its block; an axis holds named chapters and seams, and the block's id names only its passport <id>.md",
    },
  ])('should say $problem.code as the report words it', ({ problem, text }) => {
    // Act
    const said = textOf(loadTexts, problem.code, problem.details);

    // Assert
    expect(said).toBe(text);
  });
});
