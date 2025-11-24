// app/(tabs)/home.tsx
import { getGames } from "@/services/games";
import { getLists, ListItem } from "@/services/lists";
import { Game } from "@/types";
import { getJSON } from "@/utils/storage";
import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

/* ---------- helpers de cor ---------- */
function hexToRgb(hex?: string) {
  if (!hex) return { r: 71, g: 85, b: 105 }; // slate-600
  let h = hex.replace("#", "");
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const num = parseInt(h, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}
function getReadableTextColor(hex?: string) {
  const { r, g, b } = hexToRgb(hex);
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return L > 0.6 ? "#0f172a" : "#F8FAFC";
}
function mixWithSlate(hex?: string, factor = 0.28) {
  const { r, g, b } = hexToRgb(hex);
  const slate = { r: 15, g: 23, b: 42 };
  const m = (a: number, b: number) => Math.round(a * (1 - factor) + b * factor);
  return `rgb(${m(r, slate.r)}, ${m(g, slate.g)}, ${m(b, slate.b)})`;
}

function SectionTitle({
  title,
  actionLabel,
  onPressAction,
}: {
  title: string;
  actionLabel?: string;
  onPressAction?: () => void;
}) {
  return (
    <View className="px-4 mt-4 mb-1 flex-row items-center justify-between">
      <Text className="text-slate-100 text-lg font-semibold">{title}</Text>
      {!!actionLabel && onPressAction ? (
        <Pressable
          onPress={onPressAction}
          className="px-3 py-1 rounded-full bg-slate-700/40 border border-slate-600/40"
        >
          <Text className="text-slate-200 text-xs font-medium">
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function CategoryPill({
  name,
  onPress,
}: {
  name: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-2 px-3 py-2 rounded-full bg-slate-800/60 border border-slate-700/50"
    >
      <Text className="text-slate-300 text-xs">{name}</Text>
    </Pressable>
  );
}


function UserListCard({ item }: { item: ListItem }) {
  const bg = useMemo(
    () => mixWithSlate(item.color ?? "#475569", 0.28),
    [item.color]
  );
  const text = useMemo(
    () => getReadableTextColor(item.color ?? "#475569"),
    [item.color]
  );

  return (
    <Pressable
      className="w-1/2 px-2 mb-3"
      onPress={() =>
        router.push({
          pathname: `/lists/${item.id}`,
          params: {
            name: item.name,
            icon: item.icon ?? "",
            color: item.color ?? "",
          },
        })
      }
    >
      <View
        className="h-28 rounded-xl p-3 overflow-hidden border border-slate-900/40"
        style={{ backgroundColor: bg }}
      >
        <Text style={{ color: text }} className="text-2xl mb-1">
          {item.icon || "🎮"}
        </Text>
        <Text
          style={{ color: text }}
          className="font-semibold"
          numberOfLines={1}
        >
          {item.name}
        </Text>
        <Text className="text-xs mt-0.5" style={{ color: text + "AA" }}>
          toque para abrir
        </Text>
      </View>
    </Pressable>
  );
}

function GameThumb({ game, onPress }: { game: Game; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} className="mr-3">
      <View className="w-36 h-52 rounded-xl overflow-hidden border border-slate-700/30 bg-slate-800/40">
        <ExpoImage
          source={{ uri: game.capsuleImageUrl }}
          contentFit="cover"
          className="w-full h-full"
        />
      </View>
      <Text numberOfLines={1} className="text-slate-200 mt-2 w-36 text-xs">
        {game.name ?? "Jogo"}
      </Text>
    </Pressable>
  );
}

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Game[]>([]);
  const [recent, setRecent] = useState<Game[]>([]);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchHomeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [gamesRes, listsRes] = await Promise.all([
        getGames({ cursor: undefined, search: undefined }),
        getLists(),
      ]);
      const listGames = gamesRes.data || [];
      setFeatured(listGames.slice(0, 8));
      setRecent(listGames.slice(8, 20));
      setLists(listsRes.data ?? []);
      // ordena por último acesso (map salvo localmente)
      const accessMap =
        (await getJSON<Record<string, number>>("lists_last_access")) || {};
      const ordered = (listsRes.data ?? []).slice().sort((a, b) => {
        const ta = accessMap[String(a.id)] ?? 0;
        const tb = accessMap[String(b.id)] ?? 0;
        return tb - ta;
      });
      setLists(ordered);
    } catch (e) {
      console.error("Home fetch error:", e);
      setFeatured([]);
      setRecent([]);
      setLists([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchHomeData();
  }, [fetchHomeData]);

  if (loading) {
    return (
      <View className="flex-1 bg-vapor-primary items-center justify-center">
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text className="text-slate-400 mt-3">Carregando…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-vapor-primary">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchHomeData(true)}
            tintColor="#e2e8f0"
          />
        }
      >
        {/* Categorias */}
        <SectionTitle title="Categorias" />
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 8 }}
        >
          {[
            "Ação",
            "RPG",
            "Corrida",
            "Indie",
            "Estratégia",
            "Multiplayer",
            "Simulação",
          ].map((c) => (
            <CategoryPill
              key={c}
              name={c}
              onPress={() => router.push("/gamelist")}
            />
          ))}
        </ScrollView>

        {/* Minhas listas (do usuário) */}
        <SectionTitle
          title="Minhas listas"
          actionLabel="Ver todas"
          onPressAction={() => router.push("/(tabs)/lists")}
        />
        <View className="px-4 mb-1">
          <View className="flex-row flex-wrap -mx-2">
            {lists.length === 0 ? (
              <Text className="text-slate-400 px-2 py-2">
                Você ainda não criou nenhuma lista.
              </Text>
            ) : (
              lists.slice(0, 4).map((l) => <UserListCard key={l.id} item={l} />)
            )}
          </View>
        </View>

        {/* Destaques */}
        <SectionTitle
          title="Destaques"
          actionLabel="Ver todos"
          onPressAction={() => router.push("/gamelist")}
        />
        <FlatList
          data={featured}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
          renderItem={({ item }) => (
            <GameThumb game={item} onPress={() => router.push("/gamelist")} />
          )}
          ListEmptyComponent={
            <Text className="text-slate-400 px-4">
              Nenhum destaque disponível.
            </Text>
          }
          scrollEnabled
        />

        {/* Recentes */}
        <SectionTitle
          title="Recentes"
          actionLabel="Ver todos"
          onPressAction={() => router.push("/gamelist")}
        />
        <FlatList
          data={recent}
          keyExtractor={(item) => String(item.id)}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 6 }}
          renderItem={({ item }) => (
            <GameThumb game={item} onPress={() => router.push("/gamelist")} />
          )}
          ListEmptyComponent={
            <Text className="text-slate-400 px-4">
              Nenhum jogo recente disponível.
            </Text>
          }
          scrollEnabled
        />
      </ScrollView>
    </View>
  );
}
