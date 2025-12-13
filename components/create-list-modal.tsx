// components/create-list-modal.tsx
import { Button, ButtonText } from '@/components/ui/button';
import { Input, InputField } from '@/components/ui/input';
import { Toast, ToastDescription, ToastTitle, useToast } from '@/components/ui/toast';
import { createList } from '@/services/lists';
import React, { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import ColorPicker, { HueSlider, Panel1, Preview } from 'reanimated-color-picker';

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated?: (id: number) => void;
}

export const CreateListModal: React.FC<Props> = ({ visible, onClose, onCreated }) => {
  const toast = useToast();
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🎮');
  const [color, setColor] = useState<string>('#1E90FF');
  const [submitting, setSubmitting] = useState(false);

  const showToast = (title: string, description: string, action: 'success' | 'error') => {
    toast.show({
      placement: 'top',
      duration: 3000,
      render: ({ id }) => (
        <Toast nativeID={`toast-${id}`} action={action} variant="solid">
          <ToastTitle>{title}</ToastTitle>
          <ToastDescription>{description}</ToastDescription>
        </Toast>
      ),
    });
  };

  const reset = () => {
    setName('');
    setIcon('🎮');
    setColor('#1E90FF');
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast('Dados inválidos', 'Informe um nome para a lista.', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const res = await createList({ name: name.trim(), icon: icon.trim(), color });
      showToast('Lista criada', 'Sua lista foi criada com sucesso!', 'success');
      onClose();
      reset();
      onCreated?.(res.data.id);
    } catch (e: any) {
      const msg = e?.response?.data?.message || 'Erro ao criar lista.';
      showToast('Falhou', msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType={Platform.OS === 'web' ? undefined : 'fade'}
      onRequestClose={onClose}
    >
      {/* overlay */}
      <Pressable className="flex-1 bg-black/50 justify-center items-center px-5" onPress={onClose}>
        {/* container do modal */}
        <Pressable
          onPress={(e) => e.stopPropagation()}
          className="w-full max-w-md rounded-2xl bg-vapor-primary border border-slate-700/30"
          style={{ maxHeight: 600 }} 
        >
          {/* header */}
          <View className="p-4 pb-2">
            <Text className="text-slate-100 text-lg font-semibold">Nova lista</Text>
            <Text className="text-slate-400 text-xs">Defina nome, emoji e escolha uma cor.</Text>
          </View>

          {/* área rolável (apenas o conteúdo do meio rola) */}
          <View className="flex-1 min-h-0 px-4">
            <ScrollView
              bounces={false}
              contentContainerStyle={{ paddingBottom: 12 }}
              showsVerticalScrollIndicator={false}
            >
              {/* Nome */}
              <Text className="text-slate-200 text-xs mb-1 mt-3">Nome *</Text>
              <Input className="rounded-xl bg-slate-800/70 border border-slate-700/50 mb-3">
                <InputField
                  value={name}
                  onChangeText={setName}
                  placeholder="Ex.: Favoritos"
                  placeholderTextColor="#94a3b8"
                  className="text-slate-100 h-12"
                />
              </Input>

              {/* Ícone */}
              <Text className="text-slate-200 text-xs mb-1">Ícone (emoji)</Text>
              <Input className="rounded-xl bg-slate-800/70 border border-slate-700/50 mb-3">
                <InputField
                  value={icon}
                  onChangeText={setIcon}
                  placeholder="Ex.: 🎮"
                  placeholderTextColor="#94a3b8"
                  className="text-slate-100 h-12"
                  maxLength={2}
                  autoCapitalize="none"
                />
              </Input>

              {/* Cor */}
              <Text className="text-slate-200 text-xs mb-2">Cor</Text>
              <View className="rounded-xl border border-slate-700/50 bg-slate-800/50 mb-3 p-3">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center">
                    <Text className="text-2xl mr-2">{icon || '🎮'}</Text>
                    <Text className="text-slate-100 font-medium">{name || 'Nova lista'}</Text>
                  </View>
                  <View className="w-6 h-6 rounded-full border border-slate-600" style={{ backgroundColor: color }} />
                </View>

                {/* diminuí a altura dos componentes do color picker */}
                <ColorPicker
                  value={color}
                  onComplete={(c: any) => setColor(c?.hex ?? color)}
                  style={{ width: '100%' }}
                >
                  <Preview style={{ height: 28, borderRadius: 8 }} />
                  <Panel1 style={{ marginTop: 8, height: 120, borderRadius: 12 }} />
                  <HueSlider style={{ marginTop: 8, height: 22, borderRadius: 12 }} />
                </ColorPicker>
              </View>
            </ScrollView>
          </View>

          {/* footer (fica sempre visível) */}
          <View className="flex-row justify-end gap-2 p-4 pt-2 border-t border-slate-700/30">
            <Button
              variant="outline"
              className="rounded-xl border-slate-600/50 bg-slate-700/30"
              onPress={onClose}
              isDisabled={submitting}
            >
              <ButtonText className="text-slate-200">Cancelar</ButtonText>
            </Button>
            <Button className="rounded-xl bg-blue-700" onPress={handleCreate} isDisabled={submitting}>
              <ButtonText className="text-white">{submitting ? 'Criando…' : 'Criar'}</ButtonText>
            </Button>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};
