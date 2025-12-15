import { getMe } from "@/services/users";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";

export default function ProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(setUser)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <ActivityIndicator color="#e2e8f0" />
      </View>
    );
  }

  if (!user) return null;

  return (
    <View className="flex-1 bg-slate-900 px-6 pt-10">
      {/* Avatar */}
      <View className="items-center mb-6">
        <Image
          source={{ uri: user.avatar }}
          style={{ width: 96, height: 96, borderRadius: 48 }}
        />
        <Text className="text-slate-100 text-xl font-semibold mt-3">
          {user.nick_name}
        </Text>
        <Text className="text-slate-400 text-sm">
          {user.first_name} {user.last_name}
        </Text>
      </View>

      {/* Infos */}
      <View className="gap-3">
        <Info label="Email" value={user.email} />
        <Info
          label="Nascimento"
          value={new Date(user.birth_date).toLocaleDateString()}
        />
      </View>

      {/* Editar */}
      <Pressable
        onPress={() => router.push("/edit")}
        className="mt-8 bg-blue-600 rounded-xl py-3"
      >
        <Text className="text-white text-center font-semibold">
          Editar perfil
        </Text>
      </Pressable>
    </View>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View>
      <Text className="text-slate-400 text-xs">{label}</Text>
      <Text className="text-slate-100 text-base">{value}</Text>
    </View>
  );
}
