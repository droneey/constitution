import { InvalidValueError } from '../invalid-value.error';

export const failureOf = (create: () => unknown): unknown => {
  try {
    return create();
  } catch (error) {
    return error instanceof InvalidValueError
      ? {
          code: error.code,
          details: error.details,
        }
      : error;
  }
};
