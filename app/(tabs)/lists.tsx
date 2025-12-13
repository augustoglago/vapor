// app/(tabs)/lists.tsx
import {
    Toast,
    ToastDescription,
    ToastTitle,
    useToast,
} from "@/components/ui/toast";
import { getLists, ListItem } from "@/services/lists";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    RefreshControl,
    Text,
    View,
} from "react-native";

/** ---------- helpers de cor ---------- */
function hexToRgb(hex?: string) {
  if (!hex) return { r: 71, g: 85, b: 105 }; // slate-600 fallback
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
  // luminância relativa (WCAG)
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? "#0f172a" /* slate-900 */ : "#F8FAFC" /* slate-50 */;
}

function mixWithSlate(hex?: string, factor = 0.35) {
  // mistura a cor escolhida com um tom escuro pra dar profundidade no card
  const { r, g, b } = hexToRgb(hex);
  const slate = { r: 15, g: 23, b: 42 }; // slate-900
  const m = (a: number, b: number) => Math.round(a * (1 - factor) + b * factor);
  return `rgb(${m(r, slate.r)}, ${m(g, slate.g)}, ${m(b, slate.b)})`;
}
/** ------------------------------------ */

function ListCard({ item }: { item: ListItem }) {
  const bg = useMemo(
    () => mixWithSlate(item.color ?? "#475569", 0.28),
    [item.color]
  );
  const text = useMemo(
    () => getReadableTextColor(item.color ?? "#475569"),
    [item.color]
  );
  const border = "rgba(0,0,0,0.25)";

  return (
    <Pressable
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
      className="w-1/2 px-2 mb-3"
    >
      <View
        className="h-28 rounded-2xl p-3 overflow-hidden"
        style={{
          backgroundColor: bg,
          borderColor: border,
          borderWidth: 1,
        }}
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

export default function ListsScreen() {
  const toast = useToast();
  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const showError = (msg = "Não foi possível carregar suas listas.") =>
    toast.show({
      placement: "top",
      duration: 3000,
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action="error" variant="solid">
          <ToastTitle>Erro</ToastTitle>
          <ToastDescription>{msg}</ToastDescription>
        </Toast>
      ),
    });

  const fetchLists = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      const res = await getLists();
      setLists(res.data ?? []);
    } catch (e: any) {
      showError(e?.response?.data?.message);
      setLists([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

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
      <View className="px-4 pt-4 pb-2">
        <Text className="text-slate-100 text-xl font-semibold">
          Suas listas
        </Text>
        <Text className="text-slate-400 text-xs mt-1">
          Gerencie as listas criadas pelo botão “Criar” no rodapé.
        </Text>
      </View>

      <FlatList
        data={lists}
        keyExtractor={(i) => String(i.id)}
        numColumns={2}
        columnWrapperStyle={{ paddingHorizontal: 8 }}
        contentContainerStyle={{ paddingTop: 4, paddingBottom: 12 }}
        renderItem={({ item }) => <ListCard item={item} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => fetchLists(true)}
            tintColor="#e2e8f0"
          />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center px-6 py-12">
            <Text className="text-slate-400 text-center">
              Você ainda não criou nenhuma lista.
            </Text>
          </View>
        }
      />
    </View>
  );
}
