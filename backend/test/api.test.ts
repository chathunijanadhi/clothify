import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { metricsApp } from '../src/observability/metrics';
import { authRateLimiter, generalRateLimiter } from '../src/app';
import { setShuttingDown } from '../src/utils/lifecycle';
import { validateStartupConfig } from '../src/config/startup';
import { startServer } from '../src/server';

const mocks = vi.hoisted(() => ({
  pool: {
    query: vi.fn(),
    totalCount: 2,
    idleCount: 1,
    waitingCount: 0,
  },
  registerUser: vi.fn(),
  authenticateUser: vi.fn(),
  toPublic: vi.fn((user: Record<string, unknown>) => ({
    id: user.id,
    fullName: user.full_name,
    email: user.email,
    role: user.role,
    isActive: user.is_active,
    createdAt: user.created_at,
    updatedAt: user.updated_at,
  })),
  listCategories: vi.fn(),
  getProducts: vi.fn(),
  countProducts: vi.fn(),
  getProductById: vi.fn(),
  getProductImages: vi.fn(),
  getProductVariants: vi.fn(),
}));

vi.mock('../src/config/database', () => ({
  default: mocks.pool,
  pool: mocks.pool,
}));

vi.mock('../src/services/auth.service', () => ({
  registerUser: mocks.registerUser,
  authenticateUser: mocks.authenticateUser,
}));

vi.mock('../src/models/user.model', () => ({
  toPublic: mocks.toPublic,
  findOrCreateFirebaseUser: vi.fn(),
}));

vi.mock('../src/services/product.service', () => ({
  listCategories: mocks.listCategories,
  getProducts: mocks.getProducts,
  countProducts: mocks.countProducts,
  getProductById: mocks.getProductById,
  getProductImages: mocks.getProductImages,
  getProductVariants: mocks.getProductVariants,
  createProduct: vi.fn(),
  updateProduct: vi.fn(),
  deleteProduct: vi.fn(),
}));

const user = {
  id: 'user-123',
  full_name: 'Test Customer',
  email: 'customer@example.test',
  password_hash: 'not-used-by-controller',
  role: 'customer',
  is_active: true,
  created_at: new Date('2025-01-01T00:00:00.000Z'),
  updated_at: new Date('2025-01-01T00:00:00.000Z'),
};

const product = {
  id: 'product-123',
  category_id: 'category-123',
  name: 'Test Shirt',
  slug: 'test-shirt',
  description: 'A test product',
  brand: 'Clothify',
  price: '25.00',
  discount_percentage: '0',
  final_price: '25.00',
  stock_quantity: 4,
  rating: '0',
  review_count: 0,
  is_active: true,
  created_at: new Date('2025-01-01T00:00:00.000Z'),
  updated_at: new Date('2025-01-01T00:00:00.000Z'),
};

beforeEach(() => {
  vi.clearAllMocks();
  setShuttingDown(false);
  authRateLimiter.resetKey('::ffff:127.0.0.1');
  authRateLimiter.resetKey('127.0.0.1');
  authRateLimiter.resetKey('198.51.100.42');
  generalRateLimiter.resetKey('::ffff:127.0.0.1');
  generalRateLimiter.resetKey('127.0.0.1');
  generalRateLimiter.resetKey('198.51.100.42');
  generalRateLimiter.resetKey('198.51.100.99');
  mocks.pool.query.mockResolvedValue({ rows: [{ '?column?': 1 }], rowCount: 1 });
  mocks.registerUser.mockResolvedValue(user);
  mocks.authenticateUser.mockResolvedValue(user);
  mocks.listCategories.mockResolvedValue([{ id: 'category-123', name: 'Shirts' }]);
  mocks.getProducts.mockResolvedValue([product]);
  mocks.countProducts.mockResolvedValue(1);
  mocks.getProductById.mockResolvedValue(product);
  mocks.getProductImages.mockResolvedValue([]);
  mocks.getProductVariants.mockResolvedValue([]);
});

afterEach(() => {
  setShuttingDown(false);
  vi.restoreAllMocks();
});

