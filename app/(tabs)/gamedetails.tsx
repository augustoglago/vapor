// app/(tabs)/gamedetails.tsx
import { Button, ButtonText } from '@/components/ui/button'; // Usando seus componentes de UI
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { Game } from "@/types";
// Supondo que você tenha serviços para buscar listas e adicionar jogos
// import { getLists, addGameToList, removeGameFromList } from '@/services/lists'; 
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";

interface GameDetailsProps {
  visible: boolean;
  onClose: () => void;
  game: Game | null; 
}

// Interface auxiliar para a lista dentro deste componente
interface UserList {
  id: number;
  name: string;
  icon: string;
  color: string;
  hasGame?: boolean; // Propriedade para saber se o jogo já está na lista
}

export default function GameDetails({
  visible,
  onClose,
  game,
}: GameDetailsProps) {
  const toast = useToast();
  const slideAnim = useRef(new Animated.Value(0)).current;
  
  // Estados para gerenciar as listas
  const [lists, setLists] = useState<UserList[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);
  const [processingId, setProcessingId] = useState<number | null>(null); // Para o loading do botão específico

  // Animação de entrada/saída
  useEffect(() => {
    if (visible) {
      // Quando abrir, busca as listas
      fetchUserLists();
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const showToast = (title: string, msg: string, action: 'success' | 'error') => {
    toast.show({
      placement: 'top',
      duration: 3000,
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action={action} variant="solid">
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{msg}</ToastDescription>
        </Toast>
      ),
    });
  };

  // Simulação de busca de dados (Substitua pela sua chamada real à API getLists)
  const fetchUserLists = async () => {
    setLoadingLists(true);
    try {
      // const response = await getLists(); 
      // setLists(response.data);
      
      // MOCK PARA EXEMPLO (Remova isso e use sua API real)
      await new Promise(r => setTimeout(r, 800)); // Fake delay
      setLists([
        { id: 1, name: 'Favoritos', icon: '⭐', color: '#FFD700', hasGame: false },
        { id: 2, name: 'Zerados', icon: '🏆', color: '#00FF7F', hasGame: true },
        { id: 3, name: 'Backlog', icon: '📚', color: '#1E90FF', hasGame: false },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingLists(false);
    }
  };

  // Função para adicionar/remover jogo da lista
  const toggleGameInList = async (list: UserList) => {
    if (!game) return;
    setProcessingId(list.id);

    try {
      if (list.hasGame) {
        // await removeGameFromList(list.id, game.id);
        // Simulação:
        await new Promise(r => setTimeout(r, 500));
        showToast('Removido', `${game.name} foi removido de ${list.name}.`, 'success');
      } else {
        // await addGameToList(list.id, game.id);
        // Simulação:
        await new Promise(r => setTimeout(r, 500));
        showToast('Salvo', `${game.name} adicionado em ${list.name}!`, 'success');
      }

      // Atualiza o estado local para refletir a mudança instantaneamente
      setLists(prev => prev.map(l => 
        l.id === list.id ? { ...l, hasGame: !l.hasGame } : l
      ));

    } catch (e) {
      showToast('Erro', 'Não foi possível atualizar a lista.', 'error');
    } finally {
      setProcessingId(null);
    }
  };

  if (!game) return null;

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0], // Sobe de baixo para cima
  });

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Fundo escuro */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)" }} />
      </TouchableWithoutFeedback>

      {/* Drawer */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          height: "85%",
          backgroundColor: "#1B2838",
          borderTopLeftRadius: 18,
          borderTopRightRadius: 18,
          transform: [{ translateY }],
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            padding: 16,
            paddingBottom: 40,
          }}
        >
          {/* Banner */}
          <View className="mb-3 rounded-lg overflow-hidden">
            <Image
              source={{ uri: game.capsuleImageUrl }}
              style={{
                width: "100%",
                height: 180,
                resizeMode: "cover",
              }}
            />
          </View>

          {/* Título */}
          <Text className="text-3xl font-bold mb-4 text-white">{game.name}</Text>
          
          <View className="p-3 bg-gray-800 rounded-lg mb-6">
            <Text className="text-slate-400 text-sm">
                Informações detalhadas indisponíveis na API, por enquanto.
            </Text>
          </View>

          {/* --- NOVA SEÇÃO: SALVAR EM LISTAS --- */}
          <View className="border-t border-slate-700/50 pt-4">
            <Text className="text-slate-200 text-lg font-semibold mb-3">
              Salvar em uma lista
            </Text>

            {loadingLists ? (
              <View className="py-4 items-center">
                <ActivityIndicator color="#1E90FF" />
                <Text className="text-slate-500 text-xs mt-2">Carregando listas...</Text>
              </View>
            ) : lists.length === 0 ? (
              <Text className="text-slate-500 text-sm">Você ainda não criou nenhuma lista.</Text>
            ) : (
              <View className="gap-3">
                {lists.map((list) => (
                  <View 
                    key={list.id} 
                    className="flex-row items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/30"
                  >
                    {/* Info da Lista */}
                    <View className="flex-row items-center gap-3">
                      <View className="w-10 h-10 rounded-full items-center justify-center bg-slate-900/50 border border-slate-700">
                        <Text className="text-lg">{list.icon}</Text>
                      </View>
                      <View>
                        <Text className="text-slate-200 font-medium">{list.name}</Text>
                        <View className="flex-row items-center gap-1">
                          <View className={`w-2 h-2 rounded-full`} style={{ backgroundColor: list.color }} />
                          <Text className="text-slate-500 text-xs">
                            {list.hasGame ? 'Jogo salvo' : 'Toque para salvar'}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Botão de Ação */}
                    <Button
                      size="sm"
                      variant={list.hasGame ? "solid" : "outline"}
                      action={list.hasGame ? "positive" : "primary"}
                      className={`h-9 px-4 rounded-lg ${
                        list.hasGame 
                          ? 'bg-green-600/20 border-green-600/50' 
                          : 'bg-slate-700/30 border-slate-600/50'
                      }`}
                      onPress={() => toggleGameInList(list)}
                      isDisabled={processingId === list.id}
                    >
                      {processingId === list.id ? (
                        <ActivityIndicator size="small" color={list.hasGame ? "#4ade80" : "#94a3b8"} />
                      ) : (
                        <ButtonText className={list.hasGame ? "text-green-400" : "text-slate-200"}>
                          {list.hasGame ? "Salvo" : "Adicionar"}
                        </ButtonText>
                      )}
                    </Button>
                  </View>
                ))}
              </View>
            )}
          </View>
          {/* --- FIM DA SEÇÃO --- */}

        </ScrollView>

        {/* Botão Fechar */}
        <Pressable
          onPress={onClose}
          style={{
            alignSelf: "center",
            paddingVertical: 10,
            marginBottom: 20,
          }}
        >
          <Text className="text-blue-400 text-lg font-semibold">Fechar</Text>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}