const onceSucceeded = <TValue>(make: () => TValue): (() => TValue) => {
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

export { onceSucceeded };