describe('health and metrics endpoints', () => {
  it('serves liveness without querying PostgreSQL', async () => {
    mocks.pool.query.mockRejectedValue(new Error('Database should not be queried'));

    const response = await request(app).get('/api/health/live');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Clothify API is running',
    });
    expect(mocks.pool.query).not.toHaveBeenCalled();
  });

  it('reports readiness when PostgreSQL is available and unavailable', async () => {
    const ready = await request(app).get('/api/health/ready');
    expect(ready.status).toBe(200);
    expect(ready.body).toEqual({
      success: true,
      message: 'Clothify API is running',
      database: 'connected',
    });

    mocks.pool.query.mockRejectedValueOnce(new Error('Database unavailable'));
    const unavailable = await request(app).get('/api/health/ready');
    expect(unavailable.status).toBe(503);
    expect(unavailable.body.database).toBe('disconnected');
  });

  it('returns 503 from readiness while shutdown is in progress', async () => {
    setShuttingDown(true);

    const response = await request(app).get('/api/health/ready');

    expect(response.status).toBe(503);
    expect(response.body.message).toBe('Clothify API is shutting down');
    expect(mocks.pool.query).not.toHaveBeenCalled();
  });

  it('preserves the existing health response format', async () => {
    const response = await request(app).get('/api/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      success: true,
      message: 'Clothify API is running',
      database: 'connected',
    });
  });

  it('serves metrics internally and does not mount them on the public API', async () => {
    await request(app).get('/api/health/live');

    const publicResponse = await request(app).get('/metrics');
    expect(publicResponse.status).toBe(404);

    const metricsResponse = await request(metricsApp).get('/metrics');
    expect(metricsResponse.status).toBe(200);
    expect(metricsResponse.text).toContain('http_requests_total');
    expect(metricsResponse.text).toContain('http_request_duration_seconds_bucket');
    expect(metricsResponse.text).toContain('db_pool_total_connections');
    expect(metricsResponse.text).toContain('process_resident_memory_bytes');
    expect(metricsResponse.text).toContain('route="/api/health/live"');
  });

  it('skips general rate limiting for health checks', async () => {
    const responses = await Promise.all(
      Array.from({ length: 6 }, () =>
        request(app)
          .get('/api/health/live')
          .set('X-Forwarded-For', '198.51.100.99')
      )
    );

    expect(responses.every((response) => response.status === 200)).toBe(true);
  });
});

describe('authentication routes', () => {
  it('registers a user and returns the established response shape', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ fullName: 'Test Customer', email: 'customer@example.test', password: 'pass-123' });

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject({
      success: true,
      data: {
        user: { id: user.id, email: user.email, role: user.role },
      },
    });
    expect(response.body.data.token).toEqual(expect.any(String));
    expect(mocks.registerUser).toHaveBeenCalledWith({
      fullName: 'Test Customer',
      email: 'customer@example.test',
      password: 'pass-123',
    });
  });

  it('rejects invalid registration input and duplicate email', async () => {
    const missingEmail = await request(app)
      .post('/api/auth/register')
      .set('X-Request-Id', 'invalid-register-test')
      .send({ password: 'pass-123' });
    expect(missingEmail.status).toBe(400);
    expect(missingEmail.body.requestId).toBe('invalid-register-test');
    expect(mocks.registerUser).not.toHaveBeenCalled();

    const shortPassword = await request(app)
      .post('/api/auth/register')
      .send({ email: 'customer@example.test', password: 'short' });
    expect(shortPassword.status).toBe(400);

    mocks.registerUser.mockRejectedValueOnce(new Error('EMAIL_ALREADY_REGISTERED'));
    const duplicate = await request(app)
      .post('/api/auth/register')
      .send({ email: 'customer@example.test', password: 'pass-123' });
    expect(duplicate.status).toBe(409);
    expect(duplicate.body.error).toBe('EMAIL_ALREADY_REGISTERED');
  });

  it('logs in with valid credentials and rejects invalid credentials or missing input', async () => {
    const success = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'pass-123' });
    expect(success.status).toBe(200);
    expect(success.body.data.user.email).toBe(user.email);
    expect(success.body.data.token).toEqual(expect.any(String));

    mocks.authenticateUser.mockRejectedValueOnce(new Error('INVALID_CREDENTIALS'));
    const invalidCredentials = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrong' });
    expect(invalidCredentials.status).toBe(401);
    expect(invalidCredentials.body.error).toBe('INVALID_CREDENTIALS');

    const missingInput = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email });
    expect(missingInput.status).toBe(400);
    expect(mocks.authenticateUser).toHaveBeenCalledTimes(2);
  });

  it('limits repeated authentication attempts and includes the request ID', async () => {
    const responses = await Promise.all(
      Array.from({ length: 5 }, (_, index) =>
        request(app)
          .post('/api/auth/login')
          .set('X-Forwarded-For', '198.51.100.42')
          .set('X-Request-Id', `rate-limit-${index}`)
          .send({})
      )
    );
    const limitedResponse = responses[4];

    expect(responses.slice(0, 4).every((response) => response.status === 400)).toBe(true);
    expect(limitedResponse.status).toBe(429);
    expect(limitedResponse.body).toMatchObject({
      success: false,
      message: 'Too many requests',
      requestId: 'rate-limit-4',
    });
    expect(limitedResponse.headers['x-request-id']).toBe('rate-limit-4');
  });
});

