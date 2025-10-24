// services/games.ts

import { GamesListResponse } from '@/types';
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