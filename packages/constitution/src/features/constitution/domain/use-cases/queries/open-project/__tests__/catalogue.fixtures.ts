import { Axis, Layer, Level } from '#/kernel/constants';

import { parsers } from '../../../../../__tests__/project.fixtures';
import type { CatalogueBlock, CatalogueRule, ProjectWarning } from '../../../../entities';
import type { CatalogueSource } from '../catalogue.utils';
import { readCatalogue } from '../read-catalogue.utils';
import { createWarningLog } from '../warning-log.utils';

// The folders a warning names the files of the release and of a pack under.
const RELEASE = '/release';
const PROJECT = '/project';

// A source whose files are given by their path from its folder, the unreadable ones without text.
const sourceOf = (input: {
  files?: Readonly<Record<string, string>>;
  source?: string;
  unreadable?: readonly string[];
  where?: string;
}): CatalogueSource => ({
  files: [
    ...Object.entries(input.files ?? {}).map(([path, text]) => ({
      path,
      text,
    })),
    ...(input.unreadable ?? []).map((path) => ({
      path,
    })),
  ],
  source: input.source ?? '',
  where: input.where ?? RELEASE,
});

// A pack listed as source, under the project's folder.
const packOf = (input: {
  files: Readonly<Record<string, string>>;
  source: string;
  unreadable?: readonly string[];
}): CatalogueSource =>
  sourceOf({
    ...input,
    where: `${PROJECT}/${input.source}`,
  });

const catalogueBlockOf = (
  block: Partial<CatalogueBlock> & {
    id: string;
  },
): CatalogueBlock => ({
  chapters: [],
  governs: [],
  isAbstract: false,
  layer: Layer.Domain,
  requires: [],
  seams: [],
  source: '',
  summary: `The ${block.id} block.`,
  ...block,
});

const catalogueRuleOf = (
  rule: Partial<CatalogueRule> & {
    block: string;
    slug: string;
  },
): CatalogueRule => ({
  axis: Axis.Foundation,
  isLevelStated: true,
  level: Level.Must,
  ...rule,
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
    parser: parsers().frontMatterParser,
    sources,
  });

  return {
    ...catalogue,
    warnings: log.list(),
  };
};

export { catalogueBlockOf, catalogueOf, catalogueRuleOf, packOf, sourceOf };
