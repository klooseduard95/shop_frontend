import { CartItem } from '../types/cart.types';

export function mergeCartItems(base: CartItem[], additions: CartItem[]): CartItem[] {
  return additions.reduce<CartItem[]>(
    (merged, addition) => {
      const exists = merged.some((item) => item.productId === addition.productId);

      return exists
        ? merged.map((item) =>
            item.productId === addition.productId
              ? { ...item, quantity: item.quantity + addition.quantity }
              : item,
          )
        : [...merged, { productId: addition.productId, quantity: addition.quantity }];
    },
    base.map((item) => ({ ...item })),
  );
}

export function areCartItemsEqual(left: CartItem[], right: CartItem[]): boolean {
  return (
    left.length === right.length &&
    left.every(
      (item, index) =>
        item.productId === right[index].productId && item.quantity === right[index].quantity,
    )
  );
}

export function sanitizeCartItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce<CartItem[]>((items, entry) => {
    const candidate = entry as Partial<CartItem> | null;
    const quantity = Number(candidate?.quantity);

    if (typeof candidate?.productId !== 'string' || !Number.isFinite(quantity) || quantity <= 0) {
      return items;
    }

    return [...items, { productId: candidate.productId, quantity: Math.floor(quantity) }];
  }, []);
}
