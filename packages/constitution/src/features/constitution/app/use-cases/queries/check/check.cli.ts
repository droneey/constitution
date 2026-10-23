import type { RunnableCommand } from '@bunli/core';
import { defineCommand, option } from '@bunli/core';
import { z } from 'zod';

import type { ProjectWarning } from '../../../../domain/entities';
import type { Validation } from '../../../../domain/use-cases/queries';
import type { CommandRun } from '../../../types';

const PREFIX = 'constitution check';
const OPTIONS = {
  // Stryker disable next-line ObjectLiteral: help text bunli prints; no caller relies on it
  base: option(z.string().optional(), {
    // Stryker disable next-line StringLiteral: help text bunli prints; no caller relies on it
    description: 'The installed Constitution a pack extends, such as .droneey/constitution',
  }),
};

interface CheckContext extends CommandRun {
  readonly checkProject: (start: string) => readonly ProjectWarning[] | undefined;
  // whether a folder holds blocks: a Constitution or a pack
  readonly holdsBlocks: (folder: string) => boolean;
  readonly validateConstitution: (input: { base: string | undefined; root: string }) => Validation;
}

// The blocks of the folder, with what the check advises; whether it found any.
const writeBlocks = (input: { base: string | undefined; context: CheckContext }): boolean => {
  const { context } = input;
  const { advice, findings } = context.validateConstitution({
    base: input.base,
    root: context.places.cwd,
  });
  const lines = [
    // The code closes the line, as a linter's rule id does.
    ...findings.map((finding) => `${finding.path}: ${finding.message} [${finding.code}]`),
    findings.length === 0
      ? 'blocks: every block is sound'
      : `blocks: ${findings.length} finding(s)`,
    ...advice,
  ];

  context.io.write(lines.map((line) => `${line}\n`).join(''));

  return findings.length > 0;
};

// The warnings of the project around the folder, as a session's digest gives them; whether it
// gave any.
const writeProject = (
  warnings: readonly ProjectWarning[],
): {
  isWarned: boolean;
  text: string;
} => ({
  isWarned: warnings.length > 0,
  text: [
    ...warnings.map((warning) => `- ${warning.code}: ${warning.message}`),
    warnings.length === 0
      ? 'project: constitution.yaml and its wiring are sound'
      : `project: ${warnings.length} warning(s)`,
  ]
    .map((line) => `${line}\n`)
    .join(''),
});

// The blocks of the folder it runs in, when it holds a Constitution or a pack; then the declaration
// and the wiring of the project around it, when there is one.
const createCheckCommand = (context: CheckContext): RunnableCommand<typeof OPTIONS> =>
  defineCommand({
    description:
      // Stryker disable next-line StringLiteral: help text bunli prints; no caller relies on it
      'Check the blocks of a Constitution or a pack, and the constitution.yaml and wiring of the project. Examples: constitution check; constitution check --base .droneey/constitution',
    handler: async ({ flags }): Promise<void> => {
      await context.run({
        prefix: PREFIX,
        work: (): void => {
          const hasFindings =
            context.holdsBlocks(context.places.cwd) &&
            writeBlocks({
              base: flags.base,
              context,
            });
          const warnings = context.checkProject(context.places.cwd);
          const project = warnings === undefined ? undefined : writeProject(warnings);

          if (project !== undefined) {
            context.io.write(project.text);
          }

          if (hasFindings || project?.isWarned === true) {
            context.setFailed();
          }
        },
      });
    },
    name: 'check',
    options: OPTIONS,
  });

export { createCheckCommand };
