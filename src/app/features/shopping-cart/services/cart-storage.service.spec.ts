import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { CartStorageService } from './cart-storage.service';

describe('CartStorageService', () => {
  let service: CartStorageService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [CartStorageService],
    });

    service = TestBed.inject(CartStorageService);
  });

  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should create an owner key for a signed-in user', () => {
    expect(
      service.ownerKeyFor({
        id: 'user-1',
        username: 'customer',
        role: 'CUSTOMER',
      }),
    ).toBe('cart:user:user-1');
  });

  it('should use the guest owner key without a user', () => {
    expect(service.ownerKeyFor(null)).toBe(CartStorageService.guestOwnerKey);
    expect(service.ownerKeyFor(undefined)).toBe(CartStorageService.guestOwnerKey);
  });

  it('should return an empty persisted cart when storage is empty', () => {
    expect(service.read('cart:user:user-1')).toEqual({
      items: [],
      revision: 0,
      updatedAt: 0,
      writerId: '',
    });
  });

  it('should read and sanitize a persisted cart', () => {
    localStorage.setItem(
      'cart:user:user-1',
      JSON.stringify({
        items: [
          { productId: 'product-1', quantity: 2.9 },
          { productId: 'product-2', quantity: 0 },
          { productId: 123, quantity: 1 },
        ],
        revision: '4',
        updatedAt: '100',
        writerId: 'other-tab',
      }),
    );

    expect(service.read('cart:user:user-1')).toEqual({
      items: [{ productId: 'product-1', quantity: 2 }],
      revision: 4,
      updatedAt: 100,
      writerId: 'other-tab',
    });
  });

  it('should apply defaults to malformed persisted properties', () => {
    localStorage.setItem(
      'cart:user:user-1',
      JSON.stringify({
        items: 'invalid',
        revision: 'invalid',
        updatedAt: {},
        writerId: 123,
      }),
    );

    expect(service.read('cart:user:user-1')).toEqual({
      items: [],
      revision: 0,
      updatedAt: 0,
      writerId: '',
    });
  });

  it('should return an empty cart for invalid JSON', () => {
    localStorage.setItem('cart:user:user-1', '{invalid-json');

    expect(service.read('cart:user:user-1')).toEqual({
      items: [],
      revision: 0,
      updatedAt: 0,
      writerId: '',
    });
  });

  it('should write only the required item properties and increment revision', () => {
    vi.spyOn(Date, 'now').mockReturnValue(123456);

    localStorage.setItem(
      'cart:user:user-1',
      JSON.stringify({
        items: [],
        revision: 3,
        updatedAt: 1,
        writerId: 'old-writer',
      }),
    );

    const result = service.write('cart:user:user-1', [{ productId: 'product-1', quantity: 2 }]);

    expect(result).toEqual({
      items: [{ productId: 'product-1', quantity: 2 }],
      revision: 4,
      updatedAt: 123456,
      writerId: service.writerId,
    });

    expect(JSON.parse(localStorage.getItem('cart:user:user-1') as string)).toEqual(result);
  });

  it('should remove a persisted cart', () => {
    localStorage.setItem('cart:user:user-1', '{}');

    service.remove('cart:user:user-1');

    expect(localStorage.getItem('cart:user:user-1')).toBeNull();
  });

  it('should claim and remove a non-empty guest cart', () => {
    localStorage.setItem(
      CartStorageService.guestOwnerKey,
      JSON.stringify({
        items: [{ productId: 'product-1', quantity: 2 }],
        revision: 1,
        updatedAt: 100,
        writerId: 'guest-tab',
      }),
    );

    expect(service.claimGuestCart()).toEqual([{ productId: 'product-1', quantity: 2 }]);

    expect(localStorage.getItem(CartStorageService.guestOwnerKey)).toBeNull();
  });

  it('should not remove storage when the guest cart is empty', () => {
    localStorage.setItem(
      CartStorageService.guestOwnerKey,
      JSON.stringify({
        items: [],
        revision: 1,
        updatedAt: 100,
        writerId: 'guest-tab',
      }),
    );

    const remove = vi.spyOn(Storage.prototype, 'removeItem');

    expect(service.claimGuestCart()).toEqual([]);
    expect(remove).not.toHaveBeenCalled();
  });

  it('should emit changes for cart storage events', async () => {
    const result = firstValueFrom(service.changes$);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'cart:user:user-1',
        newValue: JSON.stringify({
          items: [{ productId: 'product-1', quantity: 2 }],
          revision: 3,
          updatedAt: 100,
          writerId: 'other-tab',
        }),
        storageArea: localStorage,
      }),
    );

    await expect(result).resolves.toEqual({
      ownerKey: 'cart:user:user-1',
      cart: {
        items: [{ productId: 'product-1', quantity: 2 }],
        revision: 3,
        updatedAt: 100,
        writerId: 'other-tab',
      },
    });
  });

  it('should emit a reset for a clear-storage event', async () => {
    const result = firstValueFrom(service.changes$);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: null,
        newValue: null,
        storageArea: localStorage,
      }),
    );

    await expect(result).resolves.toEqual({
      ownerKey: null,
      cart: null,
    });
  });

  it('should ignore unrelated storage keys', () => {
    const observer = vi.fn();
    const subscription = service.changes$.subscribe(observer);

    window.dispatchEvent(
      new StorageEvent('storage', {
        key: 'unrelated-key',
        newValue: '{}',
        storageArea: localStorage,
      }),
    );

    expect(observer).not.toHaveBeenCalled();

    subscription.unsubscribe();
  });

  it('should continue when reading from storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });

    expect(service.read('cart:user:user-1')).toEqual({
      items: [],
      revision: 0,
      updatedAt: 0,
      writerId: '',
    });
  });

  it('should return the in-memory result when writing to storage throws', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });

    const result = service.write('cart:user:user-1', [{ productId: 'product-1', quantity: 1 }]);

    expect(result).toMatchObject({
      items: [{ productId: 'product-1', quantity: 1 }],
      revision: 1,
      writerId: service.writerId,
    });
  });

  it('should tolerate storage failures while removing a cart', () => {
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('Storage disabled');
    });

    expect(() => service.remove('cart:user:user-1')).not.toThrow();
  });
});
