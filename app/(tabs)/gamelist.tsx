// app/(tabs)/gamelist.tsx

import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input, InputField } from "@/components/ui/input";
import { getGames } from "@/services/games";
import { Game } from "@/types";
import { Image } from "expo-image";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Platform,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import GameDetails from "./gamedetails";

const GameItem = ({ game, onPress }: { game: Game; onPress?: () => void }) => {
  const CONTAINER_ASPECT_RATIO = 0.69;

  return (
    <Pressable
      onPress={onPress}
      className="m-1 rounded-xl overflow-hidden shadow-lg border border-slate-700/30"
      style={{ width: "31%", aspectRatio: CONTAINER_ASPECT_RATIO }}
    >
      <Image
        source={{ uri: game.capsuleImageUrl }}
        contentFit="cover"
        className="w-full h-full absolute inset-0"
        blurRadius={40}
        style={{ tintColor: "rgba(0,0,0,0.5)" }}
      />

      <View className="w-full p-1 justify-center items-center">
        <Image
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
    </Pressable>
  );
};

export default function GameListScreen() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchString, setSearchString] = useState("");
  
  // --- Lógica do Modal ---
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const openGameDetails = (game: Game) => {
    setSelectedGame(game);
    setDrawerVisible(true);
  };

  const closeGameDetails = () => {
    setDrawerVisible(false);
    // Pequeno delay para limpar a seleção apenas após a animação de fechar
    setTimeout(() => setSelectedGame(null), 300);
  };
  // ----------------------

  const nextCursorRef = useRef<number | undefined>(undefined);
  const searchStringRef = useRef("");
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLoadingRef = useRef(false);

  const fetchGamesData = useCallback(
    async (isInitialLoad = false, isRefresh = false, searchParam?: string) => {
      const currentSearch =
        searchParam !== undefined ? searchParam : searchStringRef.current;
      const cursor =
        isInitialLoad || isRefresh || currentSearch
          ? undefined
          : nextCursorRef.current;

      if (!cursor && !isInitialLoad && !isRefresh && !currentSearch) return;
      if (isLoadingRef.current) return;

      isLoadingRef.current = true;

      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const result = await getGames({
          cursor,
          search: currentSearch || undefined,
        });

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
    },
    []
  );

  useEffect(() => {
    fetchGamesData(true);
    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [fetchGamesData]);

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
    if (
      searchStringRef.current ||
      nextCursorRef.current === undefined ||
      loading ||
      refreshing ||
      isLoadingRef.current
    )
      return;
    fetchGamesData(false);
  };

  const renderFooter = () => {
    if (!loading && nextCursorRef.current === undefined) return null;
    if (!loading) return null;
    return (
      <View className="py-4 justify-center items-center">
        <ActivityIndicator size="large" color="#e2e8f0" />
      </View>
    );
  };

  return (
    <View className="flex-1 bg-vapor-primary"> 
      {/* Nota: Garanta que bg-vapor-primary existe no seu tailwind.config ou use bg-slate-900 */}
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
        renderItem={({ item }) => (
          <GameItem
            game={item}
            onPress={() => openGameDetails(item)} // Corrigido para chamar a função correta
          />
        )}
        numColumns={3}
        columnWrapperStyle={{
          justifyContent: "flex-start",
          marginHorizontal: 8,
          marginVertical: 4,
        }}
        className="pt-2"
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchGamesData(true, true)}
            tintColor="#e2e8f0"
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={() => {
          if (loading || refreshing) return null;
          return (
            <View className="flex-1 justify-center items-center p-8">
              <Text className="text-slate-400 text-lg text-center">
                {searchStringRef.current && games.length === 0
                  ? "Nenhum jogo encontrado para a sua busca."
                  : "Nenhum jogo disponível no momento."}
              </Text>
            </View>
          );
        }}
      />

      {/* Modal de adicionar à lista */}
      <GameDetails
        visible={isDrawerVisible}
        onClose={closeGameDetails}
        game={selectedGame}
      />
    </View>
  );
}