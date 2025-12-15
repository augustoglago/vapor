import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import {
  Toast,
  ToastDescription,
  ToastTitle,
  useToast,
} from "@/components/ui/toast";
import { Avatar, getAvatars } from "@/services/avatars";
import { registerUser } from "@/services/users";
import { Image as ExpoImage } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View
} from "react-native";

/* ================= tipos ================= */
type Errors = Partial<
  Record<
    | "nickName"
    | "firstName"
    | "lastName"
    | "email"
    | "password"
    | "birthDate"
    | "avatar",
    string
  >
>;

/* ================= helpers ================= */
function toISODateZ(value: string): string | null {
  const clean = (value || "").trim();
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(clean)) {
    const [d, m, y] = clean.split("/");
    return `${y}-${m}-${d}T00:00:00.000Z`;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return `${clean}T00:00:00.000Z`;
  }
  return null;
}

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ================= tela ================= */

export default function Register() {
  const toast = useToast();
  const [nickName, setNickName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [selectedAvatarId, setSelectedAvatarId] = useState<number | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const markTouched = (k: keyof Errors) =>
    setTouched((t) => ({ ...t, [k]: true }));

  /* ================= validação ================= */

  const errors: Errors = useMemo(() => {
    const e: Errors = {};
    if (!nickName.trim()) e.nickName = "Informe um apelido.";
    if (!firstName.trim()) e.firstName = "Informe seu nome.";
    if (!lastName.trim()) e.lastName = "Informe seu sobrenome.";
    if (!email.trim()) e.email = "Informe um e-mail.";
    else if (!emailRegex.test(email)) e.email = "E-mail inválido.";
    if (!password.trim()) e.password = "Informe uma senha.";
    else if (password.length < 6) e.password = "Mínimo de 6 caracteres.";
    if (!birthDate.trim()) e.birthDate = "Informe a data.";
    else if (!toISODateZ(birthDate))
      e.birthDate = "Use DD/MM/AAAA ou AAAA-MM-DD.";
    if (!selectedAvatarId) e.avatar = "Escolha um avatar.";
    return e;
  }, [
    nickName,
    firstName,
    lastName,
    email,
    password,
    birthDate,
    selectedAvatarId,
  ]);

  /* ================= toast ================= */
  const showToast = (
    title: string,
    description: string,
    action: "success" | "error"
  ) => {
    toast.show({
      placement: "top",
      duration: 3500,
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action={action} variant="solid">
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </Toast>
      ),
    });
  };

  /* ================= buscar avatares ================= */
  useEffect(() => {
    getAvatars()
      .then(setAvatars)
      .catch(() =>
        showToast("Erro", "Não foi possível carregar os avatares.", "error")
      );
  }, []);

  /* ================= submit ================= */
  const handleSubmit = async () => {
    setTouched({
      nickName: true,
      firstName: true,
      lastName: true,
      email: true,
      password: true,
      birthDate: true,
      avatar: true,
    });

    if (Object.keys(errors).length) {
      showToast(
        "Verifique os campos",
        "Há informações inválidas no formulário.",
        "error"
      );
      return;
    }

    const iso = toISODateZ(birthDate)!;

    try {
      setIsLoading(true);
      const res = await registerUser({
        nick_name: nickName.trim(),
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        password,
        birth_date: iso,
        avatar_id: selectedAvatarId!,
      });

      showToast(
        "Conta criada",
        res.message || "Usuário cadastrado com sucesso!",
        "success"
      );
      router.replace("/login");
    } catch (err: any) {
      const msg =
        err?.response?.data?.error ||
        err?.response?.data?.message ||
        "Não foi possível criar a conta.";
      showToast("Erro ao cadastrar", msg, "error");
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= helpers UI ================= */

  const fieldClass = (hasError: boolean) =>
    `rounded-xl bg-slate-800/80 border ${
      hasError ? "border-red-500/70" : "border-slate-700/50"
    }`;

  const errText = (t: boolean | undefined, msg?: string) =>
    t && msg ? <Text className="text-xs text-red-400 mt-1">{msg}</Text> : null;

  /* ================= render ================= */

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#334155"]}
      className="flex-1"
    >
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center px-8 py-12">
            <Text className="text-3xl text-slate-50 font-bold mb-6">
              Criar conta
            </Text>

            <View className="gap-4">
              {/* Avatar */}
              <View>
                <Text className="text-md text-slate-200 font-semibold mb-3">
                  Escolha um avatar
                </Text>

                {/* Scroll de Avatares */}
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {avatars.map((avatar) => {
                    const selected = avatar.id === selectedAvatarId;

                    return (
                      <Pressable
                        key={avatar.id}
                        onPress={() => setSelectedAvatarId(avatar.id)}
                        className={`mr-3 mb-3 rounded-full border-2 ${
                          selected ? "border-blue-500" : "border-transparent"
                        }`}
                      >
                        <ExpoImage
                          source={{ uri: avatar.link }}
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

                {errText(touched.avatar, errors.avatar)}
              </View>

              {/* Nickname */}
              <View>
                <Text className="text-md text-slate-200 font-semibold mb-2">
                  Apelido
                </Text>
                <Input
                  className={fieldClass(
                    !!(touched.nickName && errors.nickName)
                  )}
                >
                  <InputField
                    placeholder="Seu nick"
                    placeholderTextColor="#94a3b8"
                    className="text-slate-100 h-14"
                    value={nickName}
                    onChangeText={setNickName}
                    onBlur={() => markTouched("nickName")}
                  />
                </Input>
                {errText(touched.nickName, errors.nickName)}
              </View>

              {/* Nome */}
              <View>
                <Text className="text-md text-slate-200 font-semibold mb-2">
                  Nome
                </Text>
                <Input
                  className={fieldClass(
                    !!(touched.firstName && errors.firstName)
                  )}
                >
                  <InputField
                    placeholder="Seu nome"
                    placeholderTextColor="#94a3b8"
                    className="text-slate-100 h-14"
                    value={firstName}
                    onChangeText={setFirstName}
                    onBlur={() => markTouched("firstName")}
                  />
                </Input>
                {errText(touched.firstName, errors.firstName)}
              </View>

              {/* Sobrenome */}
              <View>
                <Text className="text-md text-slate-200 font-semibold mb-2">
                  Sobrenome
                </Text>
                <Input
                  className={fieldClass(
                    !!(touched.lastName && errors.lastName)
                  )}
                >
                  <InputField
                    placeholder="Seu sobrenome"
                    placeholderTextColor="#94a3b8"
                    className="text-slate-100 h-14"
                    value={lastName}
                    onChangeText={setLastName}
                    onBlur={() => markTouched("lastName")}
                  />
                </Input>
                {errText(touched.lastName, errors.lastName)}
              </View>

              {/* Email */}
              <View>
                <Text className="text-md text-slate-200 font-semibold mb-2">
                  Email
                </Text>
                <Input
                  className={fieldClass(!!(touched.email && errors.email))}
                >
                  <InputField
                    placeholder="seu@email.com"
                    placeholderTextColor="#94a3b8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="text-slate-100 h-14"
                    value={email}
                    onChangeText={setEmail}
                    onBlur={() => markTouched("email")}
                  />
                </Input>
                {errText(touched.email, errors.email)}
              </View>

              {/* Senha */}
              <View>
                <Text className="text-md text-slate-200 font-semibold mb-2">
                  Senha
                </Text>
                <Input
                  className={fieldClass(
                    !!(touched.password && errors.password)
                  )}
                >
                  <InputField
                    placeholder="••••••••"
                    placeholderTextColor="#94a3b8"
                    secureTextEntry
                    className="text-slate-100 h-14"
                    value={password}
                    onChangeText={setPassword}
                    onBlur={() => markTouched("password")}
                  />
                </Input>
                {errText(touched.password, errors.password)}
              </View>

              {/* Data de nascimento */}
              <View>
                <Text className="text-md text-slate-200 font-semibold mb-2">
                  Data de nascimento
                </Text>
                <Input
                  className={fieldClass(
                    !!(touched.birthDate && errors.birthDate)
                  )}
                >
                  <InputField
                    placeholder="DD/MM/AAAA"
                    placeholderTextColor="#94a3b8"
                    className="text-slate-100 h-14"
                    value={birthDate}
                    onChangeText={setBirthDate}
                    onBlur={() => markTouched("birthDate")}
                  />
                </Input>
                {errText(touched.birthDate, errors.birthDate)}
              </View>
            </View>

            <Button
              className="rounded-xl mt-8 bg-blue-700"
              onPress={handleSubmit}
              isDisabled={isLoading}
            >
              <ButtonText className="text-md font-semibold text-white">
                {isLoading ? "Criando conta..." : "Criar conta"}
              </ButtonText>
            </Button>

            <View className="flex-row mt-8 items-center">
              <Text className="text-sm text-slate-400">Já tem uma conta? </Text>
              <Pressable onPress={() => router.replace("/login")}>
                <Text className="text-sm text-blue-500 font-semibold">
                  Entrar
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
