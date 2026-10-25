class InvalidValueError extends Error {
  public readonly field: string;
  public readonly value: string;

  public constructor(input: {
    field: string;
    value: string;
  }) {
    super(`${input.field} "${input.value}" is invalid`);
    this.field = input.field;
    this.value = input.value;
  }
}

export { InvalidValueError };
