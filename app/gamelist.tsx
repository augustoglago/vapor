// app/gamelist.tsx - CÓDIGO FINAL E ESTÁVEL

import { Header } from '@/components/header';
import { getGames } from '@/services/games';
import { Game } from '@/types';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, Text, View } from 'react-native';

// ... (GameItem componente) ...
const GameItem = ({ game }: { game: Game }) => {
    return (
        <View 
            className="m-1 rounded-xl overflow-hidden shadow-lg border border-slate-700/30"
            style={{ width: '31%', aspectRatio: 1 / 1.3 }} 
        >
            <Image
                source={{ uri: game.capsuleImageUrl }} 
                contentFit="cover"
                className="w-full h-full"
            />
        </View>
    );
};


export default function GameListScreen() {
    // Estados visuais
    const [games, setGames] = useState<Game[]>([]);
    const [loading, setLoading] = useState(false); // Indicador de carregamento no rodapé
    const [refreshing, setRefreshing] = useState(false); // Indicador de "pull to refresh"
    const [searchString, setSearchString] = useState(''); // Estado para o Input

    // Refs de controle (NÃO disparam re-render)
    const nextCursorRef = useRef<number | undefined>(undefined);
    const searchStringRef = useRef('');
    const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isLoadingRef = useRef(false); // Ref para controle síncrono do estado de carregamento

    // --- Função Central de Busca (ESTÁVEL e Robusta) ---
    // Array de dependências vazio: A função NUNCA muda.
    const fetchGamesData = useCallback(async (
        isInitialLoad = false, // True para a primeira carga/refresh/busca
        isRefresh = false,
        searchParam: string | undefined = undefined // Termo de busca passado explicitamente
    ) => {
        // --- 1. Determinação de Parâmetros e Prevenção de Chamadas Duplicadas ---
        const currentSearch = searchParam !== undefined ? searchParam : searchStringRef.current;
        const cursor = (isInitialLoad || isRefresh || currentSearch) ? undefined : nextCursorRef.current;
        
        // Previne chamadas se a busca por cursor não tiver mais páginas
        if (!cursor && !isInitialLoad && !isRefresh && !currentSearch) {
            return;
        }

        // Usa a Ref para controle síncrono do carregamento
        if (isLoadingRef.current) return;
        
        isLoadingRef.current = true;

        // --- 2. Inicia os Indicadores Visuais ---
        // Aqui usamos as funções de setState, que dispararão o re-render
        if (isRefresh) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

        try {
            // --- 3. Chamada da API ---
            const result = await getGames({ cursor, search: currentSearch || undefined });

            // --- 4. Atualização do Estado de Jogos (Chave para evitar loop) ---
            setGames(prevGames => {
                // Se for carga inicial, refresh ou busca, substitui
                if (isInitialLoad || isRefresh || currentSearch) {
                    return result.data;
                }
                // Se for paginação (onEndReached), anexa
                return [...prevGames, ...result.data];
            });

            // Atualiza o cursor usando a Ref
            nextCursorRef.current = result.cursor;

        } catch (error) {
            console.error('Falha na requisição de jogos:', error);
            // Em caso de erro, resetamos o cursor para evitar nova tentativa imediata
            if (isInitialLoad || isRefresh || currentSearch) {
                setGames([]); // Limpa a lista em caso de falha na primeira carga/busca
            }
        } finally {
            // --- 5. Finaliza o Carregamento ---
            setLoading(false);
            setRefreshing(false);
            isLoadingRef.current = false; // Permite a próxima chamada
        }
    }, []); // Array de dependências VAZIO: A função NUNCA muda!

    // --- Efeito de Inicialização (Chama fetchGamesData apenas no Mount) ---
    useEffect(() => {
        // Agora, fetchGamesData é estável e só é chamado uma vez no mount.
        fetchGamesData(true);
        // O return é para a limpeza do timer de debounce, que será movido para cá:
        return () => {
             if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [fetchGamesData]); 

    // Função de Busca (Lógica de Debounce)
    const handleSearchChange = useCallback((text: string) => {
        setSearchString(text);
        searchStringRef.current = text; 

        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        // Debounce: Atraso de 500ms antes de disparar a busca
        searchTimeoutRef.current = setTimeout(() => {
            // Sempre é uma carga inicial com o termo de busca
            fetchGamesData(true, false, text); 
        }, 500);

    }, [fetchGamesData]); 

    // Função de Carregar Mais (Paginação)
    const handleLoadMore = () => {
        // Se a busca estiver ativa OU não houver um cursor, OU já estiver carregando, pare.
        if (searchStringRef.current || nextCursorRef.current === undefined || loading || refreshing || isLoadingRef.current) {
            return;
        }
        
        fetchGamesData(false); // Não é carga inicial nem refresh
    };

    // Função para renderizar o footer (indicador de carregamento)
    const renderFooter = () => {
        if (!loading) return null; // Apenas mostra o loading se não for refreshing
        return (
            <View className="py-4 justify-center items-center">
                <ActivityIndicator size="large" color="#e2e8f0" />
            </View>
        );
    };
    
    // ... (ListEmptyComponent)

    return (
        <View className="flex-1 bg-vapor-primary">
            {/* Header com a barra de busca */}
            <Header 
                searchString={searchString} 
                onSearchChange={handleSearchChange} 
            />

            {/* Listagem de Jogos */}
            <FlatList
                data={games}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => <GameItem game={item} />}
                numColumns={3}
                columnWrapperStyle={{ justifyContent: 'space-between', marginHorizontal: 8, marginVertical: 4 }}
                className="pt-2"
                
                // Paginação
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}

                // Refresh (Puxar para atualizar)
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        // Sempre é carga inicial + refresh
                        onRefresh={() => fetchGamesData(true, true)}
                        tintColor="#e2e8f0" 
                    />
                }

                // Footer de carregamento
                ListFooterComponent={renderFooter}
                
                // Tela de lista vazia
                ListEmptyComponent={() => {
                    if (loading || refreshing) return null;
                    return (
                        <View className="flex-1 justify-center items-center p-8">
                            <Text className="text-slate-400 text-lg text-center">
                                {searchStringRef.current
                                    ? 'Nenhum jogo encontrado para a sua busca.'
                                    : 'Nenhum jogo disponível no momento.'
                                }
                            </Text>
                        </View>
                    );
                }}
            />
        </View>
    );
}