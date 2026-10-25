import { AXES, Axis, Layer, Level } from '#/kernel/constants';
import type { Met, ProjectWarning } from '#/kernel/entities';
import { BlockId, BlockSource, Glob, PackPath, RuleSlug } from '#/kernel/value-objects';

import { parsers } from '../../../../../../../../../__tests__/project.fixtures';
import type { CatalogueSource } from '../../../../../../../../entities';
import { CatalogueAnswer, CatalogueBlock, CatalogueRule } from '../../../../../../../../entities';
import { createWarningLog } from '../../../shared/warning-log';
import { readCatalogue } from '../read-catalogue.utils';

// The folders a warning names the files of the release and of a pack under.
const RELEASE = '/release';
const PROJECT = '/project';

interface SourceFixture {
  readonly files?: Readonly<Record<string, string>>;
  readonly source?: string;
  readonly unreadable?: readonly string[];
  readonly where?: string;
}

// A source whose files are given by their path from its folder, the unreadable ones without text.
const sourceOf = (input: SourceFixture): CatalogueSource => ({
  files: [
    ...Object.entries(input.files ?? {}).map(([path, text]) => ({
      path,
      text,
    })),
    ...(input.unreadable ?? []).map((path) => ({
      path,
    })),
  ],
  source: BlockSource.create(
    input.source === undefined ? undefined : PackPath.create(input.source),
  ),
  where: input.where ?? RELEASE,
});

interface PackFixture {
  readonly files: Readonly<Record<string, string>>;
  readonly source: string;
  readonly unreadable?: readonly string[];
}

// A pack listed as source, under the project's folder.
const packOf = (input: PackFixture): CatalogueSource =>
  sourceOf({
    ...input,
    where: `${PROJECT}/${input.source}`,
  });

const axisOf = (place: string): Axis => {
  const axis = AXES.find((candidate) => place.startsWith(`${candidate}/`));

  if (axis === undefined) {
    throw new Error(`${place} names no axis`);
  }

  return axis;
};

interface CatalogueBlockFixture {
  readonly chapters?: readonly string[];
  readonly extends?: string;
  readonly governs?: readonly string[];
  readonly id: string;
  readonly isAbstract?: boolean;
  readonly layer?: Layer;
  readonly requires?: readonly string[];
  readonly seams?: readonly string[];
  readonly source?: string;
  // undefined given for a block whose card has no summary
  readonly summary?: string | undefined;
}

// A block as the catalogue reads it, the release's domain unless the case says; a chapter as
// "<axis>/<name>.md", a seam as "<axis>/<other block>".
const catalogueBlockOf = (block: CatalogueBlockFixture): CatalogueBlock => {
  const summary = 'summary' in block ? block.summary : `The ${block.id} block.`;

  return CatalogueBlock.create({
    chapters: (block.chapters ?? []).map((chapter) => ({
      axis: axisOf(chapter),
      name: chapter.slice(chapter.indexOf('/') + 1, -'.md'.length),
    })),
    ...(block.extends === undefined
      ? {}
      : {
          extends: BlockId.create(block.extends),
        }),
    governs: (block.governs ?? []).map(Glob.create),
    id: BlockId.create(block.id),
    isAbstract: block.isAbstract ?? false,
    layer: block.layer ?? Layer.Domain,
    requires: (block.requires ?? []).map(BlockId.create),
    seams: (block.seams ?? []).map((seam) => ({
      axis: axisOf(seam),
      other: BlockId.create(seam.slice(seam.indexOf('/') + 1)),
    })),
    source: BlockSource.create(
      block.source === undefined ? undefined : PackPath.create(block.source),
    ),
    ...(summary === undefined
      ? {}
      : {
          summary,
        }),
  });
};

interface CatalogueRuleFixture {
  readonly axis?: Axis;
  readonly block: string;
  readonly isLevelStated?: boolean;
  readonly level?: Level;
  readonly seam?: string;
  readonly slug: string;
  readonly tightens?: string;
}

// A rule as the catalogue reads it: a MUST it states on foundation unless the case says.
const catalogueRuleOf = (rule: CatalogueRuleFixture): CatalogueRule =>
  CatalogueRule.create({
    axis: rule.axis ?? Axis.Foundation,
    block: BlockId.create(rule.block),
    isLevelStated: rule.isLevelStated ?? true,
    level: rule.level ?? Level.Must,
    ...(rule.seam === undefined
      ? {}
      : {
          seam: BlockId.create(rule.seam),
        }),
    slug: RuleSlug.create(rule.slug),
    ...(rule.tightens === undefined
      ? {}
      : {
          tightens: RuleSlug.create(rule.tightens),
        }),
  });

// Each block's bases, nearest first, by the ids a case writes.
const ancestorsOf = (
  bases: Readonly<Record<string, readonly string[]>>,
): ReadonlyMap<BlockId, readonly BlockId[]> =>
  new Map(
    Object.entries(bases).map(([id, ancestors]) => [
      BlockId.create(id),
      ancestors.map(BlockId.create),
    ]),
  );

interface CatalogueAnswerFixture {
  readonly block: string;
  readonly met?: Met;
  readonly requirement: string;
}

const catalogueAnswerOf = (answer: CatalogueAnswerFixture): CatalogueAnswer =>
  CatalogueAnswer.create({
    block: BlockId.create(answer.block),
    ...(answer.met === undefined
      ? {}
      : {
          met: answer.met,
        }),
    requirement: RuleSlug.create(answer.requirement),
  });

// The catalogue the sources read as, with the warnings given while reading it.
const catalogueOf = (
  sources: readonly CatalogueSource[],
): ReturnType<typeof readCatalogue> & {
  warnings: readonly ProjectWarning[];
} => {
  const log = createWarningLog();
  const catalogue = readCatalogue({
    log,
    parser: parsers().cardParser,
    sources,
  });

  return {
    ...catalogue,
    warnings: log.list(),
  };
};

export {
  ancestorsOf,
  catalogueAnswerOf,
  catalogueBlockOf,
  catalogueOf,
  catalogueRuleOf,
  packOf,
  sourceOf,
};
