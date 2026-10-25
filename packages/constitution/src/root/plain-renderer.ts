import type { Theme } from '@droneey/design-cli';
import { formatKeyValues, formatNote, formatStep, formatTaskList } from '@droneey/design-cli';

import type { CommandIo, Renderer, Report, Section, Task } from '#/shared/cli';
import { SectionKind } from '#/shared/cli';

const sectionTextOf = (input: { section: Section; theme: Theme }): string => {
  const { section, theme } = input;

  switch (section.kind) {
    case SectionKind.Lines:
      return section.lines.join('\n');
    case SectionKind.Note:
      return formatNote(theme, section.note);
    case SectionKind.Pairs:
      return formatKeyValues(theme, section.pairs);
    default: {
      // Steps, the one kind left: a kind added to the union fails to compile here
      const steps: Extract<
        Section,
        {
          kind: SectionKind.Steps;
        }
      > = section;

      return formatTaskList(theme, steps.steps);
    }
  }
};

const formatReport = (input: { report: Report; theme: Theme }): string =>
  input.report
    .map((section) =>
      sectionTextOf({
        section,
        theme: input.theme,
      }),
    )
    .join('\n\n');

const createPlainRenderer = (input: { io: CommandIo; theme: Theme }): Renderer => ({
  print: async (report: Report): Promise<void> => {
    const text = formatReport({
      report,
      theme: input.theme,
    });

    if (text !== '') {
      input.io.write(`${text}\n`);
    }

    await Promise.resolve();
  },
  run: async <TResult>(task: Task<TResult>): Promise<TResult> => {
    const returned = await task.run();

    input.io.writeError(
      `${formatStep(input.theme, {
        ...task.outcomeOf(returned),
        label: task.label,
      })}\n`,
    );

    return returned;
  },
});

export { createPlainRenderer };
