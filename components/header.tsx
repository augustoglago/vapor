// components/header.tsx
import {
    Toast,
    ToastDescription,
    ToastTitle,
    useToast,
} from "@/components/ui/toast";
import { deleteToken } from "@/services/api";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Image,
    Modal,
    Platform,
    Pressable,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
// ⬇️ lucide icons
import { LogOut, Menu, Pencil, Search, UserCircle2 } from "lucide-react-native";

export const Header = () => {
  const router = useRouter();
  const toast = useToast();

  const [showProfileOptions, setShowProfileOptions] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const closeModal = () => setShowProfileOptions(false);

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

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await deleteToken();
      closeModal();
      showToast("Até logo!", "Você saiu da sua conta.", "success");
      router.replace("/login");
    } catch (e) {
      showToast("Erro ao sair", "Tente novamente em instantes.", "error");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      <View className="flex-row bg-vapor-primary px-4 py-3 items-center justify-between border-b border-slate-700/20">
        {/* Avatar */}
        <Pressable
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600/30"
          onPress={() => setShowProfileOptions(true)}
          accessibilityRole="button"
          accessibilityLabel="Abrir opções do perfil"
        >
          <Image
            source={{ uri: "https://github.com/octocat.png" }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </Pressable>

        {/* Chip -> vai para lista/pesquisa */}
        <Pressable
          onPress={() => router.push("/gamelist")}
          className="mx-3 px-4 py-2 rounded-full bg-slate-700/40 border border-slate-600/40"
          accessibilityRole="button"
          accessibilityLabel="Ir para lista de jogos e pesquisar"
        >
          <View className="flex-row items-center">
            <Search size={16} color="#cbd5e1" />
            <Text className="ml-2 text-slate-200 font-medium">
              Buscar jogos
            </Text>
          </View>
        </Pressable>

        {/* Menu hambúrguer (placeholder) */}
        <Pressable
          className="p-2"
          accessibilityRole="button"
          accessibilityLabel="Abrir menu"
        >
          <Menu size={24} color="#e2e8f0" />
        </Pressable>
      </View>

      {/* Modal de opções do perfil */}
      <Modal
        visible={showProfileOptions}
        transparent
        animationType={Platform.OS === "web" ? undefined : "fade"}
        onRequestClose={closeModal}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={closeModal}
        >
          <View className="bg-vapor-primary rounded-xl p-4 mx-6 w-64 border border-slate-700/30">
            <Text className="text-slate-100 text-lg font-semibold mb-4 text-center">
              Opções do Perfil
            </Text>

            {/* Ver perfil */}
            <Pressable
              className="flex-row items-center p-3 rounded-lg bg-slate-700/30 mb-2"
              onPress={closeModal}
            >
              <UserCircle2 size={20} color="#e2e8f0" />
              <Text className="text-slate-100 ml-3 font-medium">
                Ver perfil
              </Text>
            </Pressable>

            {/* Editar perfil */}
            <Pressable
              className="flex-row items-center p-3 rounded-lg bg-slate-700/30 mb-2"
              onPress={closeModal}
            >
              <Pencil size={20} color="#e2e8f0" />
              <Text className="text-slate-100 ml-3 font-medium">
                Editar perfil
              </Text>
            </Pressable>

            {/* Sair (logout) */}
            <Pressable
              className={`flex-row items-center p-3 rounded-lg ${
                isLoggingOut ? "bg-red-700/40" : "bg-red-600/30"
              } border border-red-500/30`}
              onPress={handleLogout}
              disabled={isLoggingOut}
            >
              <LogOut size={20} color="#fecaca" />
              <Text className="text-red-200 ml-3 font-semibold">
                {isLoggingOut ? "Saindo..." : "Sair"}
              </Text>
              {isLoggingOut ? (
                <ActivityIndicator
                  className="ml-auto"
                  size="small"
                  color="#fecaca"
                />
              ) : null}
            </Pressable>

            {/* Cancelar */}
            <Pressable
              className="mt-4 p-3 rounded-lg bg-slate-600/50"
              onPress={closeModal}
            >
              <Text className="text-slate-300 text-center font-medium">
                Cancelar
              </Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
