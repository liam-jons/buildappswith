export const stripeMock = {
  checkout: {
    sessions: {
      create: jest.fn().mockResolvedValue({
        id: 'cs_test_123',
        url: 'https://checkout.stripe.com/test-session',
      }),
    },
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
}

export const stripeJsMock = {
  redirectToCheckout: jest.fn().mockResolvedValue({ error: null }),
}

// Dummy test to prevent Jest from complaining
describe('stripe-mock', () => {
  it('should be exported', () => {
    expect(stripeMock).toBeDefined()
    expect(stripeJsMock).toBeDefined()
  })
})
