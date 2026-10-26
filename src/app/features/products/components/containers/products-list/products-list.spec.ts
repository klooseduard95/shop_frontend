import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductsList } from './products-list';
import { ProductsService } from '../../../services/products.service';
import { AuthService } from '../../../../../core/services/auth.service';
import { of } from 'rxjs';

describe('ProductsList', () => {
  let component: ProductsList;
  let fixture: ComponentFixture<ProductsList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsList],
      providers: [
        { provide: ProductsService, useValue: { getProducts: () => of([]), deleteProduct: () => of(void 0) } },
        { provide: AuthService, useValue: { isAuthenticated: () => false, isAdmin: () => false } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
