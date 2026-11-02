import { areCartItemsEqual, mergeCartItems, sanitizeCartItems } from './cart.utils';

describe('cart utilities', () => {
  describe('mergeCartItems', () => {
    it('should clone the base items when there are no additions', () => {
      const base = [{ productId: 'product-1', quantity: 2 }];

      const result = mergeCartItems(base, []);

      expect(result).toEqual(base);
      expect(result).not.toBe(base);
      expect(result[0]).not.toBe(base[0]);
    });

    it('should add quantities for an existing product', () => {
      const result = mergeCartItems(
        [
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: 1 },
        ],
        [{ productId: 'product-1', quantity: 3 }],
      );

      expect(result).toEqual([
        { productId: 'product-1', quantity: 5 },
        { productId: 'product-2', quantity: 1 },
      ]);
    });

    it('should append products that are not already present', () => {
      const result = mergeCartItems(
        [{ productId: 'product-1', quantity: 1 }],
        [{ productId: 'product-2', quantity: 2 }],
      );

      expect(result).toEqual([
        { productId: 'product-1', quantity: 1 },
        { productId: 'product-2', quantity: 2 },
      ]);
    });

    it('should merge repeated additions in sequence', () => {
      const result = mergeCartItems(
        [],
        [
          { productId: 'product-1', quantity: 1 },
          { productId: 'product-1', quantity: 2 },
        ],
      );

      expect(result).toEqual([{ productId: 'product-1', quantity: 3 }]);
    });
  });

  describe('areCartItemsEqual', () => {
    it('should consider identical carts equal', () => {
      expect(
        areCartItemsEqual(
          [{ productId: 'product-1', quantity: 2 }],
          [{ productId: 'product-1', quantity: 2 }],
        ),
      ).toBe(true);
    });

    it('should reject carts with different lengths', () => {
      expect(areCartItemsEqual([{ productId: 'product-1', quantity: 2 }], [])).toBe(false);
    });

    it('should reject carts with different product ids', () => {
      expect(
        areCartItemsEqual(
          [{ productId: 'product-1', quantity: 2 }],
          [{ productId: 'product-2', quantity: 2 }],
        ),
      ).toBe(false);
    });

    it('should reject carts with different quantities', () => {
      expect(
        areCartItemsEqual(
          [{ productId: 'product-1', quantity: 2 }],
          [{ productId: 'product-1', quantity: 3 }],
        ),
      ).toBe(false);
    });
  });

  describe('sanitizeCartItems', () => {
    it('should return an empty array for non-array values', () => {
      expect(sanitizeCartItems(null)).toEqual([]);
      expect(sanitizeCartItems(undefined)).toEqual([]);
      expect(sanitizeCartItems({})).toEqual([]);
      expect(sanitizeCartItems('invalid')).toEqual([]);
    });

    it('should keep valid entries and normalize their quantities', () => {
      expect(
        sanitizeCartItems([
          { productId: 'product-1', quantity: 2 },
          { productId: 'product-2', quantity: '3.9' },
        ]),
      ).toEqual([
        { productId: 'product-1', quantity: 2 },
        { productId: 'product-2', quantity: 3 },
      ]);
    });

    it('should remove malformed cart entries', () => {
      expect(
        sanitizeCartItems([
          null,
          {},
          { productId: 123, quantity: 1 },
          { productId: 'product-1', quantity: 0 },
          { productId: 'product-2', quantity: -1 },
          { productId: 'product-3', quantity: 'invalid' },
          { productId: 'product-4', quantity: Infinity },
          { productId: 'product-5', quantity: 2 },
        ]),
      ).toEqual([{ productId: 'product-5', quantity: 2 }]);
    });
  });
});
