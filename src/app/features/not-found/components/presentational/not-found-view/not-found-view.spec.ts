import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { NotFoundView } from './not-found-view';

describe('NotFoundView', () => {
  let fixture: ComponentFixture<NotFoundView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundView],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(NotFoundView);
    fixture.detectChanges();
  });

  it('should display the not found message', () => {
    expect(fixture.nativeElement.textContent).toContain('Page not found');
  });

  it('should link back to the products page', () => {
    const link = fixture.debugElement.query(By.directive(RouterLink));

    expect(link.injector.get(RouterLink).urlTree?.toString()).toBe('/products');
  });
});
