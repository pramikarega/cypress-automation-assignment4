const { defineConfig } = require('cypress')

module.exports = defineConfig({
  e2e: {
    // Website UI yang diuji
    baseUrl: 'https://labs.hendri.me',
    specPattern: 'cypress/e2e/**/*.cy.js',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 10000,
    requestTimeout: 15000,
    responseTimeout: 30000,
    video: false,
    retries: { runMode: 1, openMode: 0 },
  },
})
