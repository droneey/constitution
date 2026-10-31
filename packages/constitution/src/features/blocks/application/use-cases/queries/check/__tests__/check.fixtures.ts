import type { Files, Source } from '../../../../../__tests__/constitution.fixtures';
import { sourceOf } from '../../../../../__tests__/constitution.fixtures';
import { createFakeFileTree } from '../../../../../__tests__/file-tree.fake';
import { BlockGraph } from '../../../../../domain/block-graph/entities';
import { Constitution } from '../../../../../domain/constitution/entities';
import type { CheckInput } from '../../../../../domain/validate-constitution/services';
import type { BaseTree, ConstitutionLoaded } from '../steps/load-constitution';
import { loadConstitution } from '../steps/load-constitution';

interface PackSourceInput {
  readonly base: Readonly<Files>;
  readonly folder?: string;
  readonly pack: Readonly<Files>;
}

const packSourceOf = (
  input: PackSourceInput,
): Source & {
  base: BaseTree;
} => ({
  ...sourceOf(input.pack),
  base: {
    folder: input.folder ?? '.droneey/constitution',
    tree: createFakeFileTree(input.base),
  },
});

const loadedOf = (
  files: Readonly<Files>,
  repositoryFiles: Readonly<Files> = files,
): ConstitutionLoaded => loadConstitution(sourceOf(files, repositoryFiles));

const packLoadedOf = (input: PackSourceInput): ConstitutionLoaded =>
  loadConstitution(packSourceOf(input));

const checkInputOf = (
  files: Readonly<Files>,
  repositoryFiles: Readonly<Files> = files,
): CheckInput => {
  const { constitution, findings } = loadedOf(files, repositoryFiles);

  if (findings.length > 0) {
    throw new Error(
      `The fixture does not load: ${findings.map((finding) => `${finding.path}: ${finding.code} ${JSON.stringify(finding.details)}`).join('; ')}`,
    );
  }

  return {
    graph: BlockGraph.create(constitution.blocks),
    constitution,
    model: Constitution.modelOf(constitution),
  };
};

export { checkInputOf, loadedOf, packLoadedOf, packSourceOf };
