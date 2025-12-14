// app/(tabs)/gamedetails.tsx

import { AddToListModal } from '@/components/add-to-list-modal';
import { getGameAchievements, getGameDetails } from '@/services/games';
import { removeGameFromList } from '@/services/lists';
import { Achievement, Game } from '@/types';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator, Alert, Modal, Platform, Pressable,
  ScrollView,
  Text,
  View
} from 'react-native'; // Certifique-se de importar Platform

interface GameDetailsProps {
  visible: boolean;
  onClose: () => void;
  game: Game | null;
  currentListId?: number; // ID da lista atual (se aberto via lista)
  onRemoveSuccess?: () => void; // Callback para atualizar a tela anterior
}

// Helper para limpar HTML da Steam
function removeHtmlTags(str?: string) {
  if (!str) return "";
  return str.replace(/<[^>]*>?/gm, '');
}

export default function GameFullDetails({ 
  visible, 
  onClose, 
  game, 
  currentListId, 
  onRemoveSuccess 
}: GameDetailsProps) {
  
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [completedIds, setCompletedIds] = useState<number[]>([]);
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Estado para controlar o loading do botão de remover
  const [removing, setRemoving] = useState(false);

  const [isListModalVisible, setListModalVisible] = useState(false);
  const [isAchievementsExpanded, setIsAchievementsExpanded] = useState(false);
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);

  useEffect(() => {
    if (game && visible) {
      // Log para garantir que o ID da lista chegou
      console.log(`Detalhes abertos. Jogo: ${game.name}, ListID atual: ${currentListId}`);
      fetchAllData();
    } else {
      // Resetar estados
      setAchievements([]);
      setCompletedIds([]);
      setDetails(null);
      setListModalVisible(false);
      setIsAchievementsExpanded(false);
      setShowSuccessMsg(false);
      setRemoving(false);
    }
  }, [game, visible]);

  const fetchAllData = async () => {
    if (!game) return;
    setLoading(true);
    try {
      const [achievementsData, detailsData] = await Promise.all([
        getGameAchievements(game.id),
        getGameDetails(game.appId)
      ]);
      setAchievements(achievementsData.achievementsList);
      setCompletedIds(achievementsData.completedAchievementsIds);
      setDetails(detailsData);
    } catch (error) {
       console.error("Erro ao carregar detalhes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleListSuccess = () => {
    setListModalVisible(false);
    setShowSuccessMsg(true);
    setTimeout(() => setShowSuccessMsg(false), 3000);
  };

  // --- LÓGICA DE REMOVER ---
  const handleRemoveFromList = async () => {
    if (!game || currentListId === undefined || currentListId === null) {
        console.warn("ABORTANDO: Dados incompletos.");
        return;
    }

    // Função que executa a remoção (extraída para reuso)
    const executeRemoval = async () => {
        setRemoving(true);
        try {
            await removeGameFromList(currentListId, game.id);
            onClose();
            if (onRemoveSuccess) onRemoveSuccess();
            
            // Pequeno delay para a UI não travar na transição
            setTimeout(() => {
                // Na Web usamos window.alert, no mobile Alert.alert
                if (Platform.OS === 'web') {
                    window.alert(`"${game.name}" removido com sucesso.`);
                } else {
                    Alert.alert("Removido", `"${game.name}" foi removido da lista com sucesso.`);
                }
            }, 400);
        } catch (error) {
            console.error(error);
            const msg = "Não foi possível remover o jogo.";
            Platform.OS === 'web' ? window.alert(msg) : Alert.alert("Erro", msg);
        } finally {
            setRemoving(false);
        }
    };

    // Lógica de Confirmação Diferenciada
    if (Platform.OS === 'web') {
        // Na WEB usamos o confirm nativo do browser
        const confirmed = window.confirm(`Tem certeza que deseja remover "${game.name}" desta lista?`);
        if (confirmed) {
            await executeRemoval();
        }
    } else {
        // No MOBILE (Android/iOS) usamos o Alert nativo bonito
        Alert.alert(
            "Remover jogo",
            `Tem certeza que deseja remover "${game.name}" desta lista?`,
            [
                { text: "Cancelar", style: "cancel" },
                { 
                    text: "Remover", 
                    style: "destructive", 
                    onPress: executeRemoval // Chama a função definida acima
                }
            ]
        );
    }
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
        
        {/* Aviso de Sucesso (Adição) */}
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

        <Pressable 
          onPress={onClose}
          className="absolute top-12 right-4 z-40 bg-black/50 p-2 rounded-full"
        >
          <Ionicons name="close" size={24} color="white" />
        </Pressable>

        <ScrollView className="flex-1" bounces={false} showsVerticalScrollIndicator={false}>
          <View className="relative h-72 w-full">
            <ExpoImage
              source={{ uri: game.capsuleImageUrl }}
              contentFit="cover"
              className="w-full h-full"
            />
            <View className="absolute bottom-0 w-full h-24 bg-gradient-to-t from-slate-900 to-transparent" />
          </View>

          <View className="px-5 -mt-8 pb-10">
            <Text className="text-white text-3xl font-bold mb-1 shadow-black shadow-lg">
              {game.name}
            </Text>
            
            <View className="flex-row justify-between items-start mb-4">
               <Text className="text-slate-500 text-xs">ID: {game.appId}</Text>
               {details?.price && (
                 <Text className="text-emerald-400 font-bold bg-emerald-900/30 px-2 py-0.5 rounded text-xs border border-emerald-700/50">
                    {details.price}
                 </Text>
               )}
            </View>
            
            {/* Ações Rápidas */}
            <View className="flex-row gap-3 mb-8">
               {/* IMPORTANTE: Aqui verifica se currentListId existe para decidir qual botão mostrar */}
               {currentListId ? (
                 // --- MODO REMOVER ---
                 <Pressable 
                   onPress={handleRemoveFromList}
                   disabled={removing}
                   className="flex-1 bg-red-600/90 py-3 rounded-lg flex-row items-center justify-center gap-2 active:bg-red-700 border border-red-500/50"
                 >
                   {removing ? (
                     <ActivityIndicator size="small" color="white" />
                   ) : (
                     <>
                       <Ionicons name="trash-outline" size={20} color="white" />
                       <Text className="text-white font-semibold text-base">Remover da Lista</Text>
                     </>
                   )}
                 </Pressable>
               ) : (
                 // --- MODO ADICIONAR (padrão) ---
                 <Pressable 
                   onPress={() => setListModalVisible(true)}
                   className="flex-1 bg-blue-600 py-3 rounded-lg flex-row items-center justify-center gap-2 active:bg-blue-700"
                 >
                   <Ionicons name="add-circle-outline" size={20} color="white" />
                   <Text className="text-white font-semibold text-base">Adicionar à Lista</Text>
                 </Pressable>
               )}
            </View>

            {loading && !details ? (
               <ActivityIndicator size="large" color="#e2e8f0" className="my-10" />
            ) : (
              <>
                {details && (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-6 flex-row">
                     {details.genres.map((g: string) => (
                        <View key={g} className="bg-slate-800 border border-slate-700 px-3 py-1 rounded-full mr-2">
                           <Text className="text-slate-300 text-xs">{g}</Text>
                        </View>
                     ))}
                  </ScrollView>
                )}

                <View className="mb-6">
                   <Text className="text-slate-100 text-lg font-semibold mb-2">Sobre</Text>
                   <Text className="text-slate-400 leading-6 text-sm">
                      {details ? removeHtmlTags(details.about_the_game) : "Carregando detalhes..."}
                   </Text>
                </View>

                <View className="bg-slate-800/30 rounded-xl p-4 mb-6 gap-2">
                   <Text className="text-slate-400 text-xs mb-2 uppercase font-bold tracking-wider">Ficha Técnica</Text>
                   {details?.developers && <RowInfo icon="code-slash" text={`Dev: ${details.developers.join(', ')}`} />}
                   {details?.publishers && <RowInfo icon="business" text={`Pub: ${details.publishers.join(', ')}`} />}
                   {details?.release_date && <RowInfo icon="calendar" text={`Lançamento: ${details.release_date.date}`} />}
                </View>
              </>
            )}

            <View className="mb-6">
              <Pressable 
                onPress={() => setIsAchievementsExpanded(!isAchievementsExpanded)}
                className="flex-row justify-between items-center bg-slate-800/40 p-3 rounded-lg active:bg-slate-800/60"
              >
                <View className="flex-row items-center gap-2">
                  <Text className="text-slate-100 text-lg font-semibold">Conquistas</Text>
                  <Ionicons name={isAchievementsExpanded ? "chevron-up" : "chevron-down"} size={20} color="#94a3b8" />
                </View>
                {totalAchievements > 0 && (
                  <Text className="text-emerald-400 text-sm font-bold">
                    {unlockedCount}/{totalAchievements} ({progressPercentage}%)
                  </Text>
                )}
              </Pressable>

              {isAchievementsExpanded && (
                <View className="mt-4">
                   {achievements.length > 0 ? (
                    <View className="bg-slate-800/50 rounded-xl p-4 gap-4">
                      {achievements.map((ach) => {
                        const isUnlocked = completedIds.includes(ach.id);
                        return (
                          <View key={ach.id} className="flex-row items-center gap-3">
                            <ExpoImage source={{ uri: ach.image }} className={`w-12 h-12 rounded-md ${isUnlocked ? '' : 'opacity-30 grayscale'}`} />
                            <View className="flex-1">
                              <Text className={`font-bold ${isUnlocked ? 'text-white' : 'text-slate-500'}`}>{ach.name}</Text>
                              <Text className="text-slate-400 text-xs" numberOfLines={2}>{ach.description}</Text>
                            </View>
                            {isUnlocked && <Ionicons name="checkmark-circle" size={20} color="#34d399" />}
                          </View>
                        );
                      })}
                    </View>
                  ) : (
                    <Text className="text-slate-500 italic px-2">
                       {loading ? "Carregando..." : "Nenhuma conquista disponível."}
                    </Text>
                  )}
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <AddToListModal
          visible={isListModalVisible}
          game={game}
          onClose={() => setListModalVisible(false)}
          onDone={handleListSuccess}
        />
      </View>
    </Modal>
  );
}

function RowInfo({ icon, text }: { icon: any, text: string }) {
  return (
    <View className="flex-row items-center mb-2 last:mb-0">
      <Ionicons name={icon} size={16} color="#64748b" />
      <Text className="text-slate-400 ml-3 text-xs flex-1" numberOfLines={1}>{text}</Text>
    </View>
  );
}