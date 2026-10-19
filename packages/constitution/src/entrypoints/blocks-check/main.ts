import { validateConstitution } from '#/features/constitution';
import { createWiring } from '#/root';

// A pack is checked against the Constitution it extends: --base <folder>.
const baseAt = process.argv.indexOf('--base');
const wiring = createWiring({
  base: baseAt === -1 ? undefined : process.argv[baseAt + 1],
  root: process.cwd(),
});
const { advice, findings } = validateConstitution({
  ...(wiring.base === undefined
    ? {}
    : {
        base: wiring.base,
      }),
  bindingsParser: wiring.bindingsParser,
  frontMatterParser: wiring.frontMatterParser,
  manifestParser: wiring.manifestParser,
  repository: wiring.repository,
  tree: wiring.fileSystem,
  vocabularyParser: wiring.vocabularyParser,
});

// The code closes the line, as a linter's rule id does.
for (const finding of findings) {
  wiring.console.write(`${finding.path}: ${finding.message} [${finding.code}]\n`);
}

wiring.console.write(
  findings.length === 0
    ? 'blocks: every block is sound\n'
    : `blocks: ${findings.length} finding(s)\n`,
);

for (const line of advice) {
  wiring.console.write(`${line}\n`);
}

// exitCode, not exit(): exit() drops output still buffered for a pipe.
process.exitCode = findings.length === 0 ? 0 : 1;
