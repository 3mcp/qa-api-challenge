Cypress.Commands.add('api', (method, url, { body, token, headers = {} } = {}) => {
  return cy.request({
    method,
    url,
    body,
    failOnStatusCode: false,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Cookie: `token=${token}` } : {}),
      ...headers,
    },
  });
});

Cypress.Commands.add('getToken', () => {
  return cy
    .task('getCredentials')
    .then((credentials) => cy.api('POST', '/auth', { body: credentials }))
    .then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body.token).to.be.a('string').and.not.be.empty;
      return response.body.token;
    });
});