import type { FrontMatterParser } from '../../../contracts';
import type { ProjectConfig, Resolution } from '../../../entities';
import { activeOf, mustsOf } from './active.utils';
import { blockListOf } from './block-list.utils';
import type { CatalogueSource } from './catalogue.utils';
import { checkAnswers, checkRequires } from './needs.utils';
import { applyOverrides } from './overrides.utils';
import { modelOf } from './project-model.utils';
import { readCatalogue } from './read-catalogue.utils';
import { checkKeys, scopesOf } from './scopes.utils';
import { createWarningLog } from './warning-log.utils';

// A check written as YAML's null names none.
const NO_CHECK: ReadonlySet<string> = new Set([
  'null',
  '~',
]);

// Which blocks a project's constitution.yaml makes active, in the repository and in each package,
// what is wrong with the declaration, and what the digest and the later hooks give of them.
const resolveProject = (input: {
  config: ProjectConfig;
  parser: FrontMatterParser;
  sources: readonly CatalogueSource[];
  today: string;
}): Resolution => {
  const log = createWarningLog();
  const catalogue = readCatalogue({
    log,
    parser: input.parser,
    sources: input.sources,
  });

  checkKeys({
    config: input.config,
    log,
  });

  const model = modelOf(catalogue);
  const scopes = scopesOf({
    config: input.config,
    log,
    model,
  });
  const lowering = applyOverrides({
    config: input.config,
    log,
    model,
    today: input.today,
  });
  const [repository, ...packages] = scopes;

  for (const scope of scopes) {
    checkRequires({
      log,
      model,
      repository,
      scope,
    });
  }

  const unmetInRepository = checkAnswers({
    answers: catalogue.answers,
    log,
    lowering,
    model,
    scope: repository,
    unmetInRepository: new Set(),
  });

  for (const scope of packages) {
    checkAnswers({
      answers: catalogue.answers,
      log,
      lowering,
      model,
      scope,
      unmetInRepository,
    });
  }

  const check = input.config.check ?? '';

  return {
    active: activeOf({
      model,
      scopes,
    }),
    blocks: catalogue.blocks.map((block) => ({
      id: block.id,
      layer: block.layer,
    })),
    check: NO_CHECK.has(check) ? '' : check,
    count: catalogue.blocks.filter((block) => scopes.some((scope) => scope.blocks.has(block.id)))
      .length,
    index: blockListOf({
      lowering,
      model,
      scopes,
    }),
    musts: mustsOf({
      lowering,
      model,
      rules: catalogue.rules,
      scopes,
    }),
    units: scopes.map((scope) => ({
      axes: [
        ...scope.axes,
      ],
      blocks: scope.blocks,
      lowered: lowering.lowered.get(scope.index) ?? new Set(),
      path: scope.app,
      scope: scope.index,
    })),
    warnings: log.list(),
  };
};

export { resolveProject };
