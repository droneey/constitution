import { describe, expect, it } from 'bun:test';

import { ColourLevel, createTheme, ThemeMode } from '@droneey/design-cli';
import { Command } from 'commander';

import { createHelpLayout } from '../help.utils';

const theme = createTheme({
  colourLevel: ColourLevel.None,
  isMotionReduced: true,
  mode: ThemeMode.Dark,
});

const createProgram = (): Command => {
  const program = new Command('constitution')
    .description('The rules a repository is built by.')
    .option('--plain', 'print plain text')
    .option('-q, --quiet', 'print only failures');

  program.command('check').description('Check the blocks and the project.');
  program.command('wiring').description('List the parts each configuration takes.');

  return program;
};

describe('createHelpLayout', () => {
  it('should lay out what the program does and its examples before its usage, commands and options', () => {
    // Arrange
    const program = createProgram().configureHelp(
      createHelpLayout({
        examplesOf: () => [
          'constitution check',
        ],
        theme,
      }),
    );

    // Act
    const help = program.helpInformation();

    // Assert
    expect(help.split('\n')).toStrictEqual([
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

  it('should leave out the examples and the arguments when a command has none', () => {
    // Arrange
    const command = new Command('wiring')
      .description('List the parts.')
      .argument('<unit>', 'the unit to list')
      .helpOption(false)
      .configureHelp(
        createHelpLayout({
          examplesOf: () => [],
          theme,
        }),
      );

    // Act
    const help = command.helpInformation();

    // Assert
    expect(help.split('\n')).toStrictEqual([
      'List the parts.',
      '',
      'Usage',
      '  wiring <unit>',
      '',
      'Arguments',
      '  unit  the unit to list',
      '',
    ]);
  });

  it('should list the options of the program after those of a command when it shows them', () => {
    // Arrange
    const check = createProgram()
      .commands.find((command) => command.name() === 'check')
      ?.configureHelp({
        ...createHelpLayout({
          examplesOf: () => [],
          theme,
        }),
        showGlobalOptions: true,
      });

    // Act
    const help = check?.helpInformation() ?? '';

    // Assert
    expect(help.split('\n')).toStrictEqual([
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
