const assert = require('node:assert/strict');
const test = require('node:test');
const { extractSlipImage, parsePaymentDetails } = require('../src/utils/paymentDetails');

test('parsePaymentDetails accepts JSON objects and safely handles invalid input', () => {
  assert.deepEqual(parsePaymentDetails('{"method":"bank_transfer"}'), { method: 'bank_transfer' });
  assert.deepEqual(parsePaymentDetails({ method: 'card' }), { method: 'card' });
  assert.deepEqual(parsePaymentDetails('not-json'), {});
});

test('extractSlipImage returns supported image URLs', () => {
  assert.equal(extractSlipImage({ slipImage: 'https://example.com/slip.jpg' }), 'https://example.com/slip.jpg');
  assert.equal(extractSlipImage({ image: 'data:image/png;base64,abc' }), 'data:image/png;base64,abc');
  assert.equal(extractSlipImage({ slipImage: 'javascript:alert(1)' }), null);
});
