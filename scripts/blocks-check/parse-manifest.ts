import type { ZodType } from 'zod';

import type { Finding } from './models';

interface Parsed<T> {
  finding?: Finding;
  value?: T;
}

const describe = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

const parseManifest = <T>(input: {
  format: string;
  parse: (text: string) => unknown;
  path: string;
  schema: ZodType<T>;
  text: string;
}): Parsed<T> => {
  let raw: unknown;

  try {
    raw = input.parse(input.text);
  } catch (error) {
    return {
      finding: {
        message: `is not valid ${input.format}: ${describe(error)}`,
        path: input.path,
      },
    };
  }

  const result = input.schema.safeParse(raw);

  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '<root>'}: ${issue.message}`)
      .join('; ');

    return {
      finding: {
        message: `does not match the manifest schema: ${issues}`,
        path: input.path,
      },
    };
  }

  return {
    value: result.data,
  };
};

export type { Parsed };
export { parseManifest };
