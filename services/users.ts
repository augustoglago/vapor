// services/users.ts
import api from "./api";

/* ---------- Register ---------- */

export type RegisterPayload = {
  nick_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  birth_date: string;
  avatar?: string;
};

export type RegisterResponse = {
  message: string;
  user: {
    nick_name: string;
    first_name: string;
    last_name: string;
    email: string;
    birth_date: string;
    role: string;
  };
};

export async function registerUser(
  payload: RegisterPayload
): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/users/register", payload);
  return data;
}

/* ---------- Me ---------- */

export type UserMe = {
  nick_name: string;
  first_name: string;
  last_name: string;
  email: string;
  birth_date: string;
  role: string;
  avatar?: string;
  created_at: string;
  updated_at: string;
};

export type UserMeResponse = {
  data: UserMe;
};

export async function getMe(): Promise<UserMe> {
  const { data } = await api.get<UserMeResponse>("/users/me");
  return data.data;
}
