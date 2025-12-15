import { CreateListModal } from "@/components/create-list-modal";
import { Button, ButtonText } from "@/components/ui/button";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { addGamesToList, getLists, ListItem } from "@/services/lists";
import { Game } from "@/types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";

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

function mixWithSlate(hex?: string, factor = 0.25) {
  const { r, g, b } = hexToRgb(hex);
  const slate = { r: 15, g: 23, b: 42 };
  const m = (a: number, b: number) => Math.round(a * (1 - factor) + b * factor);
  return `rgb(${m(r, slate.r)}, ${m(g, slate.g)}, ${m(b, slate.b)})`;
}

/* ================= props ================= */

interface Props {
  visible: boolean;
  game: Game | null;
  onClose: () => void;
  onDone?: () => void;
}

/* ================= component ================= */

export const AddToListModal: React.FC<Props> = ({
  visible,
  game,
  onClose,
  onDone,
}) => {
  const toast = useToast();

  const [lists, setLists] = useState<ListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [showCreateList, setShowCreateList] = useState(false);

  /* ================= toast ================= */

  const showToast = (
    title: string,
    description: string,
    action: "success" | "error"
  ) => {
    toast.show({
      placement: "top",
      duration: 3000,
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action={action} variant="solid">
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </Toast>
      ),
    });
  };

  /* ================= carregar listas ================= */

  const loadLists = async () => {
    try {
      setLoading(true);
      const res = await getLists();
      setLists(res.data ?? []);
    } catch {
      setLists([]);
      showToast("Erro", "Não foi possível carregar suas listas.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!visible) return;
    setSelected(null);
    loadLists();
  }, [visible]);

  /* ================= adicionar ================= */

  const handleConfirm = async () => {
    if (!game || selected == null) {
      showToast(
        "Selecione uma lista",
        "Escolha uma lista para adicionar o jogo.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);
      await addGamesToList(Number(selected), {
        gameIds: [Number(game.id)],
      });
      showToast(
        "Adicionado",
        `"${game.name}" foi adicionado à lista.`,
        "success"
      );
      onClose();
      onDone?.();
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Falha ao adicionar o jogo.";
      showToast("Erro", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  /* ================= render ================= */

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType={Platform.OS === "web" ? undefined : "fade"}
        onRequestClose={onClose}
      >
        <Pressable
          className="flex-1 bg-black/50 justify-center items-center px-5"
          onPress={onClose}
        >
          <View
            className="w-full max-w-md rounded-2xl bg-vapor-primary border border-slate-700/30"
            style={{ maxHeight: 440 }}
            onStartShouldSetResponder={() => true}
          >
            {/* Header */}
            <View className="p-4 pb-2">
              <Text className="text-slate-100 text-lg font-semibold">
                Adicionar à lista
              </Text>
              <Text className="text-slate-400 text-xs mt-1" numberOfLines={2}>
                {game ? game.name : "Selecione um jogo"}
              </Text>
            </View>

            {/* Conteúdo */}
            <View className="px-2 pb-2">
              {loading ? (
                <View className="py-10 items-center">
                  <ActivityIndicator color="#e2e8f0" />
                  <Text className="text-slate-400 mt-2">
                    Carregando listas…
                  </Text>
                </View>
              ) : lists.length === 0 ? (
                <View className="py-10 items-center">
                  <Text className="text-slate-300 mb-4 text-center">
                    Você ainda não criou nenhuma lista.
                  </Text>

                  <Button
                    className="rounded-xl bg-blue-700"
                    onPress={() => setShowCreateList(true)}
                  >
                    <ButtonText className="text-white">
                      Criar nova lista
                    </ButtonText>
                  </Button>
                </View>
              ) : (
                <FlatList
                  data={lists}
                  keyExtractor={(i) => String(i.id)}
                  contentContainerStyle={{
                    paddingHorizontal: 8,
                    paddingBottom: 8,
                  }}
                  renderItem={({ item }) => {
                    const bg = mixWithSlate(item.color ?? "#475569", 0.22);
                    const text = getReadableTextColor(item.color ?? "#475569");
                    const selectedStyle =
                      selected === item.id
                        ? {
                            opacity: 1,
                            borderColor: "rgba(255,255,255,0.35)",
                          }
                        : {
                            opacity: 0.95,
                            borderColor: "rgba(0,0,0,0.25)",
                          };

                    return (
                      <Pressable
                        onPress={() => setSelected(item.id as number)}
                        className="p-3 my-1 rounded-xl border"
                        style={[{ backgroundColor: bg }, selectedStyle]}
                      >
                        <View className="flex-row items-center">
                          <Text
                            style={{ color: text }}
                            className="text-2xl mr-2"
                          >
                            {item.icon || "🎮"}
                          </Text>
                          <Text style={{ color: text }} className="font-medium">
                            {item.name}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  }}
                />
              )}
            </View>

            {/* Footer */}
            {lists.length > 0 && (
              <View className="flex-row justify-end gap-2 p-4 pt-2 border-t border-slate-700/30">
                <Button
                  variant="outline"
                  className="rounded-xl border-slate-600/50 bg-slate-700/30"
                  onPress={onClose}
                  isDisabled={saving}
                >
                  <ButtonText className="text-slate-200">Cancelar</ButtonText>
                </Button>
                <Button
                  className="rounded-xl bg-blue-700"
                  onPress={handleConfirm}
                  isDisabled={saving}
                >
                  <ButtonText className="text-white">
                    {saving ? "Adicionando…" : "Adicionar"}
                  </ButtonText>
                </Button>
              </View>
            )}
          </View>
        </Pressable>
      </Modal>

      {/* Modal de criar lista */}
      <CreateListModal
        visible={showCreateList}
        onClose={() => setShowCreateList(false)}
        onCreated={() => {
          setShowCreateList(false);
          loadLists();
        }}
      />
    </>
  );
};
