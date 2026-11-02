import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { CartService } from './cart.service';

describe('CartService', () => {
  let service: CartService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [CartService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(CartService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should submit an order for checkout', () => {
    const order = {
      userId: 'user-1',
      deliveryAddress: {
        country: 'Romania',
        city: 'Cluj-Napoca',
        county: 'Cluj',
        streetAddress: 'Test Street 1',
      },
      products: [
        {
          productId: 'product-1',
          quantity: 2,
        },
      ],
    };

    service.checkout(order).subscribe((result) => {
      expect(result).toBeNull();
    });

    const request = httpTesting.expectOne(`${environment.apiUrl}/api/orders`);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(order);

    request.flush(null);
  });
});
