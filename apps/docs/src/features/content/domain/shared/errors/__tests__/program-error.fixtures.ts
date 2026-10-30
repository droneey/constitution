import { ProgramError } from '#/kernel/errors';

export const failureOf = (call: () => unknown): unknown => {
  try {
    return call();
  } catch (error) {
    return error instanceof ProgramError
      ? {
          code: error.code,
          details: error.details,
        }
      : error;
  }
};
