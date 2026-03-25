import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_VERSION } from '../constants';
import {
  CreatePipelineStageRequest,
  PipelineStage,
  ReorderStagesRequest,
  UpdatePipelineStageRequest,
} from '../models/pipeline.model';
import { ApiService } from './api.service';

/** Service for pipeline stages management */
@Injectable({ providedIn: 'root' })
export class PipelineService extends ApiService {
  private readonly path = `${API_VERSION}/pipeline-stages`;

  /**
   * Returns all pipeline stages ordered by position.
   */
  list(): Observable<PipelineStage[]> {
    return this.get<PipelineStage[]>(this.path);
  }

  /**
   * Fetches a single pipeline stage by its UUID.
   * @param id Stage UUID
   */
  getById(id: string): Observable<PipelineStage> {
    return this.get<PipelineStage>(`${this.path}/${id}`);
  }

  /**
   * Creates a new pipeline stage.
   * @param payload Stage creation payload
   */
  create(payload: CreatePipelineStageRequest): Observable<PipelineStage> {
    return this.post<PipelineStage>(this.path, payload);
  }

  /**
   * Updates an existing pipeline stage.
   * @param id Stage UUID
   * @param payload Updated fields
   */
  update(id: string, payload: UpdatePipelineStageRequest): Observable<PipelineStage> {
    return this.put<PipelineStage>(`${this.path}/${id}`, payload);
  }

  /**
   * Reorders pipeline stages by sending a new position array.
   * @param payload Array of stage IDs in the desired order
   */
  reorder(payload: ReorderStagesRequest): Observable<PipelineStage[]> {
    return this.post<PipelineStage[]>(`${this.path}/reorder`, payload);
  }

  /**
   * Deletes a pipeline stage by UUID.
   * @param id Stage UUID
   */
  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
