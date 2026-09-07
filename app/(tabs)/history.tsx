import { useAuth } from '@/context/AuthContext';
import { formatDate } from '@/utils/formatDate';
import { useEffect, useState, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, Text, View } from 'react-native';
import BottomSheet from '@gorhom/bottom-sheet';
import { useFocusEffect } from 'expo-router';
import { usePins } from '@/context/PinsContext';
import { PinDetailSheet } from '@/components/PinDetailSheet';
import MapPreview from '@/components/MapPreview';

export default function HistoryPage() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [selectedPin, setSelectedPin] = useState<any>(null);

  const bottomSheetRef = useRef<BottomSheet>(null);

  const { pins, refresh, removePin } = usePins();

  useEffect(() => {
    if (selectedPin) {
      requestAnimationFrame(() => bottomSheetRef.current?.expand());
    }
  }, [selectedPin]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const myPins = pins.filter((p: any) => p.ownerId === user?.id);

  async function handleDeletePin(pinId: number) {
    bottomSheetRef.current?.close();
    await removePin(pinId);
  }

  return (
    <>
      <View className="flex-1 bg-gray-900 p-4">
        <Text className="mb-4 mt-8 text-center text-2xl font-bold text-white">
          {t('nav.history')}
        </Text>

        <FlatList
          data={myPins}
          keyExtractor={(item) => String(item.id)}
          ListEmptyComponent={
            <Text className="mt-10 text-center text-gray-400">{t('history.noPins')}</Text>
          }
          contentContainerStyle={{ gap: 12 }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setSelectedPin(item)}
              className="flex-row items-center gap-4 rounded-2xl border border-gray-700 bg-gray-800 p-4">
              <View className="flex-1" pointerEvents="none">
                <Text className="text-xs text-gray-400">{formatDate(item.createdAt)}</Text>
                <Text className="mt-1 text-white" numberOfLines={1}>
                  {item.note || t('pinDetail.noNotes')}
                </Text>
              </View>
              <View pointerEvents="none">
                <MapPreview lat={item.lat} long={item.long} />
              </View>
            </Pressable>
          )}
        />

        <PinDetailSheet
          pin={selectedPin}
          onClose={() => setSelectedPin(null)}
          onDelete={handleDeletePin}
          bottomSheetRef={bottomSheetRef}
        />
      </View>
    </>
  );
}
