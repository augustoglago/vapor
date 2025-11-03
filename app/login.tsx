import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  View,
} from "react-native";
import api, { saveToken } from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Por favor, preencha o email e a senha.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", { email, password });
      const { token } = response.data;

      await saveToken(token);

      router.replace("/(tabs)/games");
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || "Erro desconhecido. Tente novamente.";
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#334155"]}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
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
            <View className="w-full">
              <View className="items-center mb-8">
                <View className="w-16 h-16 bg-transparent rounded-2xl justify-center items-center overflow-hidden border border-blue-500/20">
                  <Image
                    source={require("../assets/images/logo-1.png")}
                    style={{ width: 48, height: 48 }}
                    resizeMode="contain"
                  />
                </View>
                <Text className="text-3xl text-slate-50 font-outfit mt-4 font-bold">
                  Vapor
                </Text>
                <Text className="text-base text-slate-400">
                  Entre na sua conta para continuar
                </Text>
              </View>

              <View className="grid gap-4">
                {/* Email */}
                <View>
                  <Text className="text-md text-slate-200 font-semibold mb-2">
                    Email
                  </Text>
                  <Input className="rounded-xl bg-slate-800/80 border border-slate-700/50">
                    <InputField
                      placeholder="seu@email.com"
                      placeholderTextColor="#94a3b8"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      className="text-slate-100 h-16"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </Input>
                </View>

                {/* Senha */}
                <View>
                  <Text className="text-md text-slate-200 font-semibold mb-2">
                    Senha
                  </Text>
                  <Input className="rounded-xl bg-slate-800/80 border border-slate-700/50">
                    <InputField
                      placeholder="••••••••"
                      placeholderTextColor="#94a3b8"
                      secureTextEntry
                      autoCapitalize="none"
                      className="text-slate-100 h-16"
                      value={password}
                      onChangeText={setPassword}
                    />
                  </Input>

                  <Pressable
                    className="mt-2 flex-row justify-end items-center"
                    onPress={() => console.log("Esqueci senha")}
                  >
                    <Text className="text-xs text-blue-400">
                      Esqueci minha senha
                    </Text>
                  </Pressable>
                </View>
              </View>

              <Button
                className="rounded-xl mt-8 bg-blue-700 shadow-xl"
                onPress={handleLogin}
                isDisabled={isLoading}
              >
                <ButtonText className="text-md font-semibold text-white">
                  {isLoading ? "Entrando..." : "Entrar"}
                </ButtonText>
              </Button>
            </View>

            <View className="flex-row mt-10 items-center">
              <Text className="text-sm text-slate-400">
                Não tem uma conta?{" "}
              </Text>
              <Pressable onPress={() => router.push("/register")}>
                <Text className="text-sm text-blue-500 font-semibold">
                  Criar conta
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
