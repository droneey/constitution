import type { Block, Constitution, Finding, Rule } from '../models';
import { kindOfBlockId, kindRank } from '../models';

const dependsUpward = (block: Block): readonly Finding[] =>
  [
    ...block.manifest.requires.map((id) => ({
      id,
      verb: 'requires',
    })),
    ...block.manifest.refines.map((id) => ({
      id,
      verb: 'refines',
    })),
  ].flatMap((target) => {
    const kind = kindOfBlockId(target.id);

    if (kind === undefined || kindRank(kind) <= kindRank(block.kind)) {
      return [];
    }

    return [
      {
        message: `${target.verb} "${target.id}", a ${kind} block, but a ${block.kind} block depends only on its own kind or a kind above it`,
        path: `${block.dir}/block.yml`,
      },
    ];
  });

const kindDirectionRule: Rule = ({
  blocks,
}: Constitution): readonly Finding[] => blocks.flatMap(dependsUpward);

export { kindDirectionRule };
