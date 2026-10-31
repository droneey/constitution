import { Layer } from '#/kernel/constants';
import { SourceKind } from '#/kernel/value-objects';

import type {
  DigestBlock,
  DigestListing,
  DigestUnit,
  DigestUnitBlock,
} from '../../domain/entities';
import type { ListedLayer } from './digest.messages';
import {
  addsMessage,
  LAYER_TITLES,
  leavesOutMessage,
  leftOutAxisMessage,
  MAP_HEADING,
  mapLineMessage,
  memberLineMessage,
  PACKS_TITLE,
  packedNameMessage,
} from './digest.messages';

const mapLayers: readonly ListedLayer[] = [
  Layer.Domain,
  Layer.Platform,
  Layer.Language,
  Layer.Implementation,
];

const isFromPack = (block: DigestUnitBlock): boolean => block.source.kind === SourceKind.Pack;

const nameOf = (block: DigestUnitBlock): string => {
  switch (block.source.kind) {
    case SourceKind.Release:
      return block.id;
    case SourceKind.Pack:
      return packedNameMessage({
        id: block.id,
        pack: block.source.pack,
      });
    // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
    default:
      return block.source satisfies never;
  }
};

const lineOf = (title: string, names: readonly string[]): readonly string[] =>
  names.length === 0
    ? []
    : [
        mapLineMessage({
          names,
          title,
        }),
      ];

const repositoryLines = (blocks: readonly DigestBlock[]): readonly string[] => [
  ...mapLayers.flatMap((layer) =>
    lineOf(
      LAYER_TITLES[layer],
      blocks.filter((block) => block.layer === layer && !isFromPack(block)).map(nameOf),
    ),
  ),
  ...lineOf(PACKS_TITLE, blocks.filter(isFromPack).map(nameOf)),
];

const unitLines = (unit: DigestUnit): readonly string[] => {
  const leftOut = [
    ...unit.leftOutBlocks,
    ...unit.leftOutAxes.map(leftOutAxisMessage),
  ];
  const changes = [
    ...(unit.own.length === 0
      ? []
      : [
          addsMessage(unit.own.map(nameOf)),
        ]),
    ...(leftOut.length === 0
      ? []
      : [
          leavesOutMessage(leftOut),
        ]),
  ];

  return changes.length === 0
    ? []
    : [
        memberLineMessage({
          changes,
          unit: unit.unit,
        }),
      ];
};

const blockListLines = (listing: DigestListing): readonly string[] => {
  const lines = [
    ...repositoryLines(listing.repository),
    ...listing.units.flatMap(unitLines),
  ];

  return lines.length === 0
    ? []
    : [
        MAP_HEADING,
        ...lines,
      ];
};

export { blockListLines };
