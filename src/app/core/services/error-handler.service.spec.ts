import { TestBed } from '@angular/core/testing';
import { ErrorHandlerService } from './error-handler.service';
import { ToastService } from './toast.service';
import { TranslateService } from './translate.service';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let toastSpy: { error: ReturnType<typeof vi.fn> };
  let translateSpy: { t: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    toastSpy = { error: vi.fn() };
    translateSpy = { t: vi.fn((key: string) => key) };

    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        { provide: ToastService, useValue: toastSpy },
        { provide: TranslateService, useValue: translateSpy },
      ],
    });

    service = TestBed.inject(ErrorHandlerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handle()', () => {
    it('should call toast.error with the context and extracted message', () => {
      service.handle(new Error('Something broke'), 'Loading contacts');
      expect(toastSpy.error).toHaveBeenCalledWith('Loading contacts', 'Something broke');
    });

    it('should extract FastAPI detail string from HTTP error', () => {
      const err = { error: { detail: 'Unauthorized access' }, status: 401 };
      service.handle(err, 'Auth check');
      expect(toastSpy.error).toHaveBeenCalledWith('Auth check', 'Unauthorized access');
    });

    it('should extract first FastAPI validation error from array detail', () => {
      const err = {
        error: { detail: [{ msg: 'field required', loc: ['body'], type: 'missing' }] },
      };
      service.handle(err, 'Create contact');
      expect(toastSpy.error).toHaveBeenCalledWith('Create contact', 'field required');
    });

    it('should use generic message for unknown error shape', () => {
      service.handle(null, 'Unknown operation');
      expect(toastSpy.error).toHaveBeenCalledWith('Unknown operation', 'error.generic');
    });

    it('should use generic message for undefined error', () => {
      service.handle(undefined, 'Test context');
      expect(toastSpy.error).toHaveBeenCalledWith('Test context', 'error.generic');
    });

    it('should use generic message when error is a plain string', () => {
      service.handle('some error string', 'Test');
      expect(toastSpy.error).toHaveBeenCalledWith('Test', 'error.generic');
    });

    it('should translate known API error messages', () => {
      translateSpy.t.mockImplementation((key: string) =>
        key === 'api.invalid_credentials' ? 'Credenciales invalidas' : key,
      );
      const err = { error: { detail: 'Invalid email or password' }, status: 401 };
      service.handle(err, 'Login');
      expect(toastSpy.error).toHaveBeenCalledWith('Login', 'Credenciales invalidas');
    });
  });
});
