import { Command } from 'commander';

import type { CommandContext } from '#/shared/cli';
import { linesSection } from '#/shared/cli';

// Stryker disable ArrayDeclaration,StringLiteral: help text commander prints; no caller relies on it
const DESCRIPTION =
  "List each configuration file the project's tools read, the units it serves, its template and the parts it takes.";
const EXAMPLES: readonly string[] = [
  'constitution presets plan',
] as const;
// Stryker restore ArrayDeclaration,StringLiteral

interface PresetsPlanContext extends CommandContext {
  readonly planPresets: (start: string) => readonly string[];
}

/** Claude Code's project, else the folder the run starts in: /constitution:ratify runs it there. */
const createPresetsPlanCommand = (context: PresetsPlanContext): Command =>
  context.withExamples(
    new Command('plan').description(DESCRIPTION).action(async (): Promise<void> => {
      const { places } = context;

      await context.renderer.print([
        linesSection(
          context.planPresets(places.projectDir === '' ? places.cwd : places.projectDir),
        ),
      ]);
    }),
    EXAMPLES,
  );

export { createPresetsPlanCommand };
