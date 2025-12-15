import api from "./api";

export type Avatar = {
  id: number;
  link: string;
};

export type AvatarsResponse = {
  data: Avatar[];
};

export async function getAvatars(): Promise<Avatar[]> {
  const { data } = await api.get<AvatarsResponse>("/avatars");
  return data.data;
}
