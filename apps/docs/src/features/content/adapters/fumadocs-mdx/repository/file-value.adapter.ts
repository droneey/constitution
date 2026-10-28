import { YAMLParseError } from 'yaml';
import type { z } from 'zod';

import { SourceError, SourceFailure } from '../../../domain/errors';

interface FileValueInput<TValue> {
  readonly filePath: string;
  readonly model: z.ZodType<TValue>;
  readonly parseYamlOrJson: () => unknown;
}

const malformedFileError = (filePath: string, cause: unknown): SourceError =>
  new SourceError(
    {
      code: SourceFailure.FileMalformed,
      details: {
        path: filePath,
      },
    },
    {
      cause,
    },
  );

/** @throws {@link SourceError} when the file holds no YAML or JSON, or no value the model takes */
const fileValueOf = <TValue>({
  filePath,
  model,
  parseYamlOrJson,
}: FileValueInput<TValue>): TValue => {
  const parsedFile = (): unknown => {
    try {
      return parseYamlOrJson();
    } catch (error) {
      // yaml throws a ReferenceError for an alias whose anchor the file never sets
      if (
        error instanceof YAMLParseError ||
        error instanceof SyntaxError ||
        error instanceof ReferenceError
      ) {
        throw malformedFileError(filePath, error);
      }

      throw error;
    }
  };

  const checkedFile = model.safeParse(parsedFile());

  if (!checkedFile.success) {
    throw malformedFileError(filePath, checkedFile.error);
  }

  return checkedFile.data;
};

export { fileValueOf };
