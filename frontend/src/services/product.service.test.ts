import { beforeEach, describe, expect, it, vi } from 'vitest';

const { get } = vi.hoisted(() => ({
  get: vi.fn(),
}));

vi.mock('./api', () => ({
  default: { get },
}));

import { getProducts } from './product.service';

describe('getProducts API helper', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns the product list from the API envelope and forwards filters', async () => {
    const products = [{ id: 'product-1', name: 'Test shirt' }];
    get.mockResolvedValue({
      data: { data: { products, total: 1 } },
    });

    await expect(getProducts({ category: 'shirts' })).resolves.toEqual(products);
    expect(get).toHaveBeenCalledWith('/products', { params: { category: 'shirts' } });
  });

  it('returns an empty list when the API envelope has no products', async () => {
    get.mockResolvedValue({ data: { data: {} } });

    await expect(getProducts()).resolves.toEqual([]);
  });
});
