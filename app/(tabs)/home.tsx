// app/(tabs)/home.tsx

import { Image as ExpoImage } from "expo-image";
import { router } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
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
import { Game } from "@/types";

// Importação do componente de Detalhes criado acima
import GameDetails from "./gamedetails";

// --- Componentes Auxiliares ---

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

function CategoryPill({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="mr-2 px-3 py-2 rounded-full bg-slate-800/60 border border-slate-700/50"
    >
      <Text className="text-slate-300 text-xs">{name}</Text>
    </Pressable>
  );
}

function UserListCard({
  title,
  subtitle,
  count,
  onPress,
  gradientClass,
}: {
  title: string;
  subtitle: string;
  count?: number;
  onPress: () => void;
  gradientClass?: string;
}) {
  return (
    <Pressable onPress={onPress} className="w-1/2 px-2 mb-3">
      <View
        className={`h-28 rounded-xl p-3 border border-slate-700/40 bg-gradient-to-r ${
          gradientClass ?? "from-slate-800/80 to-slate-700/60"
        }`}
      >
        <View className="flex-row justify-between items-start">
          <Text
            className="text-slate-100 text-sm font-semibold"
            numberOfLines={1}
          >
            {title}
          </Text>
          {typeof count === "number" ? (
            <View className="px-2 py-0.5 rounded-full bg-slate-900/40 border border-slate-700/50">
              <Text className="text-slate-200 text-2xs">{count}</Text>
            </View>
          ) : null}
        </View>

        <Text className="text-slate-300 text-xs mt-1" numberOfLines={2}>
          {subtitle}
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

// --- Componente Principal ---

export default function HomeScreen() {
  const [featured, setFeatured] = useState<Game[]>([]);
  const [recent, setRecent] = useState<Game[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // --- Lógica do GameDetails (Modal) ---
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isDrawerVisible, setDrawerVisible] = useState(false);

  const openGameDetails = useCallback((game: Game) => {
    setSelectedGame(game);
    setDrawerVisible(true);
  }, []);

  const closeGameDetails = useCallback(() => {
    setDrawerVisible(false);
    // Pequeno delay para limpar o jogo apenas após a animação de fechar (opcional)
    setTimeout(() => setSelectedGame(null), 300);
  }, []);
  // -------------------------------------

  const fetchHomeData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const result = await getGames({ cursor: undefined, search: undefined });
      const list = result.data || [];

      setFeatured(list.slice(0, 8));
      setRecent(list.slice(8, 20));
    } catch (e) {
      console.error("Home fetch error:", e);
      setFeatured([]);
      setRecent([]);
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
      <View className="flex-1 bg-slate-900 items-center justify-center">
        <ActivityIndicator size="large" color="#e2e8f0" />
        <Text className="text-slate-400 mt-3">Carregando...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-slate-900"> 
      {/* Nota: Ajustei bg-vapor-primary para bg-slate-900 para garantir consistência se a classe customizada não existir */}
      
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

        {/* Minhas listas (visual) */}
        <SectionTitle
          title="Minhas listas"
          actionLabel="Criar"
          onPressAction={() => router.push("/lists/create")}
        />
        <View className="px-4 mb-1">
          <View className="flex-row flex-wrap -mx-2">
            {[
              {
                key: "wishlist",
                title: "Quero jogar",
                desc: "Guarde os próximos da fila",
                count: 12,
                color: "from-sky-800/70 to-sky-700/50",
              },
              {
                key: "playing",
                title: "Jogando agora",
                desc: "Continue de onde parou",
                count: 3,
                color: "from-emerald-800/70 to-emerald-700/50",
              },
              {
                key: "completed",
                title: "Zerados",
                desc: "Sua coleção finalizada",
                count: 18,
                color: "from-violet-800/70 to-violet-700/50",
              },
              {
                key: "favorites",
                title: "Favoritos",
                desc: "Os indispensáveis",
                count: 7,
                color: "from-amber-800/70 to-amber-700/50",
              },
            ].map((l) => (
              <UserListCard
                key={l.key}
                title={l.title}
                subtitle={l.desc}
                count={l.count}
                gradientClass={l.color}
                onPress={() => router.push(`/lists/${l.key}`)}
              />
            ))}
          </View>
        </View>

        {/* Destaques - Agora abre o Modal */}
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
            <GameThumb 
                game={item} 
                onPress={() => openGameDetails(item)} 
            />
          )}
          ListEmptyComponent={
            <Text className="text-slate-400 px-4">
              Nenhum destaque disponível.
            </Text>
          }
          scrollEnabled
        />

        {/* Recentes - Agora abre o Modal */}
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
            <GameThumb 
                game={item} 
                onPress={() => openGameDetails(item)} 
            />
          )}
          ListEmptyComponent={
            <Text className="text-slate-400 px-4">
              Nenhum jogo recente disponível.
            </Text>
          }
          scrollEnabled
        />
      </ScrollView>

      {/* Componente Modal Renderizado aqui */}
      <GameDetails
        visible={isDrawerVisible}
        onClose={closeGameDetails}
        game={selectedGame}
      />
    </View>
  );
}