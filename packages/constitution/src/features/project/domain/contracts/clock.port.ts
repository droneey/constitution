interface Clock {
  /** the calendar date in the zone the program runs in */
  readonly today: () => Temporal.PlainDate;
}

export type { Clock };
