import type { ActiveBlock, ConfigReadStatus, MustRule } from '#/kernel/entities';
import { firstBy } from '#/kernel/utils';
import type { AbsolutePath, RepositoryRelativePath } from '#/kernel/value-objects';
import { Glob, repositoryUnit, UnitPath } from '#/kernel/value-objects';

/**
 * What a session keeps for the hooks that follow its start: while constitution.yaml does not
 * parse, no rule of a block applies and no check gates the hand-back.
 */
type SessionState =
  | {
      readonly repositoryFolderPath: AbsolutePath;
      readonly status: ConfigReadStatus.Unparsed;
    }
  | {
      readonly active: readonly ActiveBlock[];
      readonly musts: readonly MustRule[];
      readonly repositoryFolderPath: AbsolutePath;
      readonly status: ConfigReadStatus.Parsed;
    };

type ParsedState = Extract<
  SessionState,
  {
    readonly status: ConfigReadStatus.Parsed;
  }
>;

const deeperOf = (deepest: UnitPath, unit: UnitPath): UnitPath =>
  // Stryker disable next-line EqualityOperator: two units of one length that both hold a path are one unit
  unit.length > deepest.length ? unit : deepest;

const unitHolding = (state: ParsedState, path: RepositoryRelativePath): UnitPath =>
  state.active
    .map((block) => block.unit)
    .filter((unit) => !UnitPath.isRepository(unit) && UnitPath.holds(unit, path))
    .reduce(deeperOf, repositoryUnit);

/**
 * The active blocks that govern a file, each once: those of the deepest unit that holds it whose
 * globs match its path from that unit.
 */
const governing = (state: ParsedState, path: RepositoryRelativePath): readonly ActiveBlock[] => {
  const unit = unitHolding(state, path);
  const inner = UnitPath.pathFrom(unit, path);
  const matching = state.active.filter(
    (block) =>
      UnitPath.equals(block.unit, unit) &&
      Glob.matchesAny({
        globs: block.governs,
        path: inner,
      }),
  );

  return [
    ...firstBy(matching, (block) => block.id).values(),
  ];
};

const SessionState = {
  governing,
} as const;

export type { ParsedState };
export { SessionState };
