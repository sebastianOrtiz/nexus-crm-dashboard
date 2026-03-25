import { TestBed } from '@angular/core/testing';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [StorageService] });
    service = TestBed.inject(StorageService);
    localStorage.clear();
  });

  afterEach(() => localStorage.clear());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getAccessToken()', () => {
    it('should return null when no token is stored', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should return the stored access token', () => {
      service.setTokens('my-access', 'my-refresh');
      expect(service.getAccessToken()).toBe('my-access');
    });
  });

  describe('getRefreshToken()', () => {
    it('should return null when no token is stored', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should return the stored refresh token', () => {
      service.setTokens('access', 'my-refresh');
      expect(service.getRefreshToken()).toBe('my-refresh');
    });
  });

  describe('setTokens()', () => {
    it('should store both access and refresh tokens', () => {
      service.setTokens('access-123', 'refresh-456');
      expect(service.getAccessToken()).toBe('access-123');
      expect(service.getRefreshToken()).toBe('refresh-456');
    });
  });

  describe('clearTokens()', () => {
    it('should remove both tokens from storage', () => {
      service.setTokens('access', 'refresh');
      service.clearTokens();
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
    });
  });

  describe('hasTokens()', () => {
    it('should return false when no access token', () => {
      expect(service.hasTokens()).toBe(false);
    });

    it('should return true when access token is present', () => {
      service.setTokens('access', 'refresh');
      expect(service.hasTokens()).toBe(true);
    });
  });
});
