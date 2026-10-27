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
      new FormGroup({
        name: new FormControl('Product'),
        price: new FormControl(1),
        weight: new FormControl(1),
        categoryId: new FormControl('category'),
      }),
    );
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should disable saving and render an inline error', () => {
    fixture.componentRef.setInput('saving', true);
    fixture.componentRef.setInput('saveError', 'Save failed');
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const saveButton = element.querySelector<HTMLButtonElement>('.btn-save');

    expect(saveButton?.disabled).toBe(true);
    expect(saveButton?.textContent).toContain('Saving...');
    expect(element.textContent).toContain('Save failed');
  });
});
