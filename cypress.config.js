require('dotenv').config();

const { defineConfig } = require('cypress');

module.exports = defineConfig({
  reporter: 'cypress-mochawesome-reporter',
  reporterOptions: {
    reportDir: 'cypress/reports',
    reportPageTitle: 'Restful Booker API Tests',
    inlineAssets: true,
  },
  e2e: {
    baseUrl: 'https://restful-booker.herokuapp.com',
    setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      on('task', {
        getCredentials: () => {
          const { API_USER, API_PASSWORD } = process.env;
          if (!API_USER || !API_PASSWORD) {
            throw new Error('Set API_USER and API_PASSWORD in the .env file');
          }
          return { username: API_USER, password: API_PASSWORD };
        },
      });
      return config;
    },
  },
});
