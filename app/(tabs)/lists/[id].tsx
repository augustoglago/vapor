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

// Importação do componente de Detalhes
// Certifique-se que o caminho "../gamedetails" está correto para o seu arquivo
import GameDetails from "../gamedetails";

// --- Helpers de cor ---
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

// --- Componente GameCard ---
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
}

// --- TELA PRINCIPAL ---
export default function ListDetailScreen() {
  const { id, name, icon, color } = useLocalSearchParams<{
    id: string;
    name?: string;
    icon?: string;
    color?: string;
  }>();
  
  // Converte o ID da URL para número de forma segura
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

  // --- Estados do Modal de Detalhes ---
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

  // Callback chamado quando um jogo é removido com sucesso
  const handleGameRemoved = () => {
    // Recarrega a lista do zero para sumir com o jogo removido
    fetchGames(true);
  };

  const fetchGames = useCallback(
    async (reset = true) => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        if (reset) setLoading(true); // Mostra loading se for reset
        
        const res = await getListGames(listId, reset ? {} : { cursor });
        
        setGames((prev) => (reset ? res.data : [...prev, ...res.data]));
        setCursor(res.cursor ?? null);
      } catch (error) {
        console.error("Erro ao buscar jogos:", error);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    },
    [listId, cursor]
  );

  // Carrega inicial
  useEffect(() => {
    if (listId) fetchGames(true);
  }, [listId]);

  const loadMore = () => {
    if (cursor == null || loading || loadingRef.current) return;
    fetchGames(false);
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
          renderItem={({ item }) => (
            <GameCard 
                game={item} 
                onPress={() => openGameDetails(item)} 
            />
          )}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "flex-start",
            marginHorizontal: 8,
            marginVertical: 4,
          }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 12 }}
          showsVerticalScrollIndicator={false}
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

      {/* --- AQUI ESTAVA O PROBLEMA ANTES --- */}
      {/* Agora passando listId e a função de callback corretamente */}
      <GameDetails 
        visible={detailsVisible}
        onClose={closeGameDetails}
        game={selectedGame}
        currentListId={listId}           // <--- IMPORTANTE: Passa o ID da lista
        onRemoveSuccess={handleGameRemoved} // <--- IMPORTANTE: Passa o callback
      />
    </View>
  );
}