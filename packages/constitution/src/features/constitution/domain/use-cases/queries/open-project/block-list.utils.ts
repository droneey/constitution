import { Axis, Layer } from '#/kernel/constants';

import type { CatalogueBlock } from '../../../entities';
import type { Lowering } from './overrides.utils';
import type { ProjectModel, Scope, Scopes } from './project-model.utils';
import { AXIS_ORDER, axisOf, LAYER_FOLDER, nameOf } from './project-model.utils';

const TITLES: readonly (readonly [
  Layer,
  string,
])[] = [
  [
    Layer.Domain,
    'Domains',
  ],
  [
    Layer.Platform,
    'Platforms',
  ],
  [
    Layer.Language,
    'Languages',
  ],
  [
    Layer.Implementation,
    'Implementations',
  ],
];
const KEY =
  "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.";
const MARKDOWN = /\.md$/;

interface ListInput {
  block: CatalogueBlock;
  repository: Scope;
  scope: Scope;
}

// The chapters and seams a scope reads of a block by axis; with onlyAdded, only those a package
// adds to what the repository reads.
const byAxis = (
  input: ListInput & {
    isOnlyAdded: boolean;
  },
): string => {
  const { block, isOnlyAdded, repository, scope } = input;

  return AXIS_ORDER.filter((axis) => scope.axes.has(axis))
    .flatMap((axis) => {
      const isRepositoryAxis = repository.axes.has(axis);
      const chapters = block.chapters
        .filter((chapter) => axisOf(chapter) === axis && !(isOnlyAdded && isRepositoryAxis))
        .map((chapter) => nameOf(chapter).replace(MARKDOWN, ''));
      const seams = block.seams
        .filter((seam) => {
          const other = nameOf(seam);

          return (
            axisOf(seam) === axis &&
            scope.blocks.has(other) &&
            !(isOnlyAdded && repository.blocks.has(other) && isRepositoryAxis)
          );
        })
        .map((seam) => `with/${nameOf(seam)}`);
      const group = [
        ...chapters,
        ...seams,
      ];

      if (group.length === 0) {
        return [];
      }

      return [
        `${axis === Axis.Foundation ? '' : `${axis}: `}${group.join(', ')}`,
      ];
    })
    .join('; ');
};

// An implementation is known by its library's name; the digest's budget goes to the blocks a
// name alone does not explain.
const summaryOf = (block: CatalogueBlock): string =>
  block.layer === Layer.Implementation ? '' : `: ${block.summary}`;

const alsoOf = (input: ListInput): string => {
  const files = byAxis({
    ...input,
    isOnlyAdded: false,
  });

  return files === '' ? '' : ` (${files})`;
};

const repositoryLines = (input: { model: ProjectModel; repository: Scope }): readonly string[] => {
  let isKeyed = false;

  return TITLES.flatMap(([layer, title]) => {
    const blocks = input.model.blocks.filter(
      (block) => block.layer === layer && input.repository.blocks.has(block.id),
    );

    if (blocks.length === 0) {
      return [];
    }

    const heading = [
      `## ${title} (blocks/${LAYER_FOLDER[layer]}/<id>/<id>.md)`,
      ...(isKeyed
        ? []
        : [
            KEY,
          ]),
    ];

    isKeyed = true;

    return [
      ...heading,
      ...blocks.map(
        (block) =>
          `- ${block.id}${block.source === '' ? '' : ` [${block.source}]`}${summaryOf(block)}${alsoOf(
            {
              block,
              repository: input.repository,
              scope: input.repository,
            },
          )}`,
      ),
    ];
  });
};

const packageLines = (input: {
  model: ProjectModel;
  repository: Scope;
  scope: Scope;
}): readonly string[] => {
  const lines = input.model.blocks.flatMap((block) => {
    if (block.layer === Layer.Core || !input.scope.blocks.has(block.id)) {
      return [];
    }

    const folder = LAYER_FOLDER[block.layer];

    if (!input.repository.blocks.has(block.id)) {
      return [
        `- ${block.id} [${folder}]${summaryOf(block)}${alsoOf({
          ...input,
          block,
        })}`,
      ];
    }

    const added = byAxis({
      ...input,
      block,
      isOnlyAdded: true,
    });

    return added === ''
      ? []
      : [
          `- ${block.id} [${folder}]: Also: ${added}`,
        ];
  });

  return lines.length === 0
    ? []
    : [
        `## ${input.scope.app}`,
        ...lines,
      ];
};

const overrideLines = (lowering: Lowering): readonly string[] =>
  lowering.live.length === 0
    ? []
    : [
        '## Overrides',
        ...lowering.live.map(
          (override) =>
            `- ${override.rule}: ${override.level}${override.app === '' ? '' : ` in ${override.app}`}${
              override.until === '' ? '' : ` until ${override.until}`
            }`,
        ),
      ];

// The block list the digest closes with: the repository's blocks by layer, what each package adds,
// then the overrides that hold.
const blockListOf = (input: {
  lowering: Lowering;
  model: ProjectModel;
  scopes: Scopes;
}): readonly string[] => {
  const [repository, ...packages] = input.scopes;

  return [
    ...repositoryLines({
      model: input.model,
      repository,
    }),
    ...packages.flatMap((scope) =>
      packageLines({
        model: input.model,
        repository,
        scope,
      }),
    ),
    ...overrideLines(input.lowering),
  ];
};

export { blockListOf };
