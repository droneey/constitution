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
import type { Constitution, FrontMatterReadDetails } from '../../../../../entities';
import { Block } from '../../../../../entities';
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
    /** the passports of the other blocks of that id */
    readonly others: readonly string[];
  };
}

/** What each code of the load steps' own findings names. */
type LoadFindingDetails = BlockLoadDetails & FrontMatterReadDetails & LoadDetails & PlaceDetails;

/** A finding of loading the Constitution, its rules' parse included. */
type LoadFinding = FindingOf<
  LoadFindingDetails & RequirementsTableDetails & RuleFormDetails & ValueFindingDetails
>;

/** The installed Constitution a pack extends, as the tree its blocks load from. */
interface BaseTree {
  /** where the base was read from, as the check was given it */
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

// normalizePath drops a leading "/", which a base given from the root keeps.
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
 * The tree is the Constitution's own package; the repository is the one that holds it, the same
 * tree when the package is the repository. A pack is loaded beside the base it extends, so its
 * arrows and requires resolve against it.
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
