import { readFileSync } from 'node:fs';
import { dirname, extname, isAbsolute, relative, resolve } from 'node:path';

const LOADERS = new Map<string, Bun.JavaScriptLoader>([
  [
    '.ts',
    'ts',
  ],
  [
    '.tsx',
    'tsx',
  ],
]);

const loaderOf = (path: string): Bun.JavaScriptLoader | undefined => LOADERS.get(extname(path));

const importsOf = (path: string): readonly string[] => {
  const loader = loaderOf(path);

  if (loader === undefined) {
    return [];
  }

  const from = resolve(path);

  return new Bun.Transpiler({
    loader,
  })
    .scanImports(readFileSync(from, 'utf8'))
    .map(({ path: specifier }) => Bun.resolveSync(specifier, dirname(from)))
    .filter((target) => isAbsolute(target) && !target.includes('/node_modules/'))
    .map((target) => relative(process.cwd(), target))
    .filter((target) => !target.startsWith('..'));
};

export { importsOf, loaderOf };