describe('product read routes', () => {
  it('returns paginated products with related images and variants', async () => {
    mocks.getProductImages.mockResolvedValueOnce([{
      id: 'image-1',
      product_id: product.id,
      image_url: 'https://example.test/shirt.jpg',
    }]);

    const response = await request(app)
      .get('/api/products')
      .query({ page: 2, limit: 5, search: 'shirt' });

    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      page: 2,
      limit: 5,
      total: 1,
      totalPages: 1,
      products: [{
        id: product.id,
        images: [{ image_url: 'https://example.test/shirt.jpg' }],
        variants: [],
      }],
    });
    expect(mocks.getProducts).toHaveBeenCalledWith(
      expect.objectContaining({ search: 'shirt', sort: 'newest' }),
      2,
      5
    );
  });

  it('returns categories and an individual product, or a product-not-found response', async () => {
    const categories = await request(app).get('/api/products/categories');
    expect(categories.status).toBe(200);
    expect(categories.body.data.categories).toEqual([{ id: 'category-123', name: 'Shirts' }]);

    const detail = await request(app).get(`/api/products/${product.id}`);
    expect(detail.status).toBe(200);
    expect(detail.body.data.product).toMatchObject({
      id: product.id,
      images: [],
      variants: [],
    });

    mocks.getProductById.mockResolvedValueOnce(null);
    const missing = await request(app).get('/api/products/missing');
    expect(missing.status).toBe(404);
    expect(missing.body.error).toBe('PRODUCT_NOT_FOUND');
  });
});

describe('reliability error handling', () => {
  it('returns a request-ID-bearing JSON 404 response', async () => {
    const response = await request(app)
      .get('/not-a-route')
      .set('X-Request-Id', 'missing-route-test');

    expect(response.status).toBe(404);
    expect(response.body).toEqual({
      success: false,
      message: 'Route not found',
      requestId: 'missing-route-test',
    });
  });

  it('hides parser error details in production responses', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    try {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .set('X-Request-Id', 'production-error-test')
        .send('{ invalid json');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        success: false,
        message: 'Request failed',
        requestId: 'production-error-test',
      });
      expect(response.text).not.toContain('SyntaxError');
      expect(response.text).not.toContain('stack');
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('hides controller error details and includes the request ID in production', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    mocks.registerUser.mockRejectedValueOnce(new Error('private database diagnostic'));
    try {
      const response = await request(app)
        .post('/api/auth/register')
        .set('X-Request-Id', 'controller-error-test')
        .send({ email: 'customer@example.test', password: 'pass-123' });

      expect(response.status).toBe(500);
      expect(response.body.requestId).toBe('controller-error-test');
      expect(response.body.error).toBe('SERVER_ERROR');
      expect(response.text).not.toContain('private database diagnostic');
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
    }
  });

  it('rejects missing, short, and placeholder production JWT secrets during startup', async () => {
    const originalNodeEnv = process.env.NODE_ENV;
    const originalJwtSecret = process.env.JWT_SECRET;
    process.env.NODE_ENV = 'production';
    delete process.env.JWT_SECRET;

    try {
      await expect(startServer()).rejects.toThrow(/JWT_SECRET must be configured/);
      expect(() => validateStartupConfig()).toThrow(/JWT_SECRET must be configured/);
      process.env.JWT_SECRET = 'too-short';
      expect(() => validateStartupConfig()).toThrow(/JWT_SECRET must be configured/);
      process.env.JWT_SECRET = 'EXAMPLE_ONLY_REPLACE_WITH_A_RANDOM_SECRET_OF_32_PLUS_CHARACTERS';
      expect(() => validateStartupConfig()).toThrow(/JWT_SECRET must be configured/);
    } finally {
      if (originalNodeEnv === undefined) delete process.env.NODE_ENV;
      else process.env.NODE_ENV = originalNodeEnv;
      if (originalJwtSecret === undefined) delete process.env.JWT_SECRET;
      else process.env.JWT_SECRET = originalJwtSecret;
    }
  });
});
