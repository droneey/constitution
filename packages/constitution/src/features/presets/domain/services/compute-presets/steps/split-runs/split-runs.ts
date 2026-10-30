import type { ProjectUnit } from '#/kernel/entities';
import type { BlockId } from '#/kernel/value-objects';
import { configFilePath, UnitPath } from '#/kernel/value-objects';

import type {
  Candidate,
  FilePlan,
  PresetEntry,
  PresetsFinding,
  UnitRun,
} from '../../../../entities';
import { EntryPoint, PresetsCode, Setting } from '../../../../entities';
import { TargetKind } from '../../../../value-objects';
import type { MergedCandidate } from '../merge-entries';
import { markBlocks } from './steps/mark-blocks';

interface SplitRunsInput {
  readonly candidates: readonly Candidate[];
  readonly entries: readonly PresetEntry[];
  readonly merged: readonly MergedCandidate[];
  readonly units: readonly ProjectUnit[];
}

interface RunsSplit {
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
  readonly runs: readonly UnitRun[];
}

const entryPoints: readonly EntryPoint[] = Object.values(EntryPoint);

const entryPointCommandsOf = ([name, held]: [
  string,
  Setting,
]):
  | readonly [
      EntryPoint,
      readonly string[],
    ]
  | undefined => {
  const entryPoint = entryPoints.find((known) => known === name);

  return entryPoint !== undefined &&
    Setting.isList(held) &&
    held.every((listed) => typeof listed === 'string')
    ? [
        entryPoint,
        held,
      ]
    : undefined;
};

const commandsOf = (setting: Setting | undefined): UnitRun['commands'] | undefined => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: a run that is no map holds no list of commands
  if (!Setting.isMap(setting)) {
    return undefined;
  }

  const lists = Object.entries(setting).map(entryPointCommandsOf);

  return lists.every((list) => list !== undefined) ? new Map(lists) : undefined;
};

const runOf = (
  run: Extract<
    MergedCandidate,
    {
      readonly kind: TargetKind.Run;
    }
  >,
): UnitRun | PresetsFinding => {
  const commands = commandsOf(run.merged.value);

  return commands === undefined
    ? {
        code: PresetsCode.RunMisshapen,
        details: {},
        path: UnitPath.pathOf(run.unit.path, configFilePath),
      }
    : {
        commands,
        unitPath: run.unit.path,
      };
};

const filePlanOf = (input: {
  entries: readonly PresetEntry[];
  file: Extract<
    MergedCandidate,
    {
      readonly kind: TargetKind.File;
    }
  >;
}): FilePlan => {
  const { file } = input;
  const format = file.entries.find((entry) => entry.format !== undefined)?.format;
  const marks = markBlocks({
    contributions: file.contributions,
    entries: input.entries,
    merged: file.merged.value,
    written: file.entries,
  });

  return {
    entries: file.entries,
    filePath: file.filePath,
    ...(format === undefined
      ? {}
      : {
          format,
        }),
    ...(marks === undefined
      ? {}
      : {
          marks,
        }),
    merged: file.merged,
    unitPath: file.unit.path,
  };
};

const isRun = (outcome: UnitRun | PresetsFinding): outcome is UnitRun => 'commands' in outcome;

const isFinding = (outcome: UnitRun | PresetsFinding): outcome is PresetsFinding => !isRun(outcome);

const runnersOf = (entries: readonly PresetEntry[]): ReadonlySet<BlockId> =>
  new Set(
    entries
      .filter((entry) => entry.kind === TargetKind.Run)
      .map((entry) => entry.set.placeInPresets.reader),
  );

const toolsOf = (input: {
  entries: readonly PresetEntry[];
  runners: ReadonlySet<BlockId>;
}): ReadonlySet<BlockId> =>
  new Set(
    input.entries
      .filter((entry) => input.runners.has(entry.set.placeInPresets.reader))
      .flatMap((entry) => entry.set.placeInPresets.withs),
  );

const unrunFindings = (input: SplitRunsInput): readonly PresetsFinding[] => {
  const runners = runnersOf(input.entries);
  const runnable = toolsOf({
    entries: input.entries,
    runners,
  });

  return input.units.flatMap((unit) => {
    const run = toolsOf({
      entries: input.candidates
        .filter((candidate) => UnitPath.equals(candidate.unit.path, unit.path))
        .flatMap((candidate): readonly PresetEntry[] => candidate.entries),
      runners,
    });

    return [
      ...unit.blocks,
    ]
      .filter((block) => runnable.has(block) && !run.has(block))
      .map((block) => ({
        code: PresetsCode.ToolWithoutRunner,
        details: {
          block,
        },
        path: UnitPath.pathOf(unit.path, configFilePath),
      }));
  });
};

const splitRuns = (input: SplitRunsInput): RunsSplit => {
  const files: FilePlan[] = [];
  const outcomes: (UnitRun | PresetsFinding)[] = [];

  for (const candidate of input.merged) {
    switch (candidate.kind) {
      case TargetKind.File:
        files.push(
          filePlanOf({
            entries: input.entries,
            file: candidate,
          }),
        );

        break;
      case TargetKind.Run:
        outcomes.push(runOf(candidate));

        break;
      // Stryker disable next-line ConditionalExpression: no kind reaches the default, which only the compiler reads
      default:
        return candidate satisfies never;
    }
  }

  return {
    files,
    findings: [
      ...outcomes.filter(isFinding),
      ...unrunFindings(input),
    ],
    runs: outcomes.filter(isRun),
  };
};

export type { RunsSplit };
export { splitRuns };
