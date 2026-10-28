const createBrandFile = (stepOverrides: Readonly<Record<string, unknown>> = {}): unknown => ({
  color: {
    brand: {
      $type: 'color',
      '300': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.82,
            0.11,
            85,
          ],
        },
      },
      '600': {
        $value: {
          colorSpace: 'oklch',
          components: [
            0.5,
            0.17,
            85,
          ],
          hex: '#835c00',
        },
      },
      ...stepOverrides,
    },
  },
});

export { createBrandFile };
