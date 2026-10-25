import { buildBooking } from '../../support/factories';

describe('Authentication', () => {
  let bookingId;
  let token;

  before(() => {
    cy.getToken().then((value) => {
      token = value;
    });
    cy.api('POST', '/booking', { body: buildBooking() }).then((response) => {
      bookingId = response.body.bookingid;
    });
  });

  after(() => {
    cy.api('DELETE', `/booking/${bookingId}`, { token });
  });

  it('generates a token with valid credentials', () => {
    cy.getToken();
  });

  it('[BUG-10] returns 200 instead of 401 for wrong password', () => {
    cy.task('getCredentials')
      .then(({ username }) => cy.api('POST', '/auth', { body: { username, password: 'wrong-password' } }))
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal({ reason: 'Bad credentials' });
      });
  });

  [
    ['unknown user', { username: 'unknown-user', password: 'any-password' }],
    ['empty body', {}],
  ].forEach(([scenario, body]) => {
    it(`[BUG-10] returns 200 instead of 401 for ${scenario}`, () => {
      cy.api('POST', '/auth', { body }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.deep.equal({ reason: 'Bad credentials' });
      });
    });
  });

  it('[BUG-11] returns 403 instead of 401 for a protected operation without a token', () => {
    cy.api('DELETE', `/booking/${bookingId}`).its('status').should('eq', 403);
    cy.api('GET', `/booking/${bookingId}`).its('status').should('eq', 200);
  });

  it('rejects a protected operation with an invalid token', () => {
    cy.api('DELETE', `/booking/${bookingId}`, { token: 'invalid-token' }).its('status').should('eq', 403);
    cy.api('GET', `/booking/${bookingId}`).its('status').should('eq', 200);
  });
});
