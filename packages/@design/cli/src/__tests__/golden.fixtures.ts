/** what a golden file holds: each variant's text under its name, in the order given */
const goldenOf = (texts: Readonly<Record<string, string | undefined>>): string =>
  Object.entries(texts)
    .map(([variant, text]) => `# ${variant}\n${text ?? ''}\n`)
    .join('\n');

/** the golden file a spec compares its renderer with, by its URL beside the spec */
const goldenFileText = (url: URL): Promise<string> => Bun.file(url).text();

export { goldenFileText, goldenOf };
