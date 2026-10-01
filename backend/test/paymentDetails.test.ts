import { describe, expect, it } from 'vitest';
import { extractSlipImage, parsePaymentDetails } from '../src/utils/paymentDetails';

describe('payment detail parsing', () => {
  it('parses JSON and object inputs and safely handles malformed data', () => {
    expect(parsePaymentDetails('{"method":"bank_transfer"}')).toEqual({ method: 'bank_transfer' });
    expect(parsePaymentDetails({ method: 'card' })).toEqual({ method: 'card' });
    expect(parsePaymentDetails('not-json')).toEqual({});
  });

  it('returns supported slip image URLs only', () => {
    expect(extractSlipImage({ slipImage: 'https://example.test/slip.jpg' }))
      .toBe('https://example.test/slip.jpg');
    expect(extractSlipImage({ image: 'data:image/png;base64,abc' }))
      .toBe('data:image/png;base64,abc');
    expect(extractSlipImage({ slipImage: 'javascript:alert(1)' })).toBeNull();
  });
});
