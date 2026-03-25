import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { StatsCardComponent } from './stats-card.component';

describe('StatsCardComponent', () => {
  let fixture: ComponentFixture<StatsCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatsCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatsCardComponent);
  });

  it('should create', () => {
    fixture.componentRef.setInput('label', 'Total');
    fixture.componentRef.setInput('value', '42');
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the label text', () => {
    fixture.componentRef.setInput('label', 'Total Contacts');
    fixture.componentRef.setInput('value', '100');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Total Contacts');
  });

  it('should render the value text', () => {
    fixture.componentRef.setInput('label', 'Revenue');
    fixture.componentRef.setInput('value', '$12,500');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('$12,500');
  });

  it('should apply default iconBg class', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '0');
    fixture.detectChanges();
    const iconDiv = fixture.nativeElement.querySelector('.rounded-lg');
    expect(iconDiv.className).toContain('bg-primary-600/20');
  });

  it('should apply custom iconBg class when provided', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '0');
    fixture.componentRef.setInput('iconBg', 'bg-green-600/20');
    fixture.detectChanges();
    const iconDiv = fixture.nativeElement.querySelector('.rounded-lg');
    expect(iconDiv.className).toContain('bg-green-600/20');
  });

  it('should not render change indicator when change is null', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '5');
    fixture.detectChanges();
    const changeParagraph = fixture.nativeElement.querySelector('p.text-xs');
    expect(changeParagraph).toBeNull();
  });

  it('should render change indicator with green class when changePositive is true', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '5');
    fixture.componentRef.setInput('change', 12);
    fixture.componentRef.setInput('changePositive', true);
    fixture.detectChanges();
    const changeParagraph = fixture.nativeElement.querySelector('p.text-xs');
    expect(changeParagraph).not.toBeNull();
    expect(changeParagraph.className).toContain('text-green-400');
    expect(changeParagraph.textContent).toContain('+12%');
  });

  it('should render change indicator with red class when changePositive is false', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '3');
    fixture.componentRef.setInput('change', 5);
    fixture.componentRef.setInput('changePositive', false);
    fixture.detectChanges();
    const changeParagraph = fixture.nativeElement.querySelector('p.text-xs');
    expect(changeParagraph).not.toBeNull();
    expect(changeParagraph.className).toContain('text-red-400');
    expect(changeParagraph.textContent).not.toContain('+');
  });

  it('should display "vs mes anterior" text alongside change value', () => {
    fixture.componentRef.setInput('label', 'Test');
    fixture.componentRef.setInput('value', '10');
    fixture.componentRef.setInput('change', 8);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('vs mes anterior');
  });
});
