// services/lists.ts
import type { Game } from "@/types";
import api from "./api";

// ----- CREATE -----
export interface CreateListPayload {
  name: string;
  icon?: string;
  color?: string;
}
export interface CreateListResponse {
  message: string;
  data: {
    id: number;
    user_id: number;
    name: string;
    icon: string | null;
    color: string | null;
  };
}
export async function createList(
  payload: CreateListPayload
): Promise<CreateListResponse> {
  const res = await api.post<CreateListResponse>("/lists", payload);
  return res.data;
}

// ----- GET (todas) -----
export interface ListItem {
  id: number;
  user_id: number;
  name: string;
  icon?: string | null;
  color?: string | null;
}
export interface GetListsResponse {
  message: string;
  data: ListItem[];
}
export async function getLists(): Promise<GetListsResponse> {
  const res = await api.get<GetListsResponse>("/lists");
  return res.data;
}

// ----- GET (uma lista por id) -----
export interface GetListByIdResponse {
  message: string;
  data: ListItem;
}
export async function getListById(id: number): Promise<ListItem> {
  const res = await api.get<GetListByIdResponse>(`/lists/${id}`);
  return res.data.data;
}

// ----- ADD GAMES TO LIST -----
export interface AddGamesPayload {
  gameIds: number[];
}
export interface AddGamesResponse {
  message: string;
}
export async function addGamesToList(
  listId: number,
  payload: AddGamesPayload
): Promise<AddGamesResponse> {
  const res = await api.post<AddGamesResponse>(
    `/games-lists/${listId}`,
    payload
  );
  return res.data;
}

// ----- REMOVE GAMES FROM LIST (NOVO) -----
export interface RemoveGamesResponse {
  message?: string;
  error?: string;
}

export async function removeGameFromList(
  listId: number,
  gameId: number
): Promise<RemoveGamesResponse> {
  // ATENÇÃO: Em requisições DELETE com body (axios), usamos a propriedade 'data'
  const res = await api.delete<RemoveGamesResponse>(`/games-lists/${listId}`, {
    data: {
      gameIds: [gameId],
    },
  });
  return res.data;
}

// --- GET GAMES FROM LIST ---

export interface GetListGamesParams {
  cursor?: number;
  sortBy?: "id" | "game_id" | "created_at" | "appId" | "name";
  setOrder?: "asc" | "desc";
  search?: string;
}
export interface GetListGamesResponse {
  data: Game[];
  cursor?: number | null;
}

export async function getListGames(
  listId: number,
  params?: GetListGamesParams
): Promise<GetListGamesResponse> {
  const res = await api.get<GetListGamesResponse>(`/games-lists/${listId}`, {
    params,
  });
  return res.data;
}