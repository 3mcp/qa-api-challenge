describe('Healthcheck', () => {
  it('API is up and running', () => {
    cy.request('/ping').then((response) => {
      expect(response.status).to.eq(201);
    });
  });
});