interface Clock {
  readonly today: () => Temporal.PlainDate;
}

export type { Clock };
