import type { Theme } from '@droneey/design-cli';
import { formatHeading, padTo, Space, Tone, widthOf } from '@droneey/design-cli';
import type { Command, Help } from 'commander';

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

// Why: commander prints the text added to the help before the help it formats, so each part ends in
// a blank line.
interface HelpLayout {
  readonly examplesOf: (examples: readonly string[]) => string;
  readonly formatHelp: (command: Command, helper: Help) => string;
  readonly leadOf: (command: Command) => string;
}

const createHelpLayout = (input: { theme: Theme }): HelpLayout => {
  const { theme } = input;
  const indent = ' '.repeat(theme.space[Space.Sm]);

  return {
    examplesOf: (examples: readonly string[]): string =>
      [
        formatHeading(theme, 'Examples'),
        ...examples.map(
          (example) => `${indent}${theme.paint(Tone.Muted, EXAMPLE_PROMPT)}${example}`,
        ),
        '',
      ].join('\n'),
    formatHelp: (command: Command, helper: Help): string =>
      [
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
          rows: helper.visibleGlobalOptions(command).map((option) => [
            helper.optionTerm(option),
            helper.optionDescription(option),
          ]),
          theme,
          title: 'Global options',
        }),
        '',
      ].join('\n'),
    leadOf: (command: Command): string => command.description() && `${command.description()}\n`,
  };
};

type HelpExamples = (examples: readonly string[]) => () => string;

const configureHelpLayout = (program: Command, themeOf: () => Theme): HelpExamples => {
  const layout = (): HelpLayout =>
    createHelpLayout({
      theme: themeOf(),
    });

  program
    .addHelpText('beforeAll', ({ command }) => layout().leadOf(command))
    .configureHelp({
      formatHelp: (command, helper) => layout().formatHelp(command, helper),
      showGlobalOptions: true,
    });

  return (examples: readonly string[]) => () => layout().examplesOf(examples);
};

export type { HelpExamples };
export { configureHelpLayout };
