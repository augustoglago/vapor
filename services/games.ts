// services/games.ts

import { AchievementsResponse, GamesListResponse } from '@/types'; // Adicione AchievementsResponse aqui
import api from './api';

interface GetGamesParams {
  cursor?: number;
  search?: string;
}

/**
 * Busca a lista de jogos na API.
 * @param params - cursor para paginação ou search para busca.
 * @returns Uma Promise que resolve para GamesListResponse.
 */
export async function getGames({ cursor, search }: GetGamesParams): Promise<GamesListResponse> {
  try {
    const response = await api.get<GamesListResponse>('/games', {
      params: {
        cursor,
        search,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar jogos:', error);
    throw error;
  }
}

/**
 * Busca as conquistas de um jogo específico e o progresso do usuário.
 * Endpoint baseado no Swagger: GET /achievements/{id}
 * @param gameId - ID do jogo.
 * @returns Uma Promise com a lista de conquistas e IDs completados.
 */
export async function getGameAchievements(gameId: number): Promise<AchievementsResponse> {
  try {
    // A rota no Swagger é /achievements/{id}
    const response = await api.get<AchievementsResponse>(`/achievements/${gameId}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar conquistas do jogo ${gameId}:`, error);
    throw error;
  }
}