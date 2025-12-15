import { deleteList, getListGames } from "@/services/lists";
import { Game } from "@/types";
import { Image as ExpoImage } from "expo-image";
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { ArrowLeft, Trash2 } from "lucide-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

import GameDetails from "../gamedetails";

/* ================= Helpers de cor ================= */

function hexToRgb(hex?: string) {
  if (!hex) return { r: 71, g: 85, b: 105 };
  let h = (hex || "").replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const num = parseInt(h || "475569", 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function getReadableTextColor(hex?: string) {
  const { r, g, b } = hexToRgb(hex);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L > 0.6 ? "#0f172a" : "#F8FAFC";
}

function mixWithSlate(hex?: string, factor = 0.25) {
  const { r, g, b } = hexToRgb(hex);
  const slate = { r: 15, g: 23, b: 42 };
  const m = (a: number, b: number) => Math.round(a * (1 - factor) + b * factor);
  return `rgb(${m(r, slate.r)}, ${m(g, slate.g)}, ${m(b, slate.b)})`;
}

/* ================= Game Card ================= */

function GameCard({ game, onPress }: { game: Game; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="m-1 rounded-xl overflow-hidden border border-slate-700/30"
      style={{ width: "31%", aspectRatio: 0.69 }}
    >
      <ExpoImage
        source={{ uri: game.capsuleImageUrl }}
        contentFit="cover"
        className="w-full h-full absolute inset-0"
        blurRadius={40}
        style={{ tintColor: "rgba(0,0,0,0.45)" }}
      />
      <View className="w-full p-1 justify-center items-center">
        <ExpoImage
          source={{ uri: game.headerImageUrl }}
          contentFit="contain"
          className="w-full rounded-sm"
          style={{ aspectRatio: 1 }}
        />
      </View>
      <View className="flex-1 justify-center items-center p-2">
        <Text
          className="text-white text-xs text-center font-semibold"
          numberOfLines={2}
        >
          {game.name}
        </Text>
      </View>
    </Pressable>
  );
}

/* ================= Tela ================= */

export default function ListDetailScreen() {
  const { id, name, icon, color } = useLocalSearchParams<{
    id: string;
    name?: string;
    icon?: string;
    color?: string;
  }>();

  const listId = id ? Number(id) : 0;

  const headerBg = useMemo(
    () => mixWithSlate(color ?? "#475569", 0.28),
    [color]
  );
  const headerText = useMemo(
    () => getReadableTextColor(color ?? "#475569"),
    [color]
  );

  const [games, setGames] = useState<Game[]>([]);
  const [cursor, setCursor] = useState<number | null | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const loadingRef = useRef(false);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

  const openGameDetails = (game: Game) => {
    setSelectedGame(game);
    setDetailsVisible(true);
  };

  const closeGameDetails = () => {
    setDetailsVisible(false);
    setTimeout(() => setSelectedGame(null), 300);
  };

  const fetchGames = useCallback(
    async (reset = true) => {
      if (!listId) return;
      if (loadingRef.current) return;

      loadingRef.current = true;

      try {
        if (reset) {
          setLoading(true);
          setCursor(undefined);
        }

        const res = await getListGames(listId, reset ? {} : { cursor });

        setGames((prev) => (reset ? res.data : [...prev, ...res.data]));
        setCursor(res.cursor ?? null);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [listId, cursor]
  );

  // reset quando muda de lista
  useEffect(() => {
    setGames([]);
    setCursor(undefined);
    setLoading(true);
  }, [listId]);

  // carrega ao entrar pela primeira vez
  useEffect(() => {
    if (listId) fetchGames(true);
  }, [listId, fetchGames]);

  useFocusEffect(
    useCallback(() => {
      if (listId) fetchGames(true);
    }, [listId, fetchGames])
  );

  const loadMore = () => {
    if (cursor == null || loading || loadingRef.current) return;
    fetchGames(false);
  };

  const handleGameRemoved = () => {
    fetchGames(true);
  };

  /* ================= DELETE LIST (WEB + MOBILE) ================= */

  const confirmDelete = async () => {
    try {
      await deleteList(listId);
      router.replace("/(tabs)/lists");
    } catch (e) {
      console.error("Erro ao deletar lista:", e);
      Alert.alert("Erro", "Não foi possível excluir a lista.");
    }
  };

  const handleDeleteList = () => {
    if (Platform.OS === "web") {
      const ok = window.confirm("Tem certeza que deseja excluir esta lista?");
      if (ok) confirmDelete();
    } else {
      Alert.alert(
        "Excluir lista",
        "Tem certeza que deseja excluir esta lista?",
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Excluir", style: "destructive", onPress: confirmDelete },
        ]
      );
    }
  };

  if (loading && games.length === 0) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text className="text-slate-400 mt-3">Carregando jogos…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
      {/* Header */}
      <View
        className="px-4 pb-3 pt-4 border-b border-slate-700/20"
        style={{ backgroundColor: headerBg }}
      >
        <View className="flex-row items-center justify-between mb-3">
          <Pressable onPress={() => router.back()}>
            <ArrowLeft size={22} color={headerText} />
          </Pressable>

          <Pressable onPress={handleDeleteList} hitSlop={12} className="p-2">
            <Trash2 size={20} color={headerText} />
          </Pressable>
        </View>

        <View className="flex-row items-center">
          <Text style={{ color: headerText }} className="text-3xl mr-2">
            {icon || "🎮"}
          </Text>
          <View>
            <Text
              style={{ color: headerText }}
              className="text-lg font-semibold"
            >
              {name ?? "Lista"}
            </Text>
            <Text
              style={{ color: headerText + "AA" }}
              className="text-2xs mt-0.5"
            >
              {games.length} jogo{games.length === 1 ? "" : "s"}
            </Text>
          </View>
        </View>
      </View>

      {/* Lista de jogos */}
      {games.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-slate-400 text-center">
            Nenhum jogo nesta lista ainda.
          </Text>
        </View>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(g) => String(g.id)}
          renderItem={({ item }) => (
            <GameCard game={item} onPress={() => openGameDetails(item)} />
          )}
          numColumns={3}
          columnWrapperStyle={{
            marginHorizontal: 8,
            marginVertical: 4,
          }}
          contentContainerStyle={{ paddingBottom: 12 }}
          onEndReachedThreshold={0.5}
          onEndReached={loadMore}
          ListFooterComponent={
            loading && cursor !== null ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#e2e8f0" />
              </View>
            ) : null
          }
        />
      )}

      <GameDetails
        visible={detailsVisible}
        onClose={closeGameDetails}
        game={selectedGame}
        currentListId={listId}
        onRemoveSuccess={handleGameRemoved}
      />
    </View>
  );
}
