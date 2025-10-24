export interface Game {
  id: number;
  appId: number;
  name: string;
  headerImageUrl: string;
  capsuleImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface GamesListResponse {
  data: Game[];
  cursor?: number;
}