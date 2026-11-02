import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../../../environments/environment';
import { createMockProduct } from '../../../mocks/products.mock';
import { ProductsService } from './products.service';

describe('ProductsService', () => {
  let service: ProductsService;
  let httpTesting: HttpTestingController;

  const apiUrl = `${environment.apiUrl}/api/products`;
  const product = createMockProduct();

  const productRequest = {
    name: product.name,
    price: product.price,
    weight: product.weight,
    categoryId: product.categoryId,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ProductsService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ProductsService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should retrieve products from the page content', () => {
    service.getProducts().subscribe((products) => {
      expect(products).toEqual([product]);
    });

    const request = httpTesting.expectOne(apiUrl);

    expect(request.request.method).toBe('GET');

    request.flush({
      content: [product],
      totalElements: 1,
      totalPages: 1,
      size: 20,
      number: 0,
    });
  });

  it('should retrieve a product by id', () => {
    service.getProductById(product.id).subscribe((result) => {
      expect(result).toEqual(product);
    });

    const request = httpTesting.expectOne(`${apiUrl}/${product.id}`);

    expect(request.request.method).toBe('GET');

    request.flush(product);
  });

  it('should delete a product by id', () => {
    service.deleteProduct(product.id).subscribe((result) => {
      expect(result).toBeNull();
    });

    const request = httpTesting.expectOne(`${apiUrl}/${product.id}`);

    expect(request.request.method).toBe('DELETE');

    request.flush(null);
  });

  it('should create a product', () => {
    service.createProduct(productRequest).subscribe((result) => {
      expect(result).toEqual(product);
    });

    const request = httpTesting.expectOne(apiUrl);

    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(productRequest);

    request.flush(product);
  });

  it('should update a product', () => {
    service.updateProduct(product.id, productRequest).subscribe((result) => {
      expect(result).toEqual(product);
    });

    const request = httpTesting.expectOne(`${apiUrl}/${product.id}`);

    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(productRequest);

    request.flush(product);
  });
});
