module.exports = {
  ci: {
    collect: {
      // Next.js build output directory
      staticDistDir: './.next',
      // URL patterns to test
      url: [
        'http://localhost:3000/',
      ],
      // Lighthouse configuration
      settings: {
        chromeFlags: '--no-sandbox',
      },
      numberOfRuns: 3,
    },
    assert: {
      // Performance thresholds
      assertions: {
        'categories:performance': ['warn', {minScore: 0.8}],
        'categories:accessibility': ['error', {minScore: 0.9}],
        'categories:best-practices': ['warn', {minScore: 0.85}],
        'categories:seo': ['warn', {minScore: 0.9}],
        'categories:pwa': 'off',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
    server: {
      // Start the Next.js server for testing
      command: 'npm start',
      port: 3000,
      wait: 5000,
    },
  },
};