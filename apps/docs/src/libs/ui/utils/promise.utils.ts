/** the outcomes React's `use` reads in a promise's `status` */
enum PromiseStatus {
  Fulfilled = 'fulfilled',
  Rejected = 'rejected',
}

/** the fields React's `use` reads on a promise, the convention of React's RFC for first-class promises */
type TrackedPromise<TValue> = Promise<TValue> & {
  reason?: unknown;
  status?: PromiseStatus;
  value?: TValue;
};

/**
 * Writes the promise's outcome, as it settles, where React's `use` reads it, so a component that
 * reads a promise already settled renders in the same pass instead of suspending for a turn
 */
function trackedForUse<TValue>(promise: Promise<TValue>): Promise<TValue> {
  const tracked: TrackedPromise<TValue> = promise;

  tracked.then(
    (value) => {
      tracked.status = PromiseStatus.Fulfilled;
      tracked.value = value;
    },
    (reason: unknown) => {
      tracked.status = PromiseStatus.Rejected;
      tracked.reason = reason;
    },
  );

  return tracked;
}

export { trackedForUse };
