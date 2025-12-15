import type { Game } from "@/types";
import api from "./api";

/* ================= CREATE LIST ================= */

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

/* ================= GET LISTS ================= */

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

/* ================= GET LIST BY ID ================= */

export interface GetListByIdResponse {
  message: string;
  data: ListItem;
}

export async function getListById(id: number): Promise<ListItem> {
  const res = await api.get<GetListByIdResponse>(`/lists/${id}`);
  return res.data.data;
}

/* ================= UPDATE LIST ================= */

export interface UpdateListPayload {
  name?: string;
  icon?: string;
  color?: string;
}

export interface UpdateListResponse {
  message: string;
  data: ListItem;
}

export async function updateList(
  listId: number,
  payload: UpdateListPayload
): Promise<UpdateListResponse> {
  const res = await api.put<UpdateListResponse>(`/lists/${listId}`, payload);
  return res.data;
}

/* ================= DELETE LIST ================= */

export interface DeleteListResponse {
  message: string;
}

export async function deleteList(listId: number): Promise<DeleteListResponse> {
  const res = await api.delete<DeleteListResponse>(`/lists/${listId}`);
  return res.data;
}

/* ================= GAMES IN LIST ================= */

export interface AddGamesPayload {
  gameIds: number[];
}

export async function addGamesToList(listId: number, payload: AddGamesPayload) {
  const res = await api.post(`/games-lists/${listId}`, payload);
  return res.data;
}

export async function removeGameFromList(listId: number, gameId: number) {
  const res = await api.delete(`/games-lists/${listId}`, {
    data: {
      gameIds: [gameId],
    },
  });
  return res.data;
}

/* ================= GET GAMES FROM LIST ================= */

export interface GetListGamesParams {
  cursor?: number;
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
