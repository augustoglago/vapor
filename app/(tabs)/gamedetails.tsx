// app/(tabs)/gamedetails.tsx

import { AddToListModal } from '@/components/add-to-list-modal';
import { getGameAchievements } from '@/services/games';
import { Achievement, Game } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View
} from 'react-native';

interface GameDetailsProps {
  visible: boolean;
  onClose: () => void;
  game: Game | null;
}

export default function GameDetails({ visible, onClose, game }: GameDetailsProps) {
  // --- Estados de Dados ---
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);

  // --- Estados de UI ---
  const [isListModalVisible, setListModalVisible] = useState(false);
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false); // Novo estado para o aviso

  useEffect(() => {
    if (game && visible) {
      fetchAchievements();
    } else {
      // Resetar estados ao fechar
      setAchievements([]);
      setCompletedIds([]);
      setListModalVisible(false);
      setIsAchievementsExpanded(false);
      setShowSuccessMsg(false);
    }
  }, [game, visible]);

  const fetchAchievements = async () => {
    if (!game) return;
    setLoading(true);
    try {
      const data = await getGameAchievements(game.id);
      setAchievements(data.achievementsList);
      setCompletedIds(data.completedAchievementsIds);
    } catch (error) {
      console.log("Não foi possível carregar conquistas ou o jogo não possui.");
    } finally {
      setLoading(false);
    }
  };

  // Função para exibir o sucesso temporariamente
  const handleListSuccess = () => {
    setListModalVisible(false);
    setShowSuccessMsg(true);
    // Esconde a mensagem automaticamente após 3 segundos
    setTimeout(() => {
        setShowSuccessMsg(false);
    }, 3000);
  };

  if (!game) return null;

  const totalAchievements = achievements.length;
  const unlockedCount = completedIds.length;
  const progressPercentage = totalAchievements > 0 
    ? Math.round((unlockedCount / totalAchievements) * 100) 
    : 0;

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-slate-900">
        
        {/* --- AVISO DE SUCESSO (TOAST PERSONALIZADO) --- */}
        {/* Renderizado no topo, z-index alto para ficar acima de tudo dentro deste modal */}
        {showSuccessMsg && (
            <View className="absolute top-16 left-4 right-4 bg-emerald-600 p-4 rounded-xl shadow-lg z-50 flex-row items-center gap-3 border border-emerald-400/30">
                <View className="bg-white/20 p-1 rounded-full">
                    <Ionicons name="checkmark" size={20} color="white" />
                </View>
                <View className="flex-1">
                    <Text className="text-white font-bold text-base">Sucesso!</Text>
                    <Text className="text-emerald-50 text-xs">
                        "{game.name}" foi adicionado à sua lista.
                    </Text>
                </View>
                <Pressable onPress={() => setShowSuccessMsg(false)}>
                    <Ionicons name="close" size={20} color="white" style={{ opacity: 0.8 }} />
                </Pressable>
            </View>
        )}

        {/* Botão Fechar Principal */}
        <Pressable 
          onPress={onClose}
          className="absolute top-12 right-4 z-40 bg-black/50 p-2 rounded-full"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>

        <ScrollView className="flex-1" bounces={false} showsVerticalScrollIndicator={false}>
          {/* Header Imagem */}
          <View className="relative h-72 w-full">
            <ExpoImage
              source={{ uri: game.capsuleImageUrl }}
              contentFit="cover"
              className="w-full h-full"
            />
            <View className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent" />
          </View>

          <View className="px-5 -mt-8 pb-10">
            {/* Título */}
            <Text className="text-white text-3xl font-bold mb-1 shadow-black shadow-lg">
              {game.name}
            </Text>
            <Text className="text-slate-500 text-xs mb-4">ID: {game.appId}</Text>
            
            {/* Ações Rápidas */}
            <View className="flex-row gap-3 mb-8">
               <Pressable 
                  onPress={() => setListModalVisible(true)}
                  className="flex-1 bg-blue-600 py-3 rounded-lg flex-row items-center justify-center gap-2 active:bg-blue-700"
               >
                  <Ionicons name="add-circle-outline" size={20} color="white" />
                  <Text className="text-white font-semibold text-base">Adicionar à Lista</Text>
               </Pressable>

               <Pressable className="bg-slate-700 w-12 items-center justify-center rounded-lg active:bg-slate-600">
                  <Ionicons name="share-social-outline" size={24} color="white" />
               </Pressable>
            </View>

            {/* Seção de Conquistas (Dropdown) */}
            <View className="mb-6">
              <Pressable 
                onPress={() => setIsAchievementsExpanded(!isAchievementsExpanded)}
                className="flex-row justify-between items-center bg-slate-800/40 p-3 rounded-lg active:bg-slate-800/60"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-slate-100 text-lg font-semibold">Conquistas</Text>
                  <Ionicons 
                    name={isAchievementsExpanded ? "chevron-up" : "chevron-down"} 
                    size={20} 
                    color="#94a3b8" 
                  />
                </View>
                {totalAchievements > 0 && (
                  <Text className="text-emerald-400 text-sm font-bold">
                    {unlockedCount}/{totalAchievements} ({progressPercentage}%)
                  </Text>
                )}
              </Pressable>

              {isAchievementsExpanded && (
                <View className="mt-4">
                  {loading ? (
                    <ActivityIndicator size="small" color="#94a3b8" />
                  ) : achievements.length > 0 ? (
                    <View className="bg-slate-800/50 rounded-xl p-4 gap-4">
                      {achievements.map((ach) => {
                        const isUnlocked = completedIds.includes(ach.id);
                        return (
                          <View key={ach.id} className="flex-row items-center gap-3">
                            <ExpoImage 
                              source={{ uri: ach.image }} 
                              className={`w-12 h-12 rounded-md ${isUnlocked ? '' : 'opacity-30 grayscale'}`} 
                            />
                            <View className="flex-1">
                              <Text className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>
                                {ach.name}
                              </Text>
                              <Text className="text-slate-400 text-xs" numberOfLines={2}>
                                {ach.description}
                              </Text>
                            </View>
                            {isUnlocked && (
                               <Ionicons name="checkmark-circle" size={20} color="#34d399" />
                            )}
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text className="text-slate-500 italic px-2">Este jogo não possui conquistas registradas na API.</Text>
                  )}
                </View>
              )}
            </View>

            {/* Info Técnica */}
            <View className="bg-slate-800/30 rounded-xl p-4 mb-6">
               <Text className="text-slate-400 text-xs mb-2 uppercase font-bold tracking-wider">Info Técnica</Text>
               {game.createdAt && <RowInfo icon="calendar" text={`Criado em: ${new Date(game.createdAt).toLocaleDateString()}`} />}
               {game.updatedAt && <RowInfo icon="sync" text={`Atualizado em: ${new Date(game.updatedAt).toLocaleDateString()}`} />}
            </View>
          </View>
        </ScrollView>

        {/* Modal de Adicionar à Lista */}
        <AddToListModal
          visible={isListModalVisible}
          game={game}
          onClose={() => setListModalVisible(false)}
          onDone={handleListSuccess} // Chama a função que exibe o aviso customizado
        />

      </View>
    </Modal>
  );
}

function RowInfo({ icon, text }: { icon: any, text: string }) {
  return (
    <View className="flex-row items-center mb-2 last:mb-0">
      <Ionicons name={icon} size={16} color="#64748b" />
      <Text className="text-slate-400 ml-3 text-xs">{text}</Text>
    </View>
  );
}