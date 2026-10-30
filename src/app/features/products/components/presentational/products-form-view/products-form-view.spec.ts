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
    const saveButton = element.querySelector<HTMLButtonElement>('button[type="submit"]');

    expect(saveButton?.disabled).toBe(true);
    expect(saveButton?.textContent).toContain('Saving...');
    expect(element.textContent).toContain('Save failed');
  });

  it('should render the edit title and emit save and cancel actions', () => {
    const save = vi.fn();
    const cancel = vi.fn();
    component.save.subscribe(save);
    component.cancel.subscribe(cancel);
    fixture.componentRef.setInput('isEditMode', true);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    const cancelButton = [...element.querySelectorAll('button')].find(
      (button) => button.textContent?.trim() === 'Cancel',
    );

    expect(element.querySelector('h2')?.textContent).toContain('Edit product');
    element.querySelector<HTMLFormElement>('form')?.dispatchEvent(
      new Event('submit', { bubbles: true, cancelable: true }),
    );
    cancelButton?.click();

    expect(save).toHaveBeenCalledOnce();
    expect(cancel).toHaveBeenCalledOnce();
  });
});
