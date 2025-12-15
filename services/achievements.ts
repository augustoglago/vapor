import api from "./api";

export type CompleteAchievementsPayload = {
  achievementsIds: number[];
};

export async function completeAchievements(
  gameId: number,
  payload: CompleteAchievementsPayload
) {
  const { data } = await api.post(`/achievements/${gameId}`, payload);
  return data;
}
