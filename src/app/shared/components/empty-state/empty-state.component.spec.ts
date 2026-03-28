import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { EmptyStateComponent } from './empty-state.component';
import { TranslateService } from '../../../core/services/translate.service';

describe('EmptyStateComponent', () => {
  let fixture: ComponentFixture<EmptyStateComponent>;

  beforeEach(async () => {
    const translateMock = { t: (key: string) => key };

    await TestBed.configureTestingModule({
      imports: [EmptyStateComponent],
      providers: [{ provide: TranslateService, useValue: translateMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(EmptyStateComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the title', () => {
    fixture.componentRef.setInput('title', 'No data found');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('No data found');
  });

  it('should render the description when provided', () => {
    fixture.componentRef.setInput('title', 'Empty');
    fixture.componentRef.setInput('description', 'Nothing here yet');
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Nothing here yet');
  });

  it('should not render action button when actionLabel is empty', () => {
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeNull();
  });

  it('should render action button when actionLabel is provided', () => {
    fixture.componentRef.setInput('actionLabel', 'Create new');
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button).not.toBeNull();
    expect(button.textContent.trim()).toBe('Create new');
  });

  it('should emit action event when button is clicked', () => {
    fixture.componentRef.setInput('actionLabel', 'Click me');
    fixture.detectChanges();

    const actionSpy = vi.fn();
    fixture.componentInstance.action.subscribe(actionSpy);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();

    expect(actionSpy).toHaveBeenCalledOnce();
  });
});
