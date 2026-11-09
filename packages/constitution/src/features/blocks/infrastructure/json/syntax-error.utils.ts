import { isSyntaxError } from '#/kernel/utils';

const syntaxErrorOf = (error: unknown): SyntaxError => {
  if (isSyntaxError(error)) {
    return error;
  }

  throw error;
};

export { syntaxErrorOf };
