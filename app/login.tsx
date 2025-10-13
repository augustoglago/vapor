import { Button, ButtonText } from "@/components/ui/button";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Image, Pressable, View } from "react-native";

export default function Login() {
  return (
    <LinearGradient
      colors={["#0f172a", "#1e293b", "#334155"]}
      className="flex-1"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View className="flex-1 justify-center items-center px-6">
        <View className="w-full max-w-[380px] bg-[#0b1b2f] rounded-3xl p-8 border border-slate-700/10 shadow-2xl">
          <View className="items-center mb-4">
            <View className="w-14 h-14 bg-[#112a49] rounded-2xl justify-center items-center border border-blue-500/20 overflow-hidden">
              <Image
                source={require("../assets/images/logo-1.png")}
                style={{ width: 40, height: 40 }}
                resizeMode="contain"
              />
            </View>

            <Text className="text-2xl text-slate-50 font-outfit mt-3">
              Vapor
            </Text>
            <Text className="text-sm text-slate-400">Entre na sua conta</Text>
          </View>

          <View className="space-y-4">
            {/* Email */}
            <View>
              <Text className="text-sm text-slate-200 font-semibold mb-2">
                Email
              </Text>
              <Input className="rounded-2xl bg-slate-800/50 border border-slate-500/20">
                <InputField
                  placeholder="seu@email.com"
                  placeholderTextColor="#64748B"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="text-slate-100 px-4 py-4"
                />
              </Input>
            </View>

            {/* Senha */}
            <View>
              <View className="flex-row justify-between items-center mb-2">
                <Text className="text-sm text-slate-200 font-semibold">
                  Senha
                </Text>
                <Pressable onPress={() => console.log("Esqueci senha")}>
                  <Text className="text-xs text-blue-500">
                    Esqueci minha senha
                  </Text>
                </Pressable>
              </View>
              <Input className="rounded-2xl bg-slate-800/50 border border-slate-500/20">
                <InputField
                  placeholder="••••••••"
                  placeholderTextColor="#64748B"
                  secureTextEntry
                  className="text-slate-100 px-4 py-4"
                />
              </Input>
            </View>
          </View>

          <Button
            className="rounded-2xl mt-4 bg-blue-500 py-4 shadow-lg"
            onPress={() => router.replace("/(tabs)")}
          >
            <ButtonText className="text-base font-semibold text-white">
              Entrar
            </ButtonText>
          </Button>
        </View>

        <View className="flex-row mt-6 items-center">
          <Text className="text-sm text-slate-400">Não tem uma conta? </Text>
          <Pressable onPress={() => console.log("Ir para cadastro")}>
            <Text className="text-sm text-blue-500 font-semibold">
              Criar conta
            </Text>
          </Pressable>
        </View>
      </View>
    </LinearGradient>
  );
}
