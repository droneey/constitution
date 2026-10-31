import { sessionsFolderInProject } from '#/kernel/constants';
import { AbsolutePath } from '#/kernel/value-objects';

import type {
  IgnoredInput,
  TreeSnapshot,
  TreeState,
  UnreadTree,
  WorkingTree,
} from '../domain/contracts';
import { IgnoreAnswer, TreeStateStatus } from '../domain/contracts';
import { FileSignature, TreeFingerprint } from '../domain/value-objects';

interface FakeWorkingTree {
  readonly changed?: readonly string[];
  readonly fileSignatures?: Readonly<Record<string, string>>;
  readonly ignored?: readonly string[];
  readonly mainCheckout?: string;
  readonly repositoryFolderPath?: string;
  readonly state?: string | UnreadTree;
}

const noRepository: UnreadTree = {
  status: TreeStateStatus.NoRepository,
};

const stateOf = (state: string | UnreadTree = 'tree'): TreeState =>
  typeof state === 'string'
    ? {
        fingerprint: TreeFingerprint.create(state),
        status: TreeStateStatus.Read,
      }
    : state;

const createFakeWorkingTree = (tree: FakeWorkingTree = {}): WorkingTree => {
  const isOwn = (repositoryFolderPath: AbsolutePath): boolean =>
    tree.repositoryFolderPath === undefined || repositoryFolderPath === tree.repositoryFolderPath;

  const ignored = tree.ignored ?? [
    sessionsFolderInProject,
  ];

  return {
    isIgnored: (asked: IgnoredInput): IgnoreAnswer => {
      if (!isOwn(asked.repositoryFolderPath)) {
        return IgnoreAnswer.Unknown;
      }

      return ignored.includes(asked.path) ? IgnoreAnswer.Ignored : IgnoreAnswer.NotIgnored;
    },
    mainCheckoutOf: (folderPath: AbsolutePath): AbsolutePath | undefined => {
      if (!isOwn(folderPath)) {
        return undefined;
      }

      return tree.mainCheckout === undefined ? folderPath : AbsolutePath.create(tree.mainCheckout);
    },
    snapshotOf: (repositoryFolderPath: AbsolutePath): TreeSnapshot => {
      const state = stateOf(isOwn(repositoryFolderPath) ? tree.state : noRepository);

      return state.status === TreeStateStatus.Read
        ? {
            fileSignatures: new Map(
              Object.entries(
                tree.fileSignatures ??
                  Object.fromEntries(
                    (tree.changed ?? []).map((path) => [
                      path,
                      'changed',
                    ]),
                  ),
              ).map(([path, signature]) => [
                AbsolutePath.join(repositoryFolderPath, path),
                FileSignature.create(signature),
              ]),
            ),
            status: TreeStateStatus.Read,
          }
        : state;
    },
    stateOf: (repositoryFolderPath: AbsolutePath): TreeState =>
      stateOf(isOwn(repositoryFolderPath) ? tree.state : noRepository),
  };
};

export { createFakeWorkingTree };
