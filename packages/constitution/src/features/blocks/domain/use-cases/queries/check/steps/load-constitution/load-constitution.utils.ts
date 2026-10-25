import { LAYERS, PRESETS_FOLDER, TEMPLATES_FOLDER } from '#/kernel/constants';
import type {
  RequirementsTableDetails,
  RuleFormDetails,
  ValueFindingDetails,
} from '#/kernel/entities';
import type { FindingOf } from '#/kernel/types';
import { compareText, normalizePath } from '#/kernel/utils';
import type { BlockId } from '#/kernel/value-objects';

import type {
  BindingsParser,
  FileTree,
  FrontMatterParser,
  ManifestParser,
} from '../../../../../contracts';
import type { Constitution, PresetFile } from '../../../../../entities';
import { Block } from '../../../../../entities';
import type { BlockLoadDetails, FrontMatterReadDetails, PlaceDetails } from './steps/load-blocks';
import { loadBlocks } from './steps/load-blocks';
import { parseBlockRules } from './steps/parse-rules';
import type { BindingsFileDetails } from './steps/read-bindings';
import { readBindings } from './steps/read-bindings';
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
type LoadFindingDetails = BindingsFileDetails &
  BlockLoadDetails &
  FrontMatterReadDetails &
  LoadDetails &
  PlaceDetails;

/** A finding of loading the Constitution, its rules' parse included. */
type LoadFinding = FindingOf<
  LoadFindingDetails & RequirementsTableDetails & RuleFormDetails & ValueFindingDetails
>;

/** The installed Constitution a pack extends. */
interface Base {
  /** where the base was read from, as the check was given it */
  readonly folder: string;
  readonly tree: FileTree;
}

interface ConstitutionLoaded {
  readonly constitution: Constitution;
  readonly findings: readonly LoadFinding[];
}

const presetsPrefix = `${PRESETS_FOLDER}/`;
const templatesPrefix = `${TEMPLATES_FOLDER}/`;

const byLayerThenId = (left: Block, right: Block): number =>
  LAYERS.indexOf(left.layer) - LAYERS.indexOf(right.layer) || compareText(left.id, right.id);

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

const SEPARATOR = '/';

// normalizePath drops a leading "/", which a base given from the root keeps.
const folderOf = (base: Base): string =>
  `${base.folder.startsWith(SEPARATOR) ? SEPARATOR : ''}${normalizePath(`${base.folder}${SEPARATOR}.`)}`;

interface LoadConstitutionInput {
  readonly base?: Base;
  readonly bindingsParser: BindingsParser;
  readonly frontMatterParser: FrontMatterParser;
  readonly manifestParser: ManifestParser;
  readonly repository: FileTree;
  readonly tree: FileTree;
}

// The tree is the Constitution's own package; the repository is the one that
// holds it, the same tree when the package is the repository. A pack is loaded
// beside the base it extends, so its arrows and requires resolve against it.
const loadConstitution = (input: LoadConstitutionInput): ConstitutionLoaded => {
  const listed = input.tree.list();
  const paths: ReadonlySet<string> = new Set(listed);
  const repositoryPaths: ReadonlySet<string> = new Set(input.repository.list());
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
  ].toSorted(byLayerThenId);
  const parsed = parseBlockRules(blocks);

  const filesUnder = (folder: string): readonly PresetFile[] =>
    listed
      .filter((path) => path.startsWith(folder))
      .map((path) => ({
        path,
        text: input.tree.read(path),
      }));

  const presets = filesUnder(presetsPrefix);
  const bindings = readBindings({
    parser: input.bindingsParser,
    presets,
  });

  return {
    constitution: {
      bindings: bindings.bindings,
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
      presets,
      repositoryPaths,
      requirementAnswers: parsed.answers,
      rules: parsed.rules,
      templates: filesUnder(templatesPrefix),
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
      ...bindings.findings,
    ],
  };
};

export type { Base, ConstitutionLoaded, LoadFindingDetails };
export { LoadCode, loadConstitution };
