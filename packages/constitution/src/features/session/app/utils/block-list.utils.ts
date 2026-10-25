import { Axis, BLOCKS_FOLDER, LAYER_FOLDER, Layer, SEAM_FOLDER } from '#/kernel/constants';
import type { BlockListing, ListedBlock, ListedFiles, UnitListing } from '#/kernel/entities';
import { UnitEntryKind } from '#/kernel/entities';
import { SourceKind, UnitPath } from '#/kernel/value-objects';

const TITLES = [
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
] as const;
const KEY =
  "In brackets, a block's chapters and seams, named without .md: foundation's first, then <axis>: <file>, ... An implementation is named by its library alone; square brackets name a block's pack or, in an application, its layer.";

// The chapters and seams of a block by axis: foundation's bare, any other's after its axis.
const filesText = (files: readonly ListedFiles[]): string =>
  files
    .map(
      (onAxis) =>
        `${onAxis.axis === Axis.Foundation ? '' : `${onAxis.axis}: `}${[
          ...onAxis.chapters,
          ...onAxis.seams.map((seam) => `${SEAM_FOLDER}/${seam}`),
        ].join(', ')}`,
    )
    .join('; ');

const alsoOf = (files: readonly ListedFiles[]): string =>
  files.length === 0 ? '' : ` (${filesText(files)})`;

// An implementation is known by its library's name; the digest's budget goes to the blocks a
// name alone does not explain.
const summaryOf = (block: ListedBlock): string =>
  block.layer === Layer.Implementation || block.summary === undefined ? '' : `: ${block.summary}`;

const sourceOf = (block: ListedBlock): string =>
  block.source.kind === SourceKind.Pack ? ` [${block.source.pack}]` : '';

// The repository's blocks by layer, each layer under its heading; the key follows the first.
const repositoryLines = (blocks: readonly ListedBlock[]): readonly string[] =>
  TITLES.map(([layer, title]) => ({
    layer,
    listed: blocks.filter((block) => block.layer === layer),
    title,
  }))
    .filter(({ listed }) => listed.length > 0)
    .flatMap(({ layer, listed, title }, index) => [
      `## ${title} (${BLOCKS_FOLDER}/${LAYER_FOLDER[layer]}/<id>/<id>.md)`,
      ...(index === 0
        ? [
            KEY,
          ]
        : []),
      ...listed.map(
        (block) => `- ${block.id}${sourceOf(block)}${summaryOf(block)}${alsoOf(block.files)}`,
      ),
    ]);

const unitLines = (unit: UnitListing): readonly string[] => {
  const leftOut = [
    ...unit.leftOutBlocks,
    ...unit.leftOutAxes.map((axis) => `the ${axis} axis`),
  ];
  const lines = [
    ...(leftOut.length === 0
      ? []
      : [
          `- leaves out: ${leftOut.join(', ')}`,
        ]),
    ...unit.entries.map((entry) =>
      entry.kind === UnitEntryKind.Own
        ? `- ${entry.block.id} [${LAYER_FOLDER[entry.block.layer]}]${summaryOf(entry.block)}${alsoOf(entry.block.files)}`
        : `- ${entry.id} [${LAYER_FOLDER[entry.layer]}]: Also: ${filesText(entry.files)}`,
    ),
  ];

  return lines.length === 0
    ? []
    : [
        `## ${unit.unit}`,
        ...lines,
      ];
};

const overrideLines = (listing: BlockListing): readonly string[] =>
  listing.overrides.length === 0
    ? []
    : [
        '## Overrides',
        ...listing.overrides.map(
          (override) =>
            `- ${override.rule}: ${override.level}${UnitPath.isRepository(override.unit) ? '' : ` in ${override.unit}`}${
              override.until === undefined ? '' : ` until ${override.until.toString()}`
            }`,
        ),
      ];

const blockListLines = (listing: BlockListing): readonly string[] => [
  ...repositoryLines(listing.repository),
  ...listing.units.flatMap(unitLines),
  ...overrideLines(listing),
];

export { blockListLines };
