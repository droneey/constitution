import { PATH_SEPARATOR } from '#/kernel/constants';
import type {
  RequirementsTableDetails,
  RuleFormDetails,
  ValueFindingDetails,
} from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import { normalizePath } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';

import type { FileTree, FrontMatterParser, ManifestParser } from '../../../../../contracts';
import type { Constitution, FrontMatterReadDetails } from '../../../../../../domain/entities';
import { Block } from '../../../../../../domain/entities';
import type { BlockLoadDetails, PlaceDetails } from './steps/load-blocks';
import { loadBlocks } from './steps/load-blocks';
import { parseRules } from './steps/parse-rules';
import { readDocuments } from './steps/read-documents';

enum LoadCode {
  BaseDoesNotLoad = 'base-does-not-load',
  IdShared = 'block-id-shared',
}

interface LoadDetails {
  readonly [LoadCode.BaseDoesNotLoad]: object;
  readonly [LoadCode.IdShared]: {
    readonly id: BlockId;
    readonly others: readonly string[];
  };
}

type LoadFindingDetails = BlockLoadDetails & FrontMatterReadDetails & LoadDetails & PlaceDetails;

type LoadFinding = FindingOf<
  LoadFindingDetails & RequirementsTableDetails & RuleFormDetails & ValueFindingDetails
>;

interface BaseTree {
  readonly folder: string;
  readonly tree: FileTree;
}

interface ConstitutionLoaded {
  readonly constitution: Constitution;
  readonly findings: readonly LoadFinding[];
}

const duplicateIdFindings = (blocks: readonly Block[]): readonly LoadFinding[] =>
  blocks.flatMap((block) => {
    const others = blocks.filter(
      (other) => Block.sameAs(other, block) && other.passport.path !== block.passport.path,
    );

    return others.length === 0
      ? []
      : [
          {
            code: LoadCode.IdShared,
            details: {
              id: block.id,
              others: others.map((other) => other.passport.path),
            },
            path: block.passport.path,
          },
        ];
  });

// Why: normalizePath drops a leading "/", which a base given from the root keeps.
const folderOf = (base: BaseTree): string =>
  `${base.folder.startsWith(PATH_SEPARATOR) ? PATH_SEPARATOR : ''}${normalizePath(`${base.folder}${PATH_SEPARATOR}.`)}`;

interface LoadConstitutionInput {
  readonly base?: BaseTree;
  readonly frontMatterParser: FrontMatterParser;
  readonly manifestParser: ManifestParser;
  readonly repository: FileTree;
  readonly tree: FileTree;
}

/**
 * @throws {TreeError} when git cannot list the files of a tree, or a file it lists cannot be
 * read
 */
const loadConstitution = (input: LoadConstitutionInput): ConstitutionLoaded => {
  const listed = input.tree.list();
  const paths = new Set(listed);
  const repositoryPaths = new Set(input.repository.list());
  const own = loadBlocks({
    parser: input.frontMatterParser,
    tree: input.tree,
  });
  const base =
    input.base === undefined
      ? undefined
      : {
          folder: folderOf(input.base),
          loaded: loadBlocks({
            parser: input.frontMatterParser,
            tree: input.base.tree,
          }),
        };
  const blocks = [
    ...own.blocks,
    ...(base === undefined
      ? []
      : base.loaded.blocks.map((block) => Block.asBase(block, base.folder))),
  ].toSorted(Block.compare);
  const parsed = parseRules(blocks);

  return {
    constitution: {
      blocks,
      documents: readDocuments({
        frontMatterParser: input.frontMatterParser,
        listed,
        parser: input.manifestParser,
        paths,
        repository: input.repository,
        repositoryPaths,
        tree: input.tree,
      }),
      paths,
      repositoryPaths,
      requirementAnswers: parsed.answers,
      rules: parsed.rules,
    },
    findings: [
      ...own.findings,
      ...(base !== undefined && base.loaded.findings.length > 0
        ? [
            {
              code: LoadCode.BaseDoesNotLoad,
              details: {},
              path: base.folder,
            } satisfies LoadFinding,
          ]
        : []),
      ...duplicateIdFindings(blocks),
      ...parsed.findings,
    ],
  };
};

export type { BaseTree, ConstitutionLoaded, LoadFindingDetails };
export { LoadCode, loadConstitution };
