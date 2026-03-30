import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
import { SearchDocument, SearchResponse } from '../models/search.model';
import { ApiService } from './api.service';

/** Service for semantic search operations */
@Injectable({ providedIn: 'root' })
export class SearchService extends ApiService {
  private readonly path = `${API_VERSION}/search`;

  /** Upload a document for indexing (multipart/form-data) */
  uploadDocument(file: File): Observable<SearchDocument> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<SearchDocument>(`${this.baseUrl}${this.path}/documents/upload`, formData);
  }

  /** List all indexed documents */
  listDocuments(): Observable<SearchDocument[]> {
    return this.get<SearchDocument[]>(`${this.path}/documents`);
  }

  /** Delete a document and all its chunks */
  deleteDocument(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/documents/${id}`);
  }

  /** Run a semantic search query */
  search(query: string, topK = 5): Observable<SearchResponse> {
    return this.post<SearchResponse>(`${this.path}/query`, { query, top_k: topK });
  }
}
