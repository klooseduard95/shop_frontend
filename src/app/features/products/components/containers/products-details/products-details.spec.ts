import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { ProductsDetails } from './products-details';
import { createMockProduct } from '../../../../../mocks/products.mock';
import { ProductsService } from '../../../services/products.service';
import { AuthService } from '../../../../../core/services/auth.service';

describe('ProductsDetails', () => {
  let component: ProductsDetails;
  let fixture: ComponentFixture<ProductsDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsDetails],
      providers: [
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '1' })) } },
        { provide: Router, useValue: { navigate: () => Promise.resolve(true) } },
        { provide: ProductsService, useValue: { getProductById: () => of(createMockProduct()) } },
        { provide: AuthService, useValue: { isAdmin: () => false, currentUser: () => null } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load the product from the route', () => {
    expect(component.product()).toEqual(createMockProduct());
  });

  it('should add the product to the cart when requested', () => {
    const mockProduct = createMockProduct({ name: "Test Product" });

    component.handleAddToCart(mockProduct);
    expect(component.cartService.cartItems()).toEqual([{ product: mockProduct, quantity: 1 }]);
  });
});
