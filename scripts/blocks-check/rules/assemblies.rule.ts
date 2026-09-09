import type { Assembly, Block, Constitution, Finding, Rule } from '../models';

const nameMatches = (assembly: Assembly): readonly Finding[] =>
  assembly.manifest.name === assembly.fileName
    ? []
    : [
        {
          message: `declares name "${assembly.manifest.name}" but its file is "${assembly.fileName}.yml"`,
          path: assembly.path,
        },
      ];

const sphereListed = (assembly: Assembly): readonly Finding[] =>
  assembly.manifest.blocks.includes(`spheres/${assembly.manifest.sphere}`)
    ? []
    : [
        {
          message: `names the sphere "${assembly.manifest.sphere}" but does not list "spheres/${assembly.manifest.sphere}"`,
          path: assembly.path,
        },
      ];

const listIsSound = (
  assembly: Assembly,
  known: ReadonlyMap<string, Block>,
): readonly Finding[] =>
  assembly.manifest.blocks.flatMap((id, index) => {
    if (id === 'core') {
      return [
        {
          message:
            'lists core, which is part of every assembly and never listed',
          path: assembly.path,
        },
      ];
    }

    if (!known.has(id)) {
      return [
        {
          message: `lists an unknown block "${id}"`,
          path: assembly.path,
        },
      ];
    }

    return assembly.manifest.blocks.indexOf(id) === index
      ? []
      : [
          {
            message: `lists "${id}" twice`,
            path: assembly.path,
          },
        ];
  });

const dependenciesHold = (
  assembly: Assembly,
  known: ReadonlyMap<string, Block>,
): readonly Finding[] => {
  const listed = assembly.manifest.blocks;

  return listed.flatMap((id, index) => {
    const block = known.get(id);

    if (block === undefined) {
      return [];
    }

    return [
      ...block.manifest.requires
        .filter((required) => !listed.includes(required))
        .map((required) => ({
          message: `"${id}" requires "${required}", which is not listed`,
          path: assembly.path,
        })),
      ...block.manifest.refines
        .filter((refined) => !listed.slice(0, index).includes(refined))
        .map((refined) => ({
          message: `"${id}" refines "${refined}", which must come earlier in the list`,
          path: assembly.path,
        })),
    ];
  });
};

const assembliesRule: Rule = ({
  assemblies,
  blocks,
}: Constitution): readonly Finding[] => {
  const known: ReadonlyMap<string, Block> = new Map(
    blocks.map((block) => [
      block.id,
      block,
    ]),
  );

  return assemblies.flatMap((assembly) => [
    ...nameMatches(assembly),
    ...sphereListed(assembly),
    ...listIsSound(assembly, known),
    ...dependenciesHold(assembly, known),
  ]);
};

export { assembliesRule };
