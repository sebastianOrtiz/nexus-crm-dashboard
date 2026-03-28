/** Pipeline stage entity */
export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  isWon: boolean;
  isLost: boolean;
  color: string;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePipelineStageRequest {
  name: string;
  order: number;
  isWon?: boolean;
  isLost?: boolean;
  color?: string;
}

export interface UpdatePipelineStageRequest extends CreatePipelineStageRequest {}

export interface ReorderStagesRequest {
  stageIds: string[];
}
