const goldenOf = (texts: Readonly<Record<string, string | undefined>>): string =>
  Object.entries(texts)
    .map(([variant, text]) => `# ${variant}\n${text ?? ''}\n`)
    .join('\n');

const goldenFileText = (url: URL): Promise<string> => Bun.file(url).text();

export { goldenFileText, goldenOf };
