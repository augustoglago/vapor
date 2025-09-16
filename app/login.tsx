// app/login.tsx
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import React from "react";
import { Pressable, View } from "react-native";

/* imports individuais (pacotes @gluestack-ui/*) */
import { Box } from "@/components/ui/box";
import { Button, ButtonText } from "@/components/ui/button";
import { HStack } from "@/components/ui/hstack";
import { Input, InputField } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { VStack } from "@/components/ui/vstack";

export default function Login() {
  return (
    <LinearGradient
      colors={['#0f172a', '#1e293b', '#334155']}
      style={{ flex: 1 }}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 24,
        }}
      >
        {/* Card Container */}
        <Box
          style={{
            width: "100%",
            maxWidth: 380,
            backgroundColor: "rgba(15, 23, 42, 0.8)",
            borderRadius: 24,
            padding: 32,
            borderWidth: 1,
            borderColor: "rgba(148, 163, 184, 0.1)",
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 20 },
            shadowOpacity: 0.25,
            shadowRadius: 25,
            elevation: 20,
          }}
        >
          <VStack space="xl">
            {/* Header Section */}
            <VStack space="md" style={{ alignItems: "center", marginBottom: 8 }}>
              {/* Logo/Icon Placeholder */}
              <Box
                style={{
                  width: 60,
                  height: 60,
                  backgroundColor: "rgba(59, 130, 246, 0.1)",
                  borderRadius: 20,
                  justifyContent: "center",
                  alignItems: "center",
                  borderWidth: 1,
                  borderColor: "rgba(59, 130, 246, 0.2)",
                }}
              >
                <Text size="2xl" style={{ color: "#3B82F6" }}>
                  V
                </Text>
              </Box>
              
              {/* Título */}
              <VStack space="xs" style={{ alignItems: "center" }}>
                <Text size="3xl" bold style={{ color: "#F8FAFC" }}>
                  Vapor
                </Text>
                <Text size="sm" style={{ color: "#94A3B8" }}>
                  Entre na sua conta
                </Text>
              </VStack>
            </VStack>

            {/* Form Fields */}
            <VStack space="lg">
              {/* Email */}
              <Box>
                <Text size="sm" bold style={{ color: "#E2E8F0", marginBottom: 8 }}>
                  Email
                </Text>
                <Input
                  variant="outline"
                  size="md"
                  style={{
                    borderRadius: 16,
                    backgroundColor: "rgba(30, 41, 59, 0.5)",
                    borderColor: "rgba(148, 163, 184, 0.2)",
                    borderWidth: 1,
                  }}
                >
                  <InputField
                    placeholder="seu@email.com"
                    placeholderTextColor="#64748B"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={{ color: "#F8FAFC", paddingHorizontal: 16, paddingVertical: 16 }}
                  />
                </Input>
              </Box>

              {/* Senha */}
              <Box>
                <HStack style={{ justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <Text size="sm" bold style={{ color: "#E2E8F0" }}>
                    Senha
                  </Text>
                  <Pressable onPress={() => console.log("Esqueci senha")}>
                    <Text size="xs" style={{ color: "#3B82F6" }}>
                      Esqueci minha senha
                    </Text>
                  </Pressable>
                </HStack>
                <Input
                  variant="outline"
                  size="md"
                  style={{
                    borderRadius: 16,
                    backgroundColor: "rgba(30, 41, 59, 0.5)",
                    borderColor: "rgba(148, 163, 184, 0.2)",
                    borderWidth: 1,
                  }}
                >
                  <InputField
                    placeholder="••••••••"
                    placeholderTextColor="#64748B"
                    secureTextEntry
                    style={{ color: "#F8FAFC", paddingHorizontal: 16, paddingVertical: 16 }}
                  />
                </Input>
              </Box>
            </VStack>

            {/* Login Button */}
            <Button
              size="md"
              action="primary"
              style={{
                borderRadius: 16,
                marginTop: 8,
                backgroundColor: "#3B82F6",
                paddingVertical: 16,
                shadowColor: "#3B82F6",
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}
              onPress={() => router.replace("/(tabs)")}
            >
              <ButtonText style={{ fontSize: 16, fontWeight: "600" }}>
                Entrar
              </ButtonText>
            </Button>

            {/* Divider */}
            <HStack style={{ alignItems: "center", marginVertical: 8 }}>
              <Box style={{ flex: 1, height: 1, backgroundColor: "rgba(148, 163, 184, 0.2)" }} />
              <Text size="xs" style={{ color: "#64748B", paddingHorizontal: 16 }}>
                ou
              </Text>
              <Box style={{ flex: 1, height: 1, backgroundColor: "rgba(148, 163, 184, 0.2)" }} />
            </HStack>

            {/* Social Login Buttons */}
            <VStack space="sm">
              <Button
                variant="outline"
                size="md"
                style={{
                  borderRadius: 16,
                  borderColor: "rgba(148, 163, 184, 0.2)",
                  backgroundColor: "rgba(30, 41, 59, 0.3)",
                  paddingVertical: 16,
                }}
                onPress={() => console.log("Login com Google")}
              >
                <ButtonText style={{ color: "#E2E8F0", fontSize: 14 }}>
                  Continuar com Google
                </ButtonText>
              </Button>

              <Button
                variant="outline"
                size="md"
                style={{
                  borderRadius: 16,
                  borderColor: "rgba(148, 163, 184, 0.2)",
                  backgroundColor: "rgba(30, 41, 59, 0.3)",
                  paddingVertical: 16,
                }}
                onPress={() => console.log("Login com Apple")}
              >
                <ButtonText style={{ color: "#E2E8F0", fontSize: 14 }}>
                  Continuar com Apple
                </ButtonText>
              </Button>
            </VStack>
          </VStack>
        </Box>

        {/* Footer */}
        <HStack style={{ marginTop: 24, alignItems: "center" }}>
          <Text size="sm" style={{ color: "#64748B" }}>
            Não tem uma conta?{" "}
          </Text>
          <Pressable onPress={() => console.log("Ir para cadastro")}>
            <Text size="sm" style={{ color: "#3B82F6", fontWeight: "600" }}>
              Criar conta
            </Text>
          </Pressable>
        </HStack>
      </View>
    </LinearGradient>
  );
}