/**
 * Gives on every call the value its first call made, a promise itself and never one chained to it.
 * A make that throws, or whose promise rejects, keeps nothing, so the call after it makes the value
 * again.
 */
const once = <TValue>(make: () => TValue): (() => TValue) => {
  let made:
    | {
        readonly value: TValue;
      }
    | undefined;

  return (): TValue => {
    if (made === undefined) {
      made = {
        value: make(),
      };

      if (made.value instanceof Promise) {
        made.value.then(undefined, () => {
          made = undefined;
        });
      }
    }

    return made.value;
  };
};

export { once };
