import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ContactService } from './contact.service';
import { Contact } from '../models/contact.model';
import { PaginatedResponse } from '../models/api.model';
import { environment } from '../../../environments/environment';
import { API_VERSION } from '../constants';

const BASE = `${environment.nexusCrmApiUrl}${API_VERSION}/contacts`;

const mockContact: Contact = {
  id: 'contact-1',
  firstName: 'Juan',
  lastName: 'Perez',
  email: 'juan@test.com',
  phone: null,
  companyId: null,
  companyName: null,
  position: null,
  source: 'other',
  assignedTo: null,
  tags: [],
  notes: null,
  tenantId: 'tenant-1',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockPage: PaginatedResponse<Contact> = {
  items: [mockContact],
  total: 1,
  page: 1,
  pageSize: 20,
  pages: 1,
};

describe('ContactService', () => {
  let service: ContactService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), ContactService],
    });
    service = TestBed.inject(ContactService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('list()', () => {
    it('should GET contacts with no params', () => {
      service.list().subscribe((res) => {
        expect(res.items.length).toBe(1);
        expect(res.total).toBe(1);
      });

      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('GET');
      req.flush(mockPage);
    });

    it('should pass search param', () => {
      service.list({ search: 'Juan' }).subscribe();
      const req = httpMock.expectOne((r) => r.url === BASE && r.params.get('search') === 'Juan');
      expect(req).toBeTruthy();
      req.flush(mockPage);
    });
  });

  describe('getById()', () => {
    it('should GET a single contact', () => {
      service.getById('contact-1').subscribe((c) => {
        expect(c.id).toBe('contact-1');
      });

      const req = httpMock.expectOne(`${BASE}/contact-1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockContact);
    });
  });

  describe('create()', () => {
    it('should POST a new contact', () => {
      const payload = { firstName: 'Ana', lastName: 'Lopez', source: 'other' as const };
      service.create(payload).subscribe((c) => {
        expect(c.firstName).toBe('Juan');
      });

      const req = httpMock.expectOne(BASE);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockContact);
    });
  });

  describe('update()', () => {
    it('should PUT an existing contact', () => {
      const payload = { firstName: 'Juan', lastName: 'Updated', source: 'other' as const };
      service.update('contact-1', payload).subscribe();

      const req = httpMock.expectOne(`${BASE}/contact-1`);
      expect(req.request.method).toBe('PUT');
      req.flush(mockContact);
    });
  });

  describe('remove()', () => {
    it('should DELETE a contact', () => {
      service.remove('contact-1').subscribe();

      const req = httpMock.expectOne(`${BASE}/contact-1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });
});
