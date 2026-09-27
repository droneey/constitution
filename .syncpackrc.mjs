import { config } from '@droneey/devkit-ts-syncpack';

/** @type {import('syncpack').RcFile} */
export default {
  ...config,
  versionGroups: [
    {
      label: 'The repository links its own package, so its preset resolves',
      dependencies: [
        '@droneey/constitution',
      ],
      isIgnored: true,
    },
  ],
};
