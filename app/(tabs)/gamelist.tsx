// app/gamelist.tsx
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input, InputField } from "@/components/ui/input";
import { getGames } from "@/services/games";
import { Game } from "@/types";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, FlatList, Platform, RefreshControl, Text, View } from "react-native";

const GameItem = ({ game }: { game: Game }) => {
  return (
    <View className="m-1 rounded-xl overflow-hidden shadow-lg border border-slate-700/30" style={{ width: "31%", aspectRatio: 1 / 1.3 }}>
      <Image source={{ uri: game.capsuleImageUrl }} contentFit="cover" className="w-full h-full" />
    </View>
  );
};

export default function GameListScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchString, setSearchString] = useState("");

  const nextCursorRef = useRef<number | undefined>(undefined);
  const searchStringRef = useRef("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  const fetchGamesData = useCallback(async (isInitialLoad = false, isRefresh = false, searchParam?: string) => {
    const currentSearch = searchParam !== undefined ? searchParam : searchStringRef.current;
    const cursor = isInitialLoad || isRefresh || currentSearch ? undefined : nextCursorRef.current;

    if (!cursor && !isInitialLoad && !isRefresh && !currentSearch) return;
    if (isLoadingRef.current) return;

    isLoadingRef.current = true;

    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result = await getGames({ cursor, search: currentSearch || undefined });

      setGames((prev) => {
        if (isInitialLoad || isRefresh || currentSearch) return result.data;
        return [...prev, ...result.data];
      });

      nextCursorRef.current = result.cursor;
    } catch (e) {
      console.error("Falha na requisição de jogos:", e);
      if (isInitialLoad || isRefresh || currentSearch) setGames([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
      isLoadingRef.current = false;
    }
  }, []);

  // Inicialização
  useEffect(() => {
    fetchGamesData(true);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [fetchGamesData]);

  // Busca com debounce
  const handleSearchChange = useCallback(
    (text: string) => {
      setSearchString(text);
      searchStringRef.current = text;

      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

      searchTimeoutRef.current = setTimeout(() => {
        fetchGamesData(true, false, text);
      }, 500);
    },
    [fetchGamesData]
  );

  const handleLoadMore = () => {
    if (searchStringRef.current || nextCursorRef.current === undefined || loading || refreshing || isLoadingRef.current) return;
    fetchGamesData(false);
  };

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View className="py-4 justify-center items-center">
        <ActivityIndicator size="large" color="#e2e8f0" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-vapor-primary">
      <View className="px-4 pt-3 pb-1 bg-vapor-primary border-slate-700/20">
        <Input className="rounded-xl bg-vapor-secondary border border-slate-600/20">
          <View
            className="absolute left-3 z-10"
            style={{
              top: Platform.OS === "web" ? 12 : "50%",
              ...(Platform.OS !== "web" && { marginTop: -9 }),
            }}
          >
            <IconSymbol name="magnifyingglass" size={18} color="#64748B" />
          </View>
          <InputField
            placeholder="Pesquisar jogos..."
            placeholderTextColor="#64748B"
            className="text-slate-400 pl-10 pr-4 py-3"
            value={searchString}
            onChangeText={handleSearchChange}
          />
        </Input>
      </View>

      <FlatList
        data={games}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => <GameItem game={item} />}
        numColumns={3}
        columnWrapperStyle={{ justifyContent: "space-between", marginHorizontal: 8, marginVertical: 4 }}
        className="pt-2"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchGamesData(true, true)} tintColor="#e2e8f0" />}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => {
          if (loading || refreshing) return null;
          return (
            <View className="flex-1 justify-center items-center p-8">
              <Text className="text-slate-400 text-lg text-center">
                {searchStringRef.current ? "Nenhum jogo encontrado para a sua busca." : "Nenhum jogo disponível no momento."}
              </Text>
            </View>
          );
        }}
      />
    </View>
  );
}
