const INLINE_LINK =
  /\[(?:[^[\]]|\[[^[\]]*\])*\]\(\s*(?:<([^>\n]*)>|([^\s()]+))(?:\s+(?:"[^"]*"|'[^']*'))?\s*\)/g;
const LINK_DEFINITION = /^ {0,3}\[[^\]]+\]:\s*(?:<([^>\n]*)>|(\S+))/gm;
const EXTERNAL = /^(?:[a-z][\d+.a-z-]*:|#|\/\/)/i;
const ANCHOR = '#';

const localLinkTargets = (text: string): readonly string[] =>
  [
    ...text.matchAll(INLINE_LINK),
    ...text.matchAll(LINK_DEFINITION),
  ]
    .map((match) => match[1] ?? match[2] ?? '')
    .filter((target) => target !== '' && !EXTERNAL.test(target))
    .map((target) => target.split(ANCHOR)[0] ?? '');

export { localLinkTargets };
