import { Image as ExpoImage } from "expo-image";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";

import { getGames } from "@/services/games";
import { getLists, ListItem } from "@/services/lists";
import { getMe, UserMe } from "@/services/users";
import { Game } from "@/types";

import GameDetails from "./gamedetails";

/* ================= helpers de cor ================= */

function hexToRgb(hex?: string) {
  if (!hex) return { r: 71, g: 85, b: 105 };
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

/* ================= tela ================= */

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Game[]>([]);
  const [lists, setLists] = useState<ListItem[]>([]);
  const [user, setUser] = useState<UserMe | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openGameDetails = useCallback((game: Game) => {
    setSelectedGame(game);
    setDrawerVisible(true);
  }, []);

  const closeGameDetails = useCallback(() => {
    setDrawerVisible(false);
    setTimeout(() => setSelectedGame(null), 250);
  }, []);

  const fetchHomeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      // 🔥 LIMPA ESTADO ANTES DO FETCH
      if (!isRefresh) {
        setFeatured([]);
        setLists([]);
        setUser(null);
      }

      const [gamesRes, listsRes, me] = await Promise.all([
        getGames({}),
        getLists(),
        getMe(),
      ]);

      const games = gamesRes.data ?? [];
      setFeatured(games.slice(0, 8));
      setLists(listsRes.data ?? []);
      setUser(me);
    } catch (e) {
      console.error("Home fetch error:", e);
      setFeatured([]);
      setLists([]);
      setUser(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /* 🔥 ESSENCIAL: roda sempre que a Home ganha foco */
  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  if (loading && featured.length === 0 && lists.length === 0) {
    return (
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text className="text-slate-400 mt-3">Carregando…</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900">
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
        {/* ===== Boas-vindas ===== */}
        {user && (
          <View className="px-4 pt-4 pb-2">
            <Text className="text-slate-400 text-xs">👋 Bem-vindo,</Text>
            <Text className="text-slate-100 text-xl font-semibold">
              {user.nick_name}
            </Text>
          </View>
        )}

        {/* ===== Minhas listas ===== */}
        <View className="px-4 mt-4 mb-2">
          <Text className="text-slate-100 text-lg font-semibold">
            Minhas listas
          </Text>
        </View>

        <View className="px-4 mb-4">
          <View className="flex-row flex-wrap -mx-2">
            {lists.length === 0 ? (
              <Text className="text-slate-400 px-2">
                Você ainda não criou nenhuma lista.
              </Text>
            ) : (
              lists.slice(0, 4).map((l) => (
                <Pressable
                  key={l.id}
                  className="w-1/2 px-2 mb-3"
                  onPress={() =>
                    router.push({
                      pathname: `/lists/${l.id}`,
                      params: {
                        name: l.name,
                        icon: l.icon ?? "",
                        color: l.color ?? "",
                      },
                    })
                  }
                >
                  <View
                    className="h-28 rounded-xl p-3 border border-slate-700/40"
                    style={{ backgroundColor: mixWithSlate(l.color) }}
                  >
                    <Text className="text-2xl mb-1">{l.icon || "🎮"}</Text>
                    <Text
                      className="text-slate-100 font-semibold"
                      numberOfLines={1}
                    >
                      {l.name}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </View>
        </View>

        {/* ===== Destaques ===== */}
        <View className="px-4 mb-2">
          <Text className="text-slate-100 text-lg font-semibold">
            Destaques
          </Text>
        </View>

        <FlatList
          data={featured}
          horizontal
          keyExtractor={(item) => String(item.id)}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <Pressable onPress={() => openGameDetails(item)} className="mr-3">
              <View className="w-36 h-52 rounded-xl overflow-hidden border border-slate-700/30">
                <ExpoImage
                  source={{ uri: item.capsuleImageUrl }}
                  contentFit="cover"
                  className="w-full h-full"
                />
              </View>
              <Text
                numberOfLines={1}
                className="text-slate-200 mt-2 w-36 text-xs"
              >
                {item.name}
              </Text>
            </Pressable>
          )}
        />
      </ScrollView>

      <GameDetails
        visible={drawerVisible}
        game={selectedGame}
        onClose={closeGameDetails}
      />
    </View>
  );
}
