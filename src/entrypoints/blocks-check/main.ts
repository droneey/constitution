import { validateConstitution } from '#/features/constitution';
import { createWiring } from '#/root';

const wiring = createWiring({
  root: process.cwd(),
});
const findings = validateConstitution({
  frontMatterParser: wiring.frontMatterParser,
  manifestParser: wiring.manifestParser,
  tree: wiring.fileTree,
});

for (const finding of findings) {
  wiring.console.write(`${finding.path}: ${finding.message}\n`);
}

wiring.console.write(
  findings.length === 0
    ? 'blocks: every block is sound\n'
    : `blocks: ${findings.length} finding(s)\n`,
);
// exitCode, not exit(): exit() drops output still buffered for a pipe.
process.exitCode = findings.length === 0 ? 0 : 1;
