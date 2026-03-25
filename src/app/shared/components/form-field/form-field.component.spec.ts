import { TestBed } from '@angular/core/testing';
import { ComponentFixture } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormFieldComponent } from './form-field.component';

describe('FormFieldComponent', () => {
  let fixture: ComponentFixture<FormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should not render label when label input is empty', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label).toBeNull();
  });

  it('should render label when label input is provided', () => {
    fixture.componentRef.setInput('label', 'Email Address');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label');
    expect(label).not.toBeNull();
    expect(label.textContent.trim()).toContain('Email Address');
  });

  it('should set the for attribute on label using fieldId input', () => {
    fixture.componentRef.setInput('label', 'Name');
    fixture.componentRef.setInput('fieldId', 'name-field');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label');
    expect(label.getAttribute('for')).toBe('name-field');
  });

  it('should not render required asterisk when required is false', () => {
    fixture.componentRef.setInput('label', 'Optional');
    fixture.detectChanges();
    const asterisk = fixture.nativeElement.querySelector('label span');
    expect(asterisk).toBeNull();
  });

  it('should render required asterisk when required is true', () => {
    fixture.componentRef.setInput('label', 'Required Field');
    fixture.componentRef.setInput('required', true);
    fixture.detectChanges();
    const asterisk = fixture.nativeElement.querySelector('label span');
    expect(asterisk).not.toBeNull();
    expect(asterisk.textContent.trim()).toBe('*');
    expect(asterisk.className).toContain('text-red-400');
  });

  it('should not render error message when error input is empty', () => {
    const errorEl = fixture.nativeElement.querySelector('p.text-red-400');
    expect(errorEl).toBeNull();
  });

  it('should render error message when error input is provided', () => {
    fixture.componentRef.setInput('error', 'This field is required');
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('p.text-red-400');
    expect(errorEl).not.toBeNull();
    expect(errorEl.textContent.trim()).toBe('This field is required');
  });

  it('should not render hint when hint input is empty', () => {
    const hintEl = fixture.nativeElement.querySelector('p.text-surface-500');
    expect(hintEl).toBeNull();
  });

  it('should render hint when hint is provided and there is no error', () => {
    fixture.componentRef.setInput('hint', 'Enter your full name');
    fixture.detectChanges();
    const hintEl = fixture.nativeElement.querySelector('p.text-surface-500');
    expect(hintEl).not.toBeNull();
    expect(hintEl.textContent.trim()).toBe('Enter your full name');
  });

  it('should hide hint when both hint and error are provided', () => {
    fixture.componentRef.setInput('hint', 'Some hint');
    fixture.componentRef.setInput('error', 'Validation error');
    fixture.detectChanges();
    const hintEl = fixture.nativeElement.querySelector('p.text-surface-500');
    expect(hintEl).toBeNull();
    const errorEl = fixture.nativeElement.querySelector('p.text-red-400');
    expect(errorEl).not.toBeNull();
  });
});
