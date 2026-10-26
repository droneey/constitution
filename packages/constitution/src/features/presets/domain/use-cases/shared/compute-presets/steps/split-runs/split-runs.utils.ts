import { CONFIG_FILE } from '#/kernel/constants';
import type { ProjectUnit } from '#/kernel/entities';
import { UnitPath } from '#/kernel/value-objects';

import type { FilePlan, PresetEntry, PresetsFinding, UnitRun } from '../../../../../entities';
import { PresetsCode, Setting } from '../../../../../entities';
import { TargetFile } from '../../../../../value-objects';
import type { Candidate } from '../select-entries';

interface SplitRunsInput {
  readonly candidates: readonly Candidate[];
  readonly entries: readonly PresetEntry[];
  readonly files: readonly FilePlan[];
  readonly units: readonly ProjectUnit[];
}

interface RunsSplit {
  readonly files: readonly FilePlan[];
  readonly findings: readonly PresetsFinding[];
  readonly runs: readonly UnitRun[];
}

const SEPARATOR = '/';

const isRunFile = (file: string): boolean =>
  file.slice(file.lastIndexOf(SEPARATOR) + 1) === TargetFile.runPath;

const commandsOf = (setting: Setting | undefined): UnitRun['commands'] | undefined => {
  // Stryker disable next-line ConditionalExpression,BlockStatement: a run that is no map holds no list of commands
  if (!Setting.isMap(setting)) {
    return undefined;
  }

  const lists = Object.entries(setting).map(([name, held]) => ({
    commands:
      Setting.isList(held) && held.every((listed) => typeof listed === 'string') ? held : undefined,
    name,
  }));

  return lists.every(({ commands }) => commands !== undefined)
    ? new Map(
        lists.map(({ commands, name }) => [
          name,
          // Stryker disable next-line ArrayDeclaration: every list was found to be one
          commands ?? [],
        ]),
      )
    : undefined;
};

const runOf = (plan: FilePlan): UnitRun | PresetsFinding => {
  const commands = commandsOf(plan.merged.value);

  return commands === undefined
    ? {
        code: PresetsCode.RunMisshapen,
        details: {},
        path: UnitPath.pathOf(plan.unit, CONFIG_FILE),
      }
    : {
        commands,
        unit: plan.unit,
      };
};

const isRun = (outcome: UnitRun | PresetsFinding): outcome is UnitRun => 'commands' in outcome;

const isFinding = (outcome: UnitRun | PresetsFinding): outcome is PresetsFinding => !isRun(outcome);

// A runner is the reader of a preset file that gives what the program runs; a tool is a block its
// preset files pair with a runner, in whatever language.
const runnersOf = (entries: readonly PresetEntry[]): ReadonlySet<string> =>
  new Set(
    entries.filter((entry) => TargetFile.isRun(entry.file)).map((entry) => entry.set.path.reader),
  );

const toolsOf = (input: {
  entries: readonly PresetEntry[];
  runners: ReadonlySet<string>;
}): ReadonlySet<string> =>
  new Set(
    input.entries
      .filter((entry) => input.runners.has(entry.set.path.reader))
      .flatMap((entry) => entry.set.path.withs),
  );

// A tool some runner runs, which a unit follows and none of its runners runs, is never run there.
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
        .flatMap((candidate) => candidate.entries),
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
        path: UnitPath.pathOf(unit.path, CONFIG_FILE),
      }));
  });
};

const splitRuns = (input: SplitRunsInput): RunsSplit => {
  const outcomes = input.files.filter(({ file }) => isRunFile(file)).map(runOf);

  return {
    files: input.files.filter(({ file }) => !isRunFile(file)),
    findings: [
      ...outcomes.filter(isFinding),
      ...unrunFindings(input),
    ],
    runs: outcomes.filter(isRun),
  };
};

export type { RunsSplit };
export { splitRuns };
