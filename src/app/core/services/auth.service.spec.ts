import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { AuthService } from './auth.service';
import { StorageService } from './storage.service';
import { AuthTokens } from '../models/auth.model';
import { environment } from '../../../environments/environment';
import { Component } from '@angular/core';

@Component({ standalone: true, template: '' })
class DummyComponent {}

const mockTokens: AuthTokens = {
  access_token:
    'eyJhbGciOiJIUzI1NiJ9.' +
    btoa(
      JSON.stringify({
        sub: 'user-1',
        email: 'test@test.com',
        tenant_id: 'tenant-1',
        role: 'owner',
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
      }),
    ) +
    '.signature',
  refresh_token: 'refresh-token-value',
  token_type: 'bearer',
};

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storage: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterModule.forRoot([{ path: 'auth/login', component: DummyComponent }])],
      providers: [provideHttpClient(), provideHttpClientTesting(), AuthService, StorageService],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storage = TestBed.inject(StorageService);
    storage.clearTokens();
  });

  afterEach(() => {
    httpMock.verify();
    storage.clearTokens();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login()', () => {
    it('should POST to auth/token and store tokens', () => {
      service.login({ email: 'test@test.com', password: 'password123' }).subscribe((tokens) => {
        expect(tokens.access_token).toBe(mockTokens.access_token);
      });

      const req = httpMock.expectOne(`${environment.nexusCrmApiUrl}/api/v1/auth/token`);
      expect(req.request.method).toBe('POST');
      req.flush(mockTokens);

      expect(storage.getAccessToken()).toBeTruthy();
    });

    it('should set isAuthenticated to true after login', () => {
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${environment.nexusCrmApiUrl}/api/v1/auth/token`);
      req.flush(mockTokens);

      expect(service.isAuthenticated()).toBe(true);
    });
  });

  describe('register()', () => {
    it('should POST to auth/register', () => {
      service
        .register({
          org_name: 'Acme',
          org_slug: 'acme',
          email: 'test@test.com',
          password: 'pass',
          first_name: 'Juan',
          last_name: 'Perez',
        })
        .subscribe();

      const req = httpMock.expectOne(`${environment.nexusCrmApiUrl}/api/v1/auth/register`);
      expect(req.request.method).toBe('POST');
      req.flush(mockTokens);
    });
  });

  describe('logout()', () => {
    it('should clear tokens and set currentUser to null', () => {
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${environment.nexusCrmApiUrl}/api/v1/auth/token`);
      req.flush(mockTokens);

      service.logout();

      expect(service.isAuthenticated()).toBe(false);
      expect(service.currentUser()).toBeNull();
      expect(storage.getAccessToken()).toBeNull();
    });
  });

  describe('refresh()', () => {
    it('should POST to auth/refresh with refresh token', () => {
      storage.setTokens('old-access', 'my-refresh-token');
      service.refresh().subscribe();

      const req = httpMock.expectOne(`${environment.nexusCrmApiUrl}/api/v1/auth/refresh`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual({ refresh_token: 'my-refresh-token' });
      req.flush(mockTokens);
    });
  });

  describe('isAdminOrOwner()', () => {
    it('should return true when role is owner', () => {
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${environment.nexusCrmApiUrl}/api/v1/auth/token`);
      req.flush(mockTokens);

      expect(service.isAdminOrOwner()).toBe(true);
    });

    it('should return false when not authenticated', () => {
      expect(service.isAdminOrOwner()).toBe(false);
    });
  });

  describe('hasRole()', () => {
    it('should return true when user has matching role', () => {
      service.login({ email: 'test@test.com', password: 'pass' }).subscribe();
      const req = httpMock.expectOne(`${environment.nexusCrmApiUrl}/api/v1/auth/token`);
      req.flush(mockTokens);

      expect(service.hasRole('owner')).toBe(true);
      expect(service.hasRole('admin')).toBe(false);
    });
  });
});
