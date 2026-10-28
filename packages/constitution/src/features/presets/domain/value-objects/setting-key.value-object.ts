enum KeyKind {
  Plain = 'plain',
  /** `list[field=value]`: the element of the list whose field holds the value */
  Address = 'address',
  /** `list@slot`: items placed where the list holds the slot `{slot: <name>}` */
  Insert = 'insert',
}

type SettingKey =
  | {
      readonly field: string;
      readonly kind: KeyKind.Address;
      readonly list: string;
      readonly value: string;
    }
  | {
      readonly kind: KeyKind.Insert;
      readonly list: string;
      readonly slot: string;
    }
  | {
      readonly kind: KeyKind.Plain;
      readonly text: string;
    };

type AddressKey = Extract<
  SettingKey,
  {
    readonly kind: KeyKind.Address;
  }
>;

const ADDRESS = /(.+)\[([^=\]]+)=(.*)\]$/;
const INSERT = /^([^[\]@]+)@([^[\]@]+)$/;

const of = (text: string): SettingKey => {
  const address = ADDRESS.exec(text);

  if (address !== null) {
    return {
      field: String(address[2]),
      kind: KeyKind.Address,
      list: String(address[1]),
      value: String(address[3]),
    };
  }

  const insert = INSERT.exec(text);

  return insert === null
    ? {
        kind: KeyKind.Plain,
        text,
      }
    : {
        kind: KeyKind.Insert,
        list: String(insert[1]),
        slot: String(insert[2]),
      };
};

const addressText = (input: { field: string; list: string; value: string }): string =>
  `${input.list}[${input.field}=${input.value}]`;

const addressOf = (text: string): AddressKey | undefined => {
  const key = of(text);

  return key.kind === KeyKind.Address ? key : undefined;
};

const SettingKey = {
  addressOf,
  addressText,
  of,
} as const;

export type { AddressKey };
export { KeyKind, SettingKey };
