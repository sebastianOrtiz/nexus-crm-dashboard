import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { TOAST_DURATION_MS, TOAST_ERROR_DURATION_MS } from '../constants';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [ToastService] });
    service = TestBed.inject(ToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should start with an empty toasts list', () => {
    expect(service.toasts()).toEqual([]);
  });

  describe('show()', () => {
    it('should add a toast to the list', () => {
      service.show('success', 'Title', 'Message');
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].severity).toBe('success');
      expect(service.toasts()[0].title).toBe('Title');
      expect(service.toasts()[0].message).toBe('Message');
    });

    it('should use TOAST_DURATION_MS as default duration', () => {
      service.show('info', 'Test');
      expect(service.toasts()[0].duration).toBe(TOAST_DURATION_MS);
    });

    it('should allow custom duration override', () => {
      service.show('warning', 'Test', undefined, 9999);
      expect(service.toasts()[0].duration).toBe(9999);
    });
  });

  describe('success()', () => {
    it('should add a success toast', () => {
      service.success('OK', 'Done');
      expect(service.toasts()[0].severity).toBe('success');
    });
  });

  describe('error()', () => {
    it('should add an error toast with TOAST_ERROR_DURATION_MS', () => {
      service.error('Error', 'Something went wrong');
      const toast = service.toasts()[0];
      expect(toast.severity).toBe('error');
      expect(toast.duration).toBe(TOAST_ERROR_DURATION_MS);
    });
  });

  describe('warning()', () => {
    it('should add a warning toast', () => {
      service.warning('Warning');
      expect(service.toasts()[0].severity).toBe('warning');
    });
  });

  describe('info()', () => {
    it('should add an info toast', () => {
      service.info('Info');
      expect(service.toasts()[0].severity).toBe('info');
    });
  });

  describe('dismiss()', () => {
    it('should remove a toast by id', () => {
      service.show('success', 'Toast 1');
      service.show('info', 'Toast 2');
      const id = service.toasts()[0].id;

      service.dismiss(id);

      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].title).toBe('Toast 2');
    });

    it('should not throw when dismissing non-existent id', () => {
      expect(() => service.dismiss('non-existent-id')).not.toThrow();
    });
  });
});
