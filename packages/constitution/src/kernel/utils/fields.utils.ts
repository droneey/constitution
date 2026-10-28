const fieldsOf = (candidate: unknown): ReadonlyMap<string, unknown> =>
  new Map(Object.entries(candidate ?? {}));

const isDeepEqual = (left: unknown, right: unknown): boolean => {
  if (!(left instanceof Object && right instanceof Object)) {
    return Object.is(left, right);
  }

  const leftFields = fieldsOf(left);
  const rightFields = fieldsOf(right);

  return (
    leftFields.size === rightFields.size &&
    [
      ...leftFields,
    ].every(([key, held]) => rightFields.has(key) && isDeepEqual(held, rightFields.get(key)))
  );
};

export { fieldsOf, isDeepEqual };
