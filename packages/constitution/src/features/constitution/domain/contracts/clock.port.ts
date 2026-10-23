interface Clock {
  // the calendar date where the program runs, as YYYY-MM-DD
  today: () => string;
}

export type { Clock };
