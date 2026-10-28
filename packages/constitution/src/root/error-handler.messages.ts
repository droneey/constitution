import { TreeFailure } from '#/features/blocks';
import { ApplyFailure } from '#/features/presets';
import type { ProjectError } from '#/features/project';
import { ReleaseFailure, UnreadableFileFailure } from '#/features/project';

import { ConfigurationFailure } from './configuration.error';

const ISSUES = 'https://github.com/droneey/constitution/issues';
const DOCTOR = 'run constitution doctor, which says what is wrong with the installation';
const DAMAGED = 'the installed release is damaged';
const REINSTALL = 'reinstall it: run mise install --force github:droneey/constitution';
const GIT_STATUS = 'run git status there, which says what git cannot read';

const projectFailureMessages: Readonly<Record<ProjectError['code'], (path: string) => string>> = {
  [UnreadableFileFailure.Config]: (path) => `cannot read ${path}`,
  [UnreadableFileFailure.Core]: (path) => `${DAMAGED}: cannot read ${path}`,
  [ReleaseFailure.BlocksUnlisted]: (path) => `${DAMAGED}: cannot list the blocks of ${path}`,
};

const PROJECT_FAILURE_HINTS = {
  [UnreadableFileFailure.Config]: 'make constitution.yaml readable',
  [UnreadableFileFailure.Core]: REINSTALL,
  [ReleaseFailure.BlocksUnlisted]: REINSTALL,
} as const satisfies Readonly<Record<ProjectError['code'], string>>;

const treeFailureMessages: Readonly<Record<TreeFailure, (path: string) => string>> = {
  [TreeFailure.Failed]: (path) => `git could not list the files of ${path}`,
  [TreeFailure.TimedOut]: (path) => `git did not list the files of ${path} in time`,
  [TreeFailure.Unreadable]: (path) => `cannot read ${path}`,
  [TreeFailure.TooLarge]: (path) => `the blocks of ${path} hold more files than a release does`,
};

const TREE_FAILURE_HINTS = {
  [TreeFailure.Failed]: GIT_STATUS,
  [TreeFailure.TimedOut]: GIT_STATUS,
  [TreeFailure.Unreadable]: 'make the file readable, or remove it from the tree',
  [TreeFailure.TooLarge]: DOCTOR,
} as const satisfies Readonly<Record<TreeFailure, string>>;

const applyFailureMessages: Readonly<Record<ApplyFailure, (filePath: string) => string>> = {
  [ApplyFailure.NotWritten]: (filePath) => `cannot write ${filePath}, so the apply wrote nothing`,
};

const APPLY_FAILURE_HINT = 'make the file writable, then run constitution presets apply again';

interface ConfiguredInput {
  readonly variable: string;
  readonly written: string;
}

const configurationFailureMessages: Readonly<
  Record<ConfigurationFailure, (configured: ConfiguredInput) => string>
> = {
  [ConfigurationFailure.DayMalformed]: ({ variable, written }) =>
    `${variable} is "${written}", which is no date written YYYY-MM-DD`,
};

const configurationHintMessage = (variable: string): string =>
  `unset ${variable}, which only the program's specs set`;

const OPTIONS_UNPARSED = 'the options do not parse';

const DEFECT = 'the run stopped on an error of its own';
const defectHint = `report it at ${ISSUES}`;
const defectLine = `${DEFECT}; ${defectHint}`;

export {
  APPLY_FAILURE_HINT,
  applyFailureMessages,
  configurationFailureMessages,
  configurationHintMessage,
  DEFECT,
  defectHint,
  defectLine,
  OPTIONS_UNPARSED,
  PROJECT_FAILURE_HINTS,
  projectFailureMessages,
  TREE_FAILURE_HINTS,
  treeFailureMessages,
};
