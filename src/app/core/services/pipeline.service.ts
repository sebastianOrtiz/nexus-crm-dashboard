import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
  private readonly path = '/api/v1/pipeline-stages';

  list(): Observable<PipelineStage[]> {
    return this.get<PipelineStage[]>(this.path);
  }

  getById(id: string): Observable<PipelineStage> {
    return this.get<PipelineStage>(`${this.path}/${id}`);
  }

  create(payload: CreatePipelineStageRequest): Observable<PipelineStage> {
    return this.post<PipelineStage>(this.path, payload);
  }

  update(id: string, payload: UpdatePipelineStageRequest): Observable<PipelineStage> {
    return this.put<PipelineStage>(`${this.path}/${id}`, payload);
  }

  reorder(payload: ReorderStagesRequest): Observable<PipelineStage[]> {
    return this.post<PipelineStage[]>(`${this.path}/reorder`, payload);
  }

  remove(id: string): Observable<void> {
    return this.delete<void>(`${this.path}/${id}`);
  }
}
