import type { GenerateThemes } from '../../../../application/use-cases/commands/generate-themes';
import { ConfigModuleError } from '../../../../domain/errors';
import { ExitCode } from '../../../constants';
import { failureLine, usageLine } from './generate-themes.messages';

interface GenerateThemesCommandInput {
  readonly args: readonly string[];
  readonly generateThemes: GenerateThemes;
  readonly writeError: (text: string) => void;
}

const GENERATE_COMMAND = 'generate';

const isGenerateCommand = (
  args: readonly string[],
): args is readonly [
  typeof GENERATE_COMMAND,
  string,
] => args.length === 2 && args[0] === GENERATE_COMMAND;

// Why: bad arguments and a refused module end in ExitCode.Failure with a written line, so only
// UnknownDefaultModeError escapes.
/** @throws {UnknownDefaultModeError} when the modifier's default names no context */
const runGenerateThemes = async ({
  args,
  generateThemes,
  writeError,
}: GenerateThemesCommandInput): Promise<ExitCode> => {
  if (!isGenerateCommand(args)) {
    writeError(usageLine(GENERATE_COMMAND));

    return ExitCode.Failure;
  }

  try {
    await generateThemes(args[1]);
  } catch (error) {
    if (!(error instanceof ConfigModuleError)) {
      throw error;
    }

    writeError(failureLine(error.message));

    return ExitCode.Failure;
  }

  return ExitCode.Success;
};

export { runGenerateThemes };
