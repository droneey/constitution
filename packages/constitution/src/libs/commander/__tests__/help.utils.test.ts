import { describe, expect, it } from 'bun:test';

import { ColourLevel, createTheme, ThemeMode } from '@droneey/design-cli';
import { Command } from 'commander';

import type { HelpExamples } from '../help.utils';
import { configureHelpLayout } from '../help.utils';

const theme = createTheme({
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: ThemeMode.Dark,
});

// A program laid out, its help written to a buffer, and the text of examples for its commands.
const createProgram = (): {
  readonly help: () => readonly string[];
  readonly helpExamples: HelpExamples;
  readonly program: Command;
} => {
  let written = '';
  const program = new Command('constitution')
    .description('The rules a repository is built by.')
    .option('--plain', 'print plain text')
    .option('-q, --quiet', 'print only failures')
    .configureOutput({
      writeOut: (text: string): void => {
        written += text;
      },
    });
  const helpExamples = configureHelpLayout(program, () => theme);

  for (const [name, description] of [
    [
      'check',
      'Check the blocks and the project.',
    ],
    [
      'wiring',
      'List the parts each configuration takes.',
    ],
  ] as const) {
    program.command(name).description(description);
  }

  return {
    help: () => written.split('\n'),
    helpExamples,
    program,
  };
};

describe('configureHelpLayout', () => {
  it('should lay out what the program does and its examples before its usage, commands and options', () => {
    // Arrange
    const { help, helpExamples, program } = createProgram();

    program.addHelpText(
      'before',
      helpExamples([
        'constitution check',
      ]),
    );

    // Act
    program.outputHelp();

    // Assert
    expect(help()).toStrictEqual([
      'The rules a repository is built by.',
      '',
      'Examples',
      '  $ constitution check',
      '',
      'Usage',
      '  constitution [options] [command]',
      '',
      'Commands',
      '  check           Check the blocks and the project.',
      '  wiring          List the parts each configuration takes.',
      '  help [command]  display help for command',
      '',
      'Options',
      '  --plain      print plain text',
      '  -q, --quiet  print only failures',
      '  -h, --help   display help for command',
      '',
    ]);
  });

  it('should open with the usage, and list the arguments, when the command says nothing of what it does', () => {
    // Arrange
    const { help, program } = createProgram();
    const command = program
      .command('list')
      .argument('<unit>', 'the unit to list')
      .helpOption(false);

    // Act
    command.outputHelp();

    // Assert
    expect(help()).toStrictEqual([
      'Usage',
      '  constitution list <unit>',
      '',
      'Arguments',
      '  unit  the unit to list',
      '',
      'Global options',
      '  --plain      print plain text',
      '  -q, --quiet  print only failures',
      '',
    ]);
  });

  it('should leave out the examples, and list the options of the program after its own, when the command has none', () => {
    // Arrange
    const { help, program } = createProgram();
    const check = program.commands.find((command) => command.name() === 'check');

    // Act
    check?.outputHelp();

    // Assert
    expect(help()).toStrictEqual([
      'Check the blocks and the project.',
      '',
      'Usage',
      '  constitution check [options]',
      '',
      'Options',
      '  -h, --help  display help for command',
      '',
      'Global options',
      '  --plain      print plain text',
      '  -q, --quiet  print only failures',
      '',
    ]);
  });
});
