import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { authInterceptor } from './auth.interceptor';
import { StorageService } from '../services/storage.service';
import { AuthService } from '../services/auth.service';

@Component({ standalone: true, template: '' })
class DummyComponent {}

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let http: HttpClient;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: 'auth/login', component: DummyComponent }])],
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        StorageService,
        AuthService,
      ],
    });

    httpMock = TestBed.inject(HttpTestingController);
    http = TestBed.inject(HttpClient);
    storage = TestBed.inject(StorageService);
    storage.clearTokens();
  });

  afterEach(() => {
    httpMock.verify();
    storage.clearTokens();
  });

  it('should attach Bearer token to outgoing requests when token exists', () => {
    storage.setTokens('my-access-token', 'refresh');

    http.get('/api/v1/contacts').subscribe();

    const req = httpMock.expectOne('/api/v1/contacts');
    expect(req.request.headers.get('Authorization')).toBe('Bearer my-access-token');
    req.flush([]);
  });

  it('should NOT attach Authorization header when no token is stored', () => {
    http.get('/api/v1/contacts').subscribe();

    const req = httpMock.expectOne('/api/v1/contacts');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });

  it('should call logout when 401 response is received and no refresh token', () => {
    const authService = TestBed.inject(AuthService);
    const logoutSpy = vi.spyOn(authService, 'logout');

    storage.setTokens('access', '');

    http.get('/api/v1/contacts').subscribe({ error: () => {} });

    const req = httpMock.expectOne('/api/v1/contacts');
    req.flush({ detail: 'Unauthorized' }, { status: 401, statusText: 'Unauthorized' });

    expect(logoutSpy).toHaveBeenCalled();
  });
});
