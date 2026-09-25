const LINK = /\[[^\]]*\]\(([^)\s]+)\)/g;
const EXTERNAL = /^(?:[a-z]+:|#)/;

const localLinkTargets = (text: string): readonly string[] =>
  [
    ...text.matchAll(LINK),
  ]
    .map((match) => match[1] ?? '')
    .filter((target) => !EXTERNAL.test(target))
    .map((target) => target.split('#')[0] ?? '');

export { localLinkTargets };
