import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShoppingCartDetailsView } from './shopping-cart-details-view';
import { ShoppingCartModule } from '../../../shopping-cart.module';

describe('ShoppingCartDetailsView', () => {
  let component: ShoppingCartDetailsView;
  let fixture: ComponentFixture<ShoppingCartDetailsView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShoppingCartModule],
    }).compileComponents();

    fixture = TestBed.createComponent(ShoppingCartDetailsView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
