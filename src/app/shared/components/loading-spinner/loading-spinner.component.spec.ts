import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { LoadingSpinnerComponent } from './loading-spinner.component';

describe('LoadingSpinnerComponent', () => {
  let fixture: ComponentFixture<LoadingSpinnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoadingSpinnerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LoadingSpinnerComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a spinner element', () => {
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner).not.toBeNull();
  });

  it('should apply md size class by default', () => {
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner.className).toContain('h-8 w-8');
  });

  it('should apply sm size class when size is sm', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner.className).toContain('h-4 w-4');
  });

  it('should apply lg size class when size is lg', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const spinner = fixture.nativeElement.querySelector('.animate-spin');
    expect(spinner.className).toContain('h-12 w-12');
  });

  it('should apply full-page container class when fullPage is true', () => {
    fixture.componentRef.setInput('fullPage', true);
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('div');
    expect(container.className).toContain('min-h-[200px]');
  });
});
