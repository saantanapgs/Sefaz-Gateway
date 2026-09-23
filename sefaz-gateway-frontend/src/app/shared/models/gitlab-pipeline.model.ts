/**
 * Corresponde a GitLabPipelineDTO no Swagger.
 * Compartilhado entre Gateway e Backend (ambos expõem endpoints de pipeline).
 */
export interface GitLabPipeline {
  id: number;
  iid: number;
  projectId: number;
  status: string;
  source: string;
  ref: string;
  sha: string;
  name?: string;
  webUrl: string;
  createdAt: string;
  updatedAt: string;
}
