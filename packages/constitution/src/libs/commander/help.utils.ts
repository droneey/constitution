import type { Theme } from '@droneey/design-cli';
import { formatHeading, padTo, Space, Tone, widthOf } from '@droneey/design-cli';
import type { Command, Help } from 'commander';

type ExamplesOf = (command: Command) => readonly string[];

const EXAMPLE_PROMPT = '$ ';

const sectionOf = (input: {
  rows: readonly (readonly [
    string,
    string,
  ])[];
  theme: Theme;
  title: string;
}): readonly string[] => {
  const { rows, theme, title } = input;

  if (rows.length === 0) {
    return [];
  }

  const indent = ' '.repeat(theme.space[Space.Sm]);
  const width = Math.max(...rows.map(([term]) => widthOf(term)));

  return [
    '',
    formatHeading(theme, title),
    ...rows.map(([term, description]) =>
      `${indent}${theme.paint(
        Tone.Accent,
        padTo({
          text: term,
          width,
        }),
      )}${indent}${description}`.trimEnd(),
    ),
  ];
};

const createHelpLayout = (input: {
  examplesOf: ExamplesOf;
  theme: Theme;
}): Pick<Help, 'formatHelp'> => ({
  formatHelp: (command: Command, helper: Help): string => {
    const { theme } = input;
    const indent = ' '.repeat(theme.space[Space.Sm]);
    const examples = input.examplesOf(command);

    return [
      helper.commandDescription(command),
      ...(examples.length === 0
        ? []
        : [
            '',
            formatHeading(theme, 'Examples'),
            ...examples.map(
              (example) => `${indent}${theme.paint(Tone.Muted, EXAMPLE_PROMPT)}${example}`,
            ),
          ]),
      '',
      formatHeading(theme, 'Usage'),
      `${indent}${helper.commandUsage(command)}`,
      ...sectionOf({
        rows: helper.visibleCommands(command).map((sub) => [
          helper.subcommandTerm(sub),
          helper.subcommandDescription(sub),
        ]),
        theme,
        title: 'Commands',
      }),
      ...sectionOf({
        rows: helper.visibleArguments(command).map((argument) => [
          helper.argumentTerm(argument),
          helper.argumentDescription(argument),
        ]),
        theme,
        title: 'Arguments',
      }),
      ...sectionOf({
        rows: helper.visibleOptions(command).map((option) => [
          helper.optionTerm(option),
          helper.optionDescription(option),
        ]),
        theme,
        title: 'Options',
      }),
      ...sectionOf({
        rows: (helper.showGlobalOptions ? helper.visibleGlobalOptions(command) : []).map(
          (option) => [
            helper.optionTerm(option),
            helper.optionDescription(option),
          ],
        ),
        theme,
        title: 'Global options',
      }),
      '',
    ]
      .join('\n')
      .trimStart();
  },
});

export type { ExamplesOf };
export { createHelpLayout };
