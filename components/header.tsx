// components/header.tsx
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { Image, Modal, Platform, Pressable, Text, TouchableOpacity, View } from "react-native";

export const Header = () => {
  const router = useRouter();
  const [showProfileOptions, setShowProfileOptions] = useState(false);

  return (
    <>
      <View className="flex-row bg-vapor-primary px-4 py-3 items-center justify-between border-b border-slate-700/20">
        {/* Avatar */}
        <Pressable
          className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600/30"
          onPress={() => setShowProfileOptions(true)}
        >
          <Image
            source={{ uri: "https://github.com/octocat.png" }}
            className="w-full h-full"
            resizeMode="cover"
          />
        </Pressable>

        {/* Botão chip (não parece campo de search) */}
        <Pressable
          onPress={() => router.push("/gamelist")}
          className="mx-3 px-4 py-2 rounded-full bg-slate-700/40 border border-slate-600/40"
          accessibilityRole="button"
          accessibilityLabel="Ir para lista de jogos e pesquisar"
        >
          <View className="flex-row items-center">
            <IconSymbol name="magnifyingglass" size={16} color="#cbd5e1" />
            <Text className="ml-2 text-slate-200 font-medium">Buscar jogos</Text>
          </View>
        </Pressable>

        {/* Menu hambúrguer */}
        <Pressable className="p-2">
          <IconSymbol name="line.horizontal.3" size={24} color="#e2e8f0" />
        </Pressable>
      </View>

      {/* Modal de opções do perfil */}
      <Modal
        visible={showProfileOptions}
        transparent
        animationType={Platform.OS === "web" ? undefined : "fade"}
        onRequestClose={() => setShowProfileOptions(false)}
      >
        <TouchableOpacity
          className="flex-1 bg-black/50 justify-center items-center"
          activeOpacity={1}
          onPress={() => setShowProfileOptions(false)}
        >
          <View className="bg-slate-800 rounded-xl p-4 mx-6 w-64 border border-slate-700/30">
            <Text className="text-slate-100 text-lg font-semibold mb-4 text-center">Opções do Perfil</Text>

            <Pressable className="flex-row items-center p-3 rounded-lg bg-slate-700/30 mb-2" onPress={() => setShowProfileOptions(false)}>
              <IconSymbol name="person.circle" size={20} color="#e2e8f0" />
              <Text className="text-slate-100 ml-3 font-medium">Ver perfil</Text>
            </Pressable>

            <Pressable className="flex-row items-center p-3 rounded-lg bg-slate-700/30" onPress={() => setShowProfileOptions(false)}>
              <IconSymbol name="pencil" size={20} color="#e2e8f0" />
              <Text className="text-slate-100 ml-3 font-medium">Editar perfil</Text>
            </Pressable>

            <Pressable className="mt-4 p-3 rounded-lg bg-slate-600/50" onPress={() => setShowProfileOptions(false)}>
              <Text className="text-slate-300 text-center font-medium">Cancelar</Text>
            </Pressable>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};
