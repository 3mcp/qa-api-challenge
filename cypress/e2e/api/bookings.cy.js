import { buildBooking, withoutField } from '../../support/factories';

describe('Bookings', () => {
  const createdIds = [];
  let token;

  const createBooking = (payload = buildBooking()) =>
    cy.api('POST', '/booking', { body: payload }).then((response) => {
      expect(response.status).to.eq(200);
      createdIds.push(response.body.bookingid);
      return { id: response.body.bookingid, payload };
    });

  before(() => {
    cy.getToken().then((value) => {
      token = value;
    });
  });

  after(() => {
    createdIds.forEach((id) => cy.api('DELETE', `/booking/${id}`, { token }));
  });

  context('Get bookings', () => {
    it('returns the booking list', () => {
      cy.api('GET', '/booking').then((response) => {
        expect(response.status).to.eq(200);
        expect(response.headers['content-type']).to.include('application/json');
        expect(response.body).to.be.an('array').and.not.be.empty;
        const allValid = response.body.every(
          (item) => Object.keys(item).length === 1 && Number.isInteger(item.bookingid)
        );
        expect(allValid, 'every item has only a numeric bookingid').to.be.true;
      });
    });

    it('returns an existing booking by id', () => {
      createBooking().then(({ id, payload }) => {
        cy.api('GET', `/booking/${id}`).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.have.all.keys(
            'firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates', 'additionalneeds'
          );
          expect(response.body.firstname).to.be.a('string');
          expect(response.body.lastname).to.be.a('string');
          expect(response.body.totalprice).to.be.a('number');
          expect(response.body.depositpaid).to.be.a('boolean');
          expect(response.body.bookingdates).to.have.all.keys('checkin', 'checkout');
          expect(response.body).to.deep.equal(payload);
        });
      });
    });

    it('returns 404 for a non-existent booking', () => {
      cy.api('GET', '/booking/999999999').its('status').should('eq', 404);
    });
  });

  context('Create booking', () => {
    it('creates a booking and returns the sent fields', () => {
      const payload = buildBooking();

      cy.api('POST', '/booking', { body: payload }).then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body).to.have.all.keys('bookingid', 'booking');
        expect(response.body.bookingid).to.be.a('number');
        expect(response.body.booking).to.deep.equal(payload);
        createdIds.push(response.body.bookingid);
      });
    });

    it('persists the created booking', () => {
      createBooking().then(({ id, payload }) => {
        cy.api('GET', `/booking/${id}`).its('body').should('deep.equal', payload);
      });
    });

    ['firstname', 'lastname', 'totalprice', 'depositpaid', 'bookingdates'].forEach((field) => {
      it(`[BUG-01] returns 500 instead of 400 when ${field} is missing`, () => {
        cy.api('POST', '/booking', { body: withoutField(buildBooking(), field) })
          .its('status')
          .should('eq', 500);
      });
    });

    it('[BUG-02] stores totalprice as null when sent as text', () => {
      createBooking(buildBooking({ totalprice: 'abc' })).then(({ id }) => {
        cy.api('GET', `/booking/${id}`).its('body.totalprice').should('be.null');
      });
    });

    it('[BUG-03] stores an invalid date as "0NaN-aN-aN"', () => {
      const bookingdates = { checkin: '2026-11-10', checkout: '2026-13-45' };

      createBooking(buildBooking({ bookingdates })).then(({ id }) => {
        cy.api('GET', `/booking/${id}`).its('body.bookingdates.checkout').should('eq', '0NaN-aN-aN');
      });
    });

    it('[BUG-04] reads 10/11/2026 as October 11 instead of November 10', () => {
      const bookingdates = { checkin: '10/11/2026', checkout: '2026-11-15' };

      createBooking(buildBooking({ bookingdates })).then(({ id }) => {
        cy.api('GET', `/booking/${id}`).its('body.bookingdates.checkin').should('eq', '2026-10-11');
      });
    });

    it('[BUG-05] accepts checkout before checkin', () => {
      const bookingdates = { checkin: '2026-11-15', checkout: '2026-11-10' };

      createBooking(buildBooking({ bookingdates })).then(({ id }) => {
        cy.api('GET', `/booking/${id}`).its('body.bookingdates').should('deep.equal', bookingdates);
      });
    });

    it('[BUG-06] accepts a negative totalprice', () => {
      createBooking(buildBooking({ totalprice: -100 })).then(({ id }) => {
        cy.api('GET', `/booking/${id}`).its('body.totalprice').should('eq', -100);
      });
    });
  });

  context('Update booking', () => {
    it('updates a booking with PUT and confirms the change', () => {
      createBooking().then(({ id }) => {
        const updated = buildBooking({ firstname: 'Updated', totalprice: 999, depositpaid: false });

        cy.api('PUT', `/booking/${id}`, { body: updated, token }).then((response) => {
          expect(response.status).to.eq(200);
          expect(response.body).to.deep.equal(updated);
        });

        cy.api('GET', `/booking/${id}`).its('body').should('deep.equal', updated);
      });
    });

    it('partially updates a booking with PATCH', () => {
      createBooking().then(({ id, payload }) => {
        const changes = { firstname: 'Partial', totalprice: 120 };

        cy.api('PATCH', `/booking/${id}`, { body: changes, token }).its('status').should('eq', 200);
        cy.api('GET', `/booking/${id}`).its('body').should('deep.equal', { ...payload, ...changes });
      });
    });

    it('rejects an update without authentication', () => {
      createBooking().then(({ id, payload }) => {
        cy.api('PUT', `/booking/${id}`, { body: buildBooking({ firstname: 'Intruder' }) })
          .its('status')
          .should('eq', 403);
        cy.api('GET', `/booking/${id}`).its('body').should('deep.equal', payload);
      });
    });

    it('[BUG-07] returns 400 on PUT but 500 on POST for a missing field', () => {
      createBooking().then(({ id }) => {
        cy.api('PUT', `/booking/${id}`, { body: withoutField(buildBooking(), 'firstname'), token })
          .its('status')
          .should('eq', 400);
      });
    });

    it('[BUG-02] stores totalprice as null on PATCH with text', () => {
      createBooking().then(({ id }) => {
        cy.api('PATCH', `/booking/${id}`, { body: { totalprice: 'abc' }, token }).its('status').should('eq', 200);
        cy.api('GET', `/booking/${id}`).its('body.totalprice').should('be.null');
      });
    });

    it('[BUG-05] accepts checkout before checkin on PATCH', () => {
      createBooking().then(({ id }) => {
        const bookingdates = { checkin: '2026-12-20', checkout: '2026-12-01' };

        cy.api('PATCH', `/booking/${id}`, { body: { bookingdates }, token }).its('status').should('eq', 200);
        cy.api('GET', `/booking/${id}`).its('body.bookingdates').should('deep.equal', bookingdates);
      });
    });
  });

  context('Delete booking', () => {
    it('[BUG-08] deletes a booking but returns 201 instead of 200 or 204', () => {
      createBooking().then(({ id }) => {
        cy.api('DELETE', `/booking/${id}`, { token }).then((response) => {
          expect(response.status).to.eq(201);
          expect(response.body).to.eq('Created');
        });

        cy.api('GET', `/booking/${id}`).its('status').should('eq', 404);
      });
    });

    it('does not delete without authentication', () => {
      createBooking().then(({ id }) => {
        cy.api('DELETE', `/booking/${id}`).its('status').should('eq', 403);
        cy.api('GET', `/booking/${id}`).its('status').should('eq', 200);
      });
    });

    it('[BUG-09] returns 405 instead of 404 when deleting an already deleted booking', () => {
      createBooking().then(({ id }) => {
        cy.api('DELETE', `/booking/${id}`, { token });
        cy.api('DELETE', `/booking/${id}`, { token }).its('status').should('eq', 405);
      });
    });
  });
});