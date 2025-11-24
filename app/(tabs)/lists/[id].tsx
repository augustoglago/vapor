// app/(tabs)/lists/[id].tsx
import { getListGames } from "@/services/lists";
import { Game } from "@/types";
import { Image as ExpoImage } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    Text,
    View,
} from "react-native";

// helpers de cor
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

function GameCard({ game }: { game: Game }) {
  return (
    <View
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
          style={{ aspectRatio: 1, height: undefined }}
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
    </View>
  );
}

export default function ListDetailScreen() {
  const { id, name, icon, color } = useLocalSearchParams<{
    id: string;
    name?: string;
    icon?: string;
    color?: string;
  }>();
  const listId = Number(id);

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
  const loadingRef = useRef(false); // evita dupla chamada no StrictMode

  const fetchGames = useCallback(
    async (reset = true) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        setLoading(true);
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

  useEffect(() => {
    fetchGames(true);
  }, [fetchGames]);

  const loadMore = () => {
    if (cursor == null || loading || loadingRef.current) return;
    fetchGames(false);
  };

  if (loading && games.length === 0) {
    return (
      <View className="flex-1 bg-vapor-primary items-center justify-center">
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text className="text-slate-400 mt-3">Carregando…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-vapor-primary">
      {/* Header da lista */}
      <View
        className="px-4 pb-3 pt-4 border-b border-slate-700/20"
        style={{ backgroundColor: headerBg }}
      >
        <Pressable
          className="mb-3 -ml-1"
          onPress={() => router.back()}
          accessibilityRole="button"
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={22} color={headerText} />
        </Pressable>
        <View className="flex-row items-center justify-between">
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
      </View>

      {/* Grid de jogos */}
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
          renderItem={({ item }) => <GameCard game={item} />}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            marginHorizontal: 8,
            marginVertical: 4,
          }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            loading && cursor !== null ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#e2e8f0" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );
}
