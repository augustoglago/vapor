import { Button, ButtonText } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { deleteToken } from '@/services/api';
import { LinearGradient } from "expo-linear-gradient";
import { router } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

const handleLogout = async () => {
    try {
        await deleteToken();

        console.log('Logout realizado. Token removido.');

        router.replace('/login');
    } catch (e) {
        console.error("Erro ao fazer logout:", e);
        alert("Erro ao tentar sair. Tente novamente.");
    }
};

export default function GamesScreen() {
    return (
        <LinearGradient
            colors={["#0f172a", "#1e293b", "#334155"]}
            className="flex-1"
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
        >
            <View className="flex-1 justify-center items-center bg-transparent px-6">
                <Text className="text-3xl font-bold text-green-400 mb-4">
                    Bem-Sucedido!
                </Text>
                <Text className="text-base text-slate-300 mb-8 text-center">
                    Acessou uma rota protegida o JWT está funcionando!
                </Text>

                <Button
                    className="rounded-2xl mt-4 bg-red-600 shadow-lg w-full max-w-[300px]"
                    onPress={handleLogout}
                >
                    <ButtonText className="text-base font-semibold text-white">
                        Fazer Logout
                    </ButtonText>
                </Button>
            </View>
        </LinearGradient>
    );
}