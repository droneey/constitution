import {
  Axis,
  BLOCKS_FOLDER_NAME,
  LAYER_FOLDER_NAME,
  Layer,
  PATH_SEPARATOR,
  SEAM_FOLDER_NAME,
} from '#/kernel/constants';
import { SourceKind } from '#/kernel/value-objects';

import type { DigestBlock, DigestFiles, DigestListing, DigestUnit } from '../../domain/entities';
import { DigestEntryKind } from '../../domain/entities';

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

const filesText = (files: readonly DigestFiles[]): string =>
  files
    .map(
      (onAxis) =>
        `${onAxis.axis === Axis.Foundation ? '' : `${onAxis.axis}: `}${[
          ...onAxis.chapters,
          ...onAxis.seams.map((seam) => `${SEAM_FOLDER_NAME}${PATH_SEPARATOR}${seam}`),
        ].join(', ')}`,
    )
    .join('; ');

const alsoOf = (files: readonly DigestFiles[]): string =>
  files.length === 0 ? '' : ` (${filesText(files)})`;

// An implementation is known by its library's name; the digest's budget goes to the blocks a
// name alone does not explain.
const summaryOf = (block: DigestBlock): string =>
  block.layer === Layer.Implementation || block.summary === undefined ? '' : `: ${block.summary}`;

const sourceOf = (block: DigestBlock): string =>
  block.source.kind === SourceKind.Pack ? ` [${block.source.pack}]` : '';

const repositoryLines = (blocks: readonly DigestBlock[]): readonly string[] =>
  TITLES.map(([layer, title]) => ({
    layer,
    listed: blocks.filter((block) => block.layer === layer),
    title,
  }))
    .filter(({ listed }) => listed.length > 0)
    .flatMap(({ layer, listed, title }, index) => [
      `## ${title} (${BLOCKS_FOLDER_NAME}${PATH_SEPARATOR}${LAYER_FOLDER_NAME[layer]}${PATH_SEPARATOR}<id>/<id>.md)`,
      ...(index === 0
        ? [
            KEY,
          ]
        : []),
      ...listed.map(
        (block) => `- ${block.id}${sourceOf(block)}${summaryOf(block)}${alsoOf(block.files)}`,
      ),
    ]);

const unitLines = (unit: DigestUnit): readonly string[] => {
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
      entry.kind === DigestEntryKind.Own
        ? `- ${entry.block.id} [${LAYER_FOLDER_NAME[entry.block.layer]}]${summaryOf(entry.block)}${alsoOf(entry.block.files)}`
        : `- ${entry.id} [${LAYER_FOLDER_NAME[entry.layer]}]: Also: ${filesText(entry.files)}`,
    ),
  ];

  return lines.length === 0
    ? []
    : [
        `## ${unit.unit}`,
        ...lines,
      ];
};

const blockListLines = (listing: DigestListing): readonly string[] => [
  ...repositoryLines(listing.repository),
  ...listing.units.flatMap(unitLines),
];

export { blockListLines };
