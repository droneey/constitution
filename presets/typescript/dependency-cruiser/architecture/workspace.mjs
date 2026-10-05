// biome-ignore lint/style/noDefaultExport: dependency-cruiser reads a preset's default export
export default {
  forbidden: [
    {
      name: 'product-units-blind-to-each-other',
      severity: 'error',
      from: {
        path: '^packages/([^/]+)/',
      },
      to: {
        path: '^packages/',
        pathNot: '^packages/$1/',
      },
    },
    {
      name: 'shared-knows-no-product-unit',
      severity: 'error',
      from: {
        path: '^shared/',
      },
      to: {
        path: '^packages/',
      },
    },
    {
      name: 'libs-know-no-product',
      severity: 'error',
      from: {
        path: '^libs/',
      },
      to: {
        path: '^(?:packages|shared)/',
      },
    },
  ],
};
