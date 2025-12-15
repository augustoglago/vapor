import { AddToListModal } from "@/components/add-to-list-modal";
import { completeAchievements } from "@/services/achievements";
import { getGameAchievements, getGameDetails } from "@/services/games";
import { removeGameFromList } from "@/services/lists";
import { Achievement, Game } from "@/types";
import { Ionicons } from "@expo/vector-icons";
import { Image as ExpoImage } from "expo-image";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

/* ---------- helpers ---------- */
function removeHtmlTags(str?: string) {
  if (!str) return "";
  return str.replace(/<[^>]*>?/gm, "");
}

interface GameDetailsProps {
  visible: boolean;
  onClose: () => void;
  game: Game | null;
  currentListId?: number;
  onRemoveSuccess?: () => void;
}

export default function GameFullDetails({
  visible,
  onClose,
  game,
  currentListId,
  onRemoveSuccess,
}: GameDetailsProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [savingAchievement, setSavingAchievement] = useState<number | null>(
    null
  );

  const [isListModalVisible, setListModalVisible] = useState(false);
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);

  /* ---------- load ---------- */
  useEffect(() => {
    if (!game || !visible) return;

    setLoading(true);
    Promise.all([getGameAchievements(game.id), getGameDetails(game.appId)])
      .then(([achData, detailsData]) => {
        setAchievements(achData.achievementsList || []);
        setCompletedIds(achData.completedAchievementsIds || []);
        setDetails(detailsData);
      })
      .catch(() => {
        setAchievements([]);
        setCompletedIds([]);
      })
      .finally(() => setLoading(false));
  }, [game, visible]);

  if (!game) return null;

  /* ---------- marcar conquista ---------- */
  const toggleAchievement = async (achievementId: number) => {
    if (savingAchievement !== null) return;
    if (completedIds.includes(achievementId)) return;

    try {
      setSavingAchievement(achievementId);
      await completeAchievements(game.id, {
        achievementsIds: [achievementId],
      });
      setCompletedIds((prev) => [...prev, achievementId]);
    } catch {
      Platform.OS === "web"
        ? window.alert("Erro ao salvar conquista")
        : Alert.alert("Erro", "Não foi possível salvar a conquista");
    } finally {
      setSavingAchievement(null);
    }
  };

  const total = achievements.length;
  const unlocked = completedIds.length;
  const progress = total > 0 ? Math.round((unlocked / total) * 100) : 0;

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View className="flex-1 bg-slate-900">
        {/* fechar */}
        <Pressable
          onPress={onClose}
          className="absolute top-12 right-4 z-40 bg-black/50 p-2 rounded-full"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* imagem */}
          <View className="h-72">
            <ExpoImage
              source={{ uri: game.capsuleImageUrl }}
              className="w-full h-full"
              contentFit="cover"
            />
            <View className="absolute bottom-0 h-24 w-full bg-gradient-to-t from-slate-900 to-transparent" />
          </View>

          <View className="px-5 -mt-8 pb-10">
            <Text className="text-white text-3xl font-bold mb-2">
              {game.name}
            </Text>

            {/* ações */}
            <View className="flex-row gap-3 my-6">
              {currentListId ? (
                <Pressable
                  onPress={async () => {
                    try {
                      await removeGameFromList(currentListId, game.id);
                      onClose();
                      onRemoveSuccess?.();
                    } catch {}
                  }}
                  className="flex-1 bg-red-600 py-3 rounded-lg flex-row justify-center items-center gap-2"
                >
                  <Ionicons name="trash-outline" size={18} color="white" />
                  <Text className="text-white font-semibold">
                    Remover da lista
                  </Text>
                </Pressable>
              ) : (
                <Pressable
                  onPress={() => setListModalVisible(true)}
                  className="flex-1 bg-blue-600 py-3 rounded-lg flex-row justify-center items-center gap-2"
                >
                  <Ionicons name="add-circle-outline" size={18} color="white" />
                  <Text className="text-white font-semibold">
                    Adicionar à lista
                  </Text>
                </Pressable>
              )}
            </View>

            {/* ================= SOBRE ================= */}
            {details && (
              <View className="mb-8">
                <Text className="text-slate-100 text-lg font-semibold mb-3">
                  Sobre o jogo
                </Text>

                <View className="bg-slate-800/40 rounded-xl border border-slate-700/40 p-4">
                  <ScrollView
                    style={{ maxHeight: 200 }}
                    showsVerticalScrollIndicator
                  >
                    <Text className="text-slate-300 text-sm leading-6">
                      {removeHtmlTags(details.about_the_game)}
                    </Text>
                  </ScrollView>
                </View>

                <Text className="text-slate-500 text-xs mt-2">
                  Role para ler a descrição completa
                </Text>
              </View>
            )}

            {/* ================= CONQUISTAS ================= */}
            <Pressable
              onPress={() => setIsAchievementsExpanded((p) => !p)}
              className="flex-row justify-between items-center bg-slate-800/40 p-3 rounded-lg"
            >
              <Text className="text-white text-lg font-semibold">
                Conquistas
              </Text>
              {total > 0 && (
                <Text className="text-emerald-400 font-bold">
                  {unlocked}/{total} ({progress}%)
                </Text>
              )}
            </Pressable>

            {isAchievementsExpanded && (
              <View className="mt-4 bg-slate-800/50 rounded-xl p-4 gap-4">
                {/* loading */}
                {loading && <ActivityIndicator color="#e2e8f0" />}

                {/* sem conquistas */}
                {!loading && total === 0 && (
                  <View className="py-6 items-center">
                    <Ionicons
                      name="alert-circle-outline"
                      size={32}
                      color="#64748b"
                    />
                    <Text className="text-slate-400 text-sm mt-2 text-center">
                      Este jogo não possui conquistas disponíveis.
                    </Text>
                  </View>
                )}

                {/* lista */}
                {!loading &&
                  total > 0 &&
                  achievements.map((ach) => {
                    const unlockedAch = completedIds.includes(ach.id);
                    const saving = savingAchievement === ach.id;

                    return (
                      <Pressable
                        key={ach.id}
                        onPress={() => toggleAchievement(ach.id)}
                        disabled={unlockedAch || saving}
                        className="flex-row items-center gap-3"
                      >
                        <ExpoImage
                          source={{ uri: ach.image }}
                          className={`w-12 h-12 rounded-md ${
                            unlockedAch ? "" : "opacity-40 grayscale"
                          }`}
                        />

                        <View className="flex-1">
                          <Text
                            className={`font-bold ${
                              unlockedAch ? "text-white" : "text-slate-400"
                            }`}
                          >
                            {ach.name}
                          </Text>
                          <Text
                            className="text-slate-500 text-xs"
                            numberOfLines={2}
                          >
                            {ach.description}
                          </Text>
                        </View>

                        {saving ? (
                          <ActivityIndicator size="small" color="#34d399" />
                        ) : unlockedAch ? (
                          <Ionicons
                            name="checkmark-circle"
                            size={22}
                            color="#34d399"
                          />
                        ) : (
                          <Ionicons
                            name="ellipse-outline"
                            size={18}
                            color="#64748b"
                          />
                        )}
                      </Pressable>
                    );
                  })}
              </View>
            )}
          </View>
        </ScrollView>

        <AddToListModal
          visible={isListModalVisible}
          game={game}
          onClose={() => setListModalVisible(false)}
        />
      </View>
    </Modal>
  );
}
