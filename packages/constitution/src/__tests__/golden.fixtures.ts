/** what a golden file holds: each variant's text under its name, in the order given */
const goldenOf = (texts: Readonly<Record<string, string | undefined>>): string =>
  Object.entries(texts)
    .map(([variant, text]) => `# ${variant}\n${text ?? ''}\n`)
    .join('\n');

/**
 * The golden file at the URL beside the spec; a run with `UPDATE_GOLDEN=1` first writes the text a
 * case rendered into it.
 */
const goldenFileText = async (url: URL, rendered: string): Promise<string> => {
  if (process.env['UPDATE_GOLDEN'] === '1') {
    await Bun.write(url, rendered);
  }

  return await Bun.file(url).text();
};

export { goldenFileText, goldenOf };
