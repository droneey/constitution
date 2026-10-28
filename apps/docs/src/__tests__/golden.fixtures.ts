/**
 * The golden file at the URL, without the final newline every file of the repository ends with; a
 * run with `UPDATE_GOLDEN=1` first writes the text a case rendered into it
 */
export const goldenText = async (url: URL, rendered: string): Promise<string> => {
  if (process.env['UPDATE_GOLDEN'] === '1') {
    await Bun.write(url, `${rendered}\n`);
  }

  return (await Bun.file(url).text()).replace(/\n$/u, '');
};
