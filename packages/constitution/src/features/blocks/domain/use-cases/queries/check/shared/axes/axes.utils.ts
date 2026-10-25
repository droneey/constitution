import { Axis } from '#/kernel/constants';

const mayReachAxis = (input: { from: Axis; to: Axis }): boolean =>
  input.to === input.from || input.to === Axis.Foundation;

export { mayReachAxis };
