import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { ProductsFormView } from './products-form-view';

describe('ProductsFormView', () => {
  let component: ProductsFormView;
  let fixture: ComponentFixture<ProductsFormView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProductsFormView],
    }).compileComponents();

    fixture = TestBed.createComponent(ProductsFormView);
    component = fixture.componentInstance;
    fixture.componentRef.setInput(
      'form',
      new FormGroup({ name: new FormControl(''), price: new FormControl(0), weight: new FormControl(0), categoryId: new FormControl('') }),
    );
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
