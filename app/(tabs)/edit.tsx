import { getAvatars } from "@/services/avatars";
import { getMe, updateUser } from "@/services/users";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";

export default function EditProfileScreen() {
  const [user, setUser] = useState<any>(null);
  const [avatars, setAvatars] = useState<any[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarId, setAvatarId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Promise.all([getMe(), getAvatars()]).then(([me, avatars]) => {
      setUser(me);
      setEmail(me.email);
      setAvatars(avatars);
    });
  }, []);

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <ActivityIndicator />
      </View>
    );
  }

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateUser(user.id, {
        email,
        password: password || undefined,
        avatar_id: avatarId || undefined,
      });
      router.back();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-900 px-6 pt-8">
      <Text className="text-slate-100 text-xl font-semibold mb-6">
        Editar perfil
      </Text>

      {/* Avatares */}
      <Text className="text-slate-300 mb-3">Avatar</Text>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 8 }}
        className="mb-6"
      >
        {avatars.map((a) => {
          const selected = avatarId === a.id;

          return (
            <Pressable
              key={a.id}
              onPress={() => setAvatarId(a.id)}
              style={{
                marginRight: 12,
                borderWidth: 2,
                borderColor: selected ? "#3b82f6" : "transparent",
                borderRadius: 999,
                padding: 2,
              }}
            >
              <Image
                source={{ uri: a.link }}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: 32,
                  opacity: selected ? 1 : 0.85,
                }}
              />
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Email */}
      <Text className="text-slate-300 mb-1">Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        className="bg-slate-800 text-slate-100 rounded-xl px-4 py-3 mb-4"
      />

      {/* Senha */}
      <Text className="text-slate-300 mb-1">Nova senha</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholder="Deixe em branco para não alterar"
        placeholderTextColor="#64748b"
        className="bg-slate-800 text-slate-100 rounded-xl px-4 py-3 mb-8"
      />

      {/* Salvar */}
      <Pressable
        onPress={handleSave}
        disabled={loading}
        className="bg-blue-600 rounded-xl py-3"
      >
        <Text className="text-white text-center font-semibold">
          {loading ? "Salvando..." : "Salvar alterações"}
        </Text>
      </Pressable>
    </ScrollView>
  );
}
