/** Pipeline stage entity */
export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  is_won: boolean;
  is_lost: boolean;
  color: string;
  tenant_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePipelineStageRequest {
  name: string;
  order: number;
  is_won?: boolean;
  is_lost?: boolean;
  color?: string;
}

export interface UpdatePipelineStageRequest extends CreatePipelineStageRequest {}

export interface ReorderStagesRequest {
  stage_ids: string[];
}
