/** what `act` throws, or undefined when it returns */
const failureOf = (act: () => unknown): unknown => {
  try {
    act();
  } catch (error) {
    return error;
  }

  return undefined;
};

export { failureOf };
