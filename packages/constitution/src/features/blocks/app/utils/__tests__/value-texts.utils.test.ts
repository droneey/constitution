import { describe, expect, it } from 'bun:test';

import { ValueSite } from '#/kernel/entities';
import { ValueFailure } from '#/kernel/errors';

import type { BlockFinding } from '../../../domain/use-cases/queries/check';
import { findingTextOf } from '../finding-text.utils';

const PATH = 'blocks/domains/ui/ui.md';

describe('valueTexts', () => {
  it.each<{
    finding: BlockFinding;
    text: string;
  }>([
    {
      finding: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.FrontMatterId,
          written: 'Ui',
        },
        path: PATH,
      },
      text: 'front matter: id "Ui" is not a kebab-case block id',
    },
    {
      finding: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.BlockFolder,
          written: 'Ui',
        },
        path: 'blocks/domains/Ui',
      },
      text: 'is a block folder named "Ui", which is not a kebab-case block id',
    },
    {
      finding: {
        code: ValueFailure.BlockId,
        details: {
          site: ValueSite.SeamFile,
        },
        path: 'blocks/domains/ui/architecture/with/Remote.md',
      },
      text: "is a seam whose name is not a kebab-case block id; a seam is with/<block>.md, named after the other block's id",
    },
    {
      finding: {
        code: ValueFailure.Glob,
        details: {
          site: ValueSite.Governs,
          written: 'src/**/*.ts lib',
        },
        path: PATH,
      },
      text: 'front matter: governs lists "src/**/*.ts lib", which holds whitespace; the index separates globs with spaces',
    },
    {
      finding: {
        code: ValueFailure.PartAddress,
        details: {
          site: ValueSite.BoundPart,
          written: 'a/b',
        },
        path: 'presets/typescript/biome/foundation/bindings.yaml',
      },
      text: 'binds the part "a/b", which is not a file name: it is empty or holds a "/"',
    },
    {
      finding: {
        code: ValueFailure.RuleSlug,
        details: {
          site: ValueSite.BoundRule,
          written: 'Not_A_Slug',
        },
        path: 'presets/typescript/biome/foundation/bindings.yaml',
      },
      text: 'binds "Not_A_Slug", which is not a kebab-case slug',
    },
    {
      finding: {
        code: ValueFailure.RuleSlug,
        details: {
          site: ValueSite.RuleHeading,
          written: 'Not_A_Slug',
        },
        path: PATH,
      },
      text: 'rule "Not_A_Slug" is not a kebab-case slug',
    },
    {
      finding: {
        code: ValueFailure.RuleSlug,
        details: {
          rule: 'loading-state-shown',
          site: ValueSite.TightenedRule,
          written: 'Not_A_Slug',
        },
        path: PATH,
      },
      text: 'rule "loading-state-shown" tightens "Not_A_Slug", which is not a kebab-case slug',
    },
  ])(
    'should say $finding.code at $finding.details.site as the report words it',
    ({ finding, text }) => {
      // Arrange
      const reported = finding;

      // Act
      const said = findingTextOf(reported);

      // Assert
      expect(said).toBe(text);
    },
  );
});
