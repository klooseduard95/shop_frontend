import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoppingCartDetails } from './shopping-cart-details';
import { ShoppingCartModule } from '../../../shopping-cart.module';

describe('ShoppingCartDetails', () => {
  let component: ShoppingCartDetails;
  let fixture: ComponentFixture<ShoppingCartDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingCartDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
