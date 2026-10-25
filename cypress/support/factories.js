export const buildBooking = (overrides = {}) => ({
  firstname: 'Murilo',
  lastname: `QA-${Date.now()}`,
  totalprice: 350,
  depositpaid: true,
  bookingdates: { checkin: '2026-11-10', checkout: '2026-11-15' },
  additionalneeds: 'Breakfast',
  ...overrides,
});

export const withoutField = (booking, field) => {
  const copy = { ...booking };
  delete copy[field];
  return copy;
};