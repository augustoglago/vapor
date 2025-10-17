import { IconSymbol } from "@/components/ui/icon-symbol";
import { Input, InputField } from "@/components/ui/input";
import React, { useState } from 'react';
import { Image, Modal, Platform, Pressable, Text, TouchableOpacity, View } from 'react-native';

export const Header = () => {
    const [showProfileOptions, setShowProfileOptions] = useState(false);

    const handleAvatarPress = () => {
        setShowProfileOptions(true);
    };

    const closeModal = () => {
        setShowProfileOptions(false);
    };

    return (
        <>
            <View className="flex-row bg-vapor-primary px-4 py-3 items-center justify-between border-b border-slate-700/20">
                {/* Avatar */}
                <Pressable 
                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-slate-600/30"
                    onPress={handleAvatarPress}
                >
                    <Image
                        source={{ uri: 'https://github.com/octocat.png' }}
                        className="w-full h-full"
                        resizeMode="cover"
                    />
                </Pressable>

                {/* Barra de pesquisa */}
                <View className="flex-1 mx-3 relative">
                    <Input className="rounded-xl bg-vapor-secondary border border-slate-600/20">
                        <View 
                            className="absolute left-3 z-10"
                            style={{ 
                                top: Platform.OS === 'web' ? 12 : '50%',
                                ...(Platform.OS !== 'web' && { marginTop: -9 })
                            }}
                        >
                            <IconSymbol name="magnifyingglass" size={18} color="#64748B" />
                        </View>
                        <InputField
                            placeholder="Pesquisar jogos..."
                            placeholderTextColor="#64748B"
                            className="text-slate-100 pl-10 pr-4 py-3"
                        />
                    </Input>
                </View>

                {/* Menu hambúrguer */}
                <Pressable className="p-2">
                    <IconSymbol name="line.horizontal.3" size={24} color="#e2e8f0" />
                </Pressable>
            </View>

            {/* Modal de opções do perfil */}
            <Modal
                visible={showProfileOptions}
                transparent={true}
                animationType={Platform.OS === 'web' ? undefined : 'fade'}
                onRequestClose={closeModal}
            >
                <TouchableOpacity 
                    className="flex-1 bg-black/50 justify-center items-center"
                    activeOpacity={1}
                    onPress={closeModal}
                >
                    <View className="bg-slate-800 rounded-xl p-4 mx-6 w-64 border border-slate-700/30">
                        <Text className="text-slate-100 text-lg font-semibold mb-4 text-center">
                            Opções do Perfil
                        </Text>
                        
                        {/* Ver Perfil */}
                        <Pressable 
                            className="flex-row items-center p-3 rounded-lg bg-slate-700/30 mb-2"
                            onPress={closeModal}
                        >
                            <IconSymbol name="person.circle" size={20} color="#e2e8f0" />
                            <Text className="text-slate-100 ml-3 font-medium">
                                Ver perfil
                            </Text>
                        </Pressable>

                        {/* Editar Perfil */}
                        <Pressable 
                            className="flex-row items-center p-3 rounded-lg bg-slate-700/30"
                            onPress={closeModal}
                        >
                            <IconSymbol name="pencil" size={20} color="#e2e8f0" />
                            <Text className="text-slate-100 ml-3 font-medium">
                                Editar perfil
                            </Text>
                        </Pressable>

                        {/* Botão Cancelar */}
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