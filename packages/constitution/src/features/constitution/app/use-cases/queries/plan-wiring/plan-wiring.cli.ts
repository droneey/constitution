import type { Command } from '@bunli/core';
import { defineCommand } from '@bunli/core';

import type { CommandRun } from '../../../types';

const PREFIX = 'constitution wiring';

interface PlanWiringContext extends CommandRun {
  readonly planWiring: (start: string) => readonly string[];
}

// The configuration files the project's tools read, for /ratify to write.
const createPlanWiringCommand = (context: PlanWiringContext): Command =>
  defineCommand({
    description:
      // Stryker disable next-line StringLiteral: help text bunli prints; no caller relies on it
      "List each configuration file the project's tools read, the units it serves, its template and the parts it takes. Example: constitution wiring",
    handler: async (): Promise<void> => {
      await context.run({
        prefix: PREFIX,
        work: (): void => {
          const { places } = context;
          const lines = context.planWiring(
            places.projectDir === '' ? places.cwd : places.projectDir,
          );

          context.io.write(lines.map((line) => `${line}\n`).join(''));
        },
      });
    },
    name: 'wiring',
  });

export { createPlanWiringCommand };
