const SPECIAL = /[.*+?^${}()|[\]\\]/g;

const escapeRegExp = (text: string): string => text.replaceAll(SPECIAL, '\\$&');

const patternOf = (token: string): RegExp =>
  token.startsWith('.')
    ? new RegExp(`${escapeRegExp(token)}(?![\\w-])`, 'u')
    : new RegExp(`(?<![\\w.-])${escapeRegExp(token)}(?![\\w-])`, 'u');

const containsToken = (input: { text: string; token: string }): boolean =>
  patternOf(input.token).test(input.text);

export { containsToken };
