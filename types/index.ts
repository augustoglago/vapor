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

export interface Achievement {
  id: number;
  game_id: number;
  name: string;
  description: string;
  image: string;
}

export interface AchievementsResponse {
  achievementsList: Achievement[];
  completedAchievementsIds: number[];
}