import { BlockLayer } from '../../../domain/entities';
import { RepositoryPath } from '../../../domain/value-objects';

const blockLayers: readonly string[] = Object.values(BlockLayer);

const blocksFolderPath = RepositoryPath.create('packages/constitution/blocks');

const docsFolderPath = RepositoryPath.create('docs');

const readmeFilePath = RepositoryPath.create('README.md');

const projectFilePath = RepositoryPath.create('PROJECT.md');

const QUICK_START = 'quick-start';

/** the page made of PROJECT.md's glossary, and that section's anchor */
const GLOSSARY = 'glossary';

const siteDocuments: Readonly<Record<string, string>> = {
  'CONTRIBUTING.md': 'contributing',
  'DECISIONS.md': 'decisions',
};

/** contexts/ holds two layers, and the sidebar one folder for them */
const siteLayers: readonly string[] = [
  ...new Set(blockLayers.map((layer) => layer.replace(/\/.*/, ''))),
];

export {
  blockLayers,
  blocksFolderPath,
  docsFolderPath,
  GLOSSARY,
  projectFilePath,
  QUICK_START,
  readmeFilePath,
  siteDocuments,
  siteLayers,
};
