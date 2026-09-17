import { playwrightLauncher } from '@web/test-runner-playwright';

export default {
  nodeResolve: true,
  files: ['test/**/*.test.js'],
  browsers: [playwrightLauncher({ product: 'chromium' })],
  testFramework: {
    config: {
      timeout: '5000'
    }
  },
  coverageConfig: {
    include: ['src/**/*.js'],
    exclude: ['src/**/*-styles.js']
  }
};
