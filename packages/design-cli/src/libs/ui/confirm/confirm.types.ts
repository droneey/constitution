interface ConfirmWordsInput {
  /** the BCP 47 tag of the words' language, which joins them where they are read out */
  readonly locale: string;
  readonly no: string;
  readonly yes: string;
}

/** the key of each answer, in lower case */
interface ConfirmKeys {
  readonly no: string;
  readonly yes: string;
}

export type { ConfirmKeys, ConfirmWordsInput };
