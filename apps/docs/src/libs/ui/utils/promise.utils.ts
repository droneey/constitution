// Why: React's `use` reads these outcomes in a promise's `status`.
enum PromiseStatus {
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

type TrackedPromise<TValue> = Promise<TValue> & {
  reason?: unknown;
  status?: PromiseStatus;
  value?: TValue;
};

// Why: a component that reads a promise already settled then renders in the same pass instead of
// suspending for a turn.
function trackedForUse<TValue>(promise: Promise<TValue>): Promise<TValue> {
  const tracked: TrackedPromise<TValue> = promise;

  tracked.then(
    (fulfilledValue) => {
      tracked.status = PromiseStatus.Fulfilled;
      tracked.value = fulfilledValue;
    },
    (reason: unknown) => {
      tracked.status = PromiseStatus.Rejected;
      tracked.reason = reason;
    },
  );

  return tracked;
}

export { trackedForUse };
