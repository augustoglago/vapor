// services/users.ts
import api from "./api";

export type RegisterPayload = {
  nick_name: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  birth_date: string;
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

export async function registerUser(payload: RegisterPayload): Promise<RegisterResponse> {
  const { data } = await api.post<RegisterResponse>("/users/register", payload);
  return data;
}
