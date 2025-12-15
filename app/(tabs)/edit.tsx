import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { getAvatars } from "@/services/avatars";
import { getMe, updateUser } from "@/services/users";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

type Avatar = { id: number; link: string };

export default function EditProfileScreen() {
  const toast = useToast();

  const [user, setUser] = useState<any>(null);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarId, setAvatarId] = useState<number | null>(null);

  const [loadingPage, setLoadingPage] = useState(true);
  const [saving, setSaving] = useState(false);

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoadingPage(true);
        const [me, avs] = await Promise.all([getMe(), getAvatars()]);

        if (!mounted) return;

        setUser(me);
        setEmail(me?.email ?? "");
        setAvatars(avs ?? []);

        // Se seu backend devolver avatar_id no /me, use isso:
        if (typeof me?.avatar_id === "number") {
          setAvatarId(me.avatar_id);
        } else {
          // Caso você só tenha a URL (me.avatar), tenta descobrir o id pelo link:
          const found = (avs ?? []).find((a: any) => a.link === me?.avatar);
          if (found) setAvatarId(found.id);
        }
      } catch (e) {
        if (!mounted) return;
        setUser(null);
        setAvatars([]);
        showToast("Erro", "Não foi possível carregar seu perfil.", "error");
      } finally {
        if (!mounted) return;
        setLoadingPage(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const isValidEmail = useMemo(() => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  }, [email]);

  const handleSave = async () => {
    if (saving) return;

    // ATENÇÃO: seu /me pode não ter id
    const userId = user?.id;
    if (!userId) {
      showToast(
        "Erro",
        "Seu perfil não trouxe o ID do usuário. Ajuste o /me para retornar id (ou crie PUT /users/me).",
        "error"
      );
      return;
    }

    if (!email.trim() || !isValidEmail) {
      showToast("Verifique o email", "Informe um email válido.", "error");
      return;
    }

    if (password && password.length < 6) {
      showToast(
        "Senha fraca",
        "A senha precisa ter no mínimo 6 caracteres.",
        "error"
      );
      return;
    }

    try {
      setSaving(true);

      await updateUser(userId, {
        email: email.trim(),
        password: password ? password : undefined,
        avatar_id: avatarId ?? undefined,
      });

      showToast(
        "Atualizado",
        "Seu perfil foi atualizado com sucesso.",
        "success"
      );

      router.replace("/(tabs)/home");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ||
        e?.response?.data?.error ||
        "Não foi possível atualizar seu perfil.";
      showToast("Erro", msg, "error");
    } finally {
      setSaving(false);
    }
  };

  if (loadingPage) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900">
        <ActivityIndicator color="#e2e8f0" />
        <Text className="text-slate-400 mt-3">Carregando…</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View className="flex-1 items-center justify-center bg-slate-900 px-6">
        <Text className="text-slate-300 text-center">
          Não foi possível carregar seu perfil.
        </Text>
        <Pressable
          onPress={() => router.back()}
          className="mt-4 bg-slate-700/40 rounded-xl px-4 py-3"
        >
          <Text className="text-slate-100 font-semibold">Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-slate-900 px-6 pt-8"
      contentContainerStyle={{ paddingBottom: 28 }}
      keyboardShouldPersistTaps="handled"
    >
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
        autoCapitalize="none"
        keyboardType="email-address"
        className="bg-slate-800 text-slate-100 rounded-xl px-4 py-3 mb-4"
        placeholder="seu@email.com"
        placeholderTextColor="#64748b"
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
        disabled={saving}
        className={`rounded-xl py-3 ${saving ? "bg-blue-900" : "bg-blue-600"}`}
      >
        <Text className="text-white text-center font-semibold">
          {saving ? "Salvando..." : "Salvar alterações"}
        </Text>
      </Pressable>

      {/* Cancelar */}
      <Pressable
        onPress={() => router.back()}
        disabled={saving}
        className="mt-3 rounded-xl py-3 bg-slate-700/40"
      >
        <Text className="text-slate-100 text-center font-semibold">
          Cancelar
        </Text>
      </Pressable>
    </ScrollView>
  );
}
