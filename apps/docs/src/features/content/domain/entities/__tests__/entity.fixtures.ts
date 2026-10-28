import { ProgramError } from '#/kernel/errors';

/** the code and the details a call failed with, or the error itself when it is none of the program's */
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
