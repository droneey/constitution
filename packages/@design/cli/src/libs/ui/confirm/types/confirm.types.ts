interface ConfirmWordsInput {
  readonly no: string;
  readonly yes: string;
}

/** the key of each answer, in lower case */
interface ConfirmKeys {
  readonly no: string;
  readonly yes: string;
}

export type { ConfirmKeys, ConfirmWordsInput };
