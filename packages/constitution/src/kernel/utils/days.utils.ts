import { attempted, isRangeError } from './failures.utils';

const DAY_FORM = /^\d{4}-\d{2}-\d{2}$/;

const dayOf = (text: string): Temporal.PlainDate | undefined =>
  DAY_FORM.test(text)
    ? attempted({
        effect: () => Temporal.PlainDate.from(text),
        isRecognised: isRangeError,
      })
    : undefined;

export { dayOf };
