import { attempted, isRangeError } from './failures.utils';

const DAY_FORM = /^\d{4}-\d{2}-\d{2}$/;

/** The calendar day a text names, or undefined when it is no day written YYYY-MM-DD. */
const dayOf = (text: string): Temporal.PlainDate | undefined =>
  DAY_FORM.test(text)
    ? attempted({
        effect: () => Temporal.PlainDate.from(text),
        isRecognised: isRangeError,
      })
    : undefined;

export { dayOf };
