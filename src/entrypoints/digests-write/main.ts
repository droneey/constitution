import { prepareDigests, writeDigests } from '#/features/constitution';
import type { Finding } from '#/kernel';
import { createWiring } from '#/root';

const wiring = createWiring({
  root: process.cwd(),
});
const prepared = prepareDigests({
  frontMatterParser: wiring.frontMatterParser,
  manifestParser: wiring.manifestParser,
  tree: wiring.fileSystem,
});

if (prepared.status === 'prepared') {
  writeDigests({
    digests: prepared.digests,
    writer: wiring.fileSystem,
  });
}

const findings: readonly Finding[] =
  prepared.status === 'prepared'
    ? prepared.digests.findings
    : prepared.findings;

for (const finding of findings) {
  wiring.console.write(`${finding.path}: ${finding.message}\n`);
}

const outcome = prepared.status === 'prepared' ? 'written' : 'not written';

wiring.console.write(
  findings.length === 0
    ? `digests: ${outcome}\n`
    : `digests: ${outcome}, ${findings.length} finding(s)\n`,
);

// exitCode, not exit(): exit() drops output still buffered for a pipe.
process.exitCode = findings.length === 0 ? 0 : 1;
