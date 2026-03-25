import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { BadgeComponent } from './badge.component';

describe('BadgeComponent', () => {
  let fixture: ComponentFixture<BadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeComponent);
  });

  it('should create', () => {
    fixture.componentRef.setInput('label', 'Test');
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the label text', () => {
    fixture.componentRef.setInput('label', 'Active');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent?.trim()).toBe('Active');
  });

  it('should apply default variant class when no variant provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-surface-700');
  });

  it('should apply success variant classes', () => {
    fixture.componentRef.setInput('label', 'Done');
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-green-500/20');
    expect(span.className).toContain('text-green-400');
  });

  it('should apply danger variant classes', () => {
    fixture.componentRef.setInput('label', 'Error');
    fixture.componentRef.setInput('variant', 'danger');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-red-500/20');
  });

  it('should apply info variant classes', () => {
    fixture.componentRef.setInput('label', 'Info');
    fixture.componentRef.setInput('variant', 'info');
    fixture.detectChanges();
    const span = fixture.nativeElement.querySelector('span');
    expect(span.className).toContain('bg-blue-500/20');
  });
});
