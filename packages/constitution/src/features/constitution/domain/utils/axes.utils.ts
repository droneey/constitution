import { Axis } from '#/kernel/constants';

// architecture/ and workflow/ may refer to foundation/, never to each other; foundation/ refers only
// to itself.
const mayReachAxis = (input: { from: Axis; to: Axis }): boolean =>
  input.to === input.from || input.to === Axis.Foundation;

export { mayReachAxis };
