export interface SearchDocument {
  id: string;
  filename: string;
  fileType: string;
  fileSize: number;
  chunkCount: number;
  status: string; // processing, indexed, failed
  createdAt: string;
}

export interface SearchResult {
  chunkText: string;
  score: number;
  documentId: string;
  documentFilename: string;
  metadata: Record<string, unknown>;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  total: number;
}
