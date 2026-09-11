import type { Block, Constitution, Finding, Rule } from '../models';

const folderName = (block: Block): string => block.dir.split('/').at(-1) ?? '';

const kindMatches = (block: Block): readonly Finding[] =>
  block.manifest.kind === block.kind
    ? []
    : [
        {
          message: `declares kind "${block.manifest.kind}" but sits in a "${block.kind}" folder`,
          path: `${block.dir}/block.yml`,
        },
      ];

const nameMatches = (block: Block): readonly Finding[] =>
  block.manifest.name === folderName(block)
    ? []
    : [
        {
          message: `declares name "${block.manifest.name}" but its folder is "${folderName(block)}"`,
          path: `${block.dir}/block.yml`,
        },
      ];

const filesExist = (
  block: Block,
  paths: ReadonlySet<string>,
): readonly Finding[] =>
  Object.entries(block.manifest.chapters)
    .filter(([, file]) => !paths.has(`${block.dir}/${file}`))
    .map(([axis, file]) => ({
      message: `chapter "${axis}" points at a missing file "${file}"`,
      path: `${block.dir}/block.yml`,
    }));

const targetsExist = (
  block: Block,
  ids: ReadonlySet<string>,
): readonly Finding[] =>
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
    if (target.id === block.id) {
      return [
        {
          message: `${target.verb} itself`,
          path: `${block.dir}/block.yml`,
        },
      ];
    }

    return ids.has(target.id)
      ? []
      : [
          {
            message: `${target.verb} an unknown block "${target.id}"`,
            path: `${block.dir}/block.yml`,
          },
        ];
  });

const manifestsRule: Rule = ({
  blocks,
  paths,
}: Constitution): readonly Finding[] => {
  const ids: ReadonlySet<string> = new Set(blocks.map((block) => block.id));

  return blocks.flatMap((block) => [
    ...kindMatches(block),
    ...nameMatches(block),
    ...filesExist(block, paths),
    ...targetsExist(block, ids),
  ]);
};

export { manifestsRule };
