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

export interface GameDetails {
  app_id: number;
  name: string;
  detailed_description: string;
  about_the_game: string;
  header_image: string;
  developers: string[];
  publishers: string[];
  price: string;
  categories: string[];
  genres: string[];
  release_date: {
    coming_soon: boolean;
    date: string;
  };
  background: string;
}