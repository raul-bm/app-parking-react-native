import { formatDate } from '@/utils/formatDate';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';

export function PinDetailSheet({ pin, onClose, onDelete, bottomSheetRef }: any) {
  const { t } = useTranslation();
  if (!pin) return null;
  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={['50%']}
      enablePanDownToClose
      enableContentPanningGesture={false}
      enableHandlePanningGesture={true}
      backdropComponent={(p: any) => (
        <BottomSheetBackdrop
          {...p}
          appearsOnIndex={0}
          disappearsOnIndex={-1}
          opacity={0.5}
          pressBehavior="close"
        />
      )}
      onClose={onClose}
      backgroundStyle={{ backgroundColor: '#1f2937' }}
      handleIndicatorStyle={{ backgroundColor: '#4b5563' }}>
      <BottomSheetView className="p-6">
        <View className="mb-4 h-48 w-full overflow-hidden rounded-xl border border-gray-600">
          <Map
            style={{ flex: 1 }}
            mapStyle="https://tiles.openfreemap.org/styles/liberty"
            dragPan={true}
            touchZoom={true}>
            <Camera center={[Number(pin.long), Number(pin.lat)]} zoom={16} />
            <Marker lngLat={[Number(pin.long), Number(pin.lat)]}>
              <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'red' }} />
            </Marker>
          </Map>
        </View>
        <Text className="text-lg text-white">{pin.note || t('pinDetail.noNotes')}</Text>
        <Text className="mt-2 text-sm text-gray-400">
          {pin.lat}, {pin.long}
        </Text>
        <Text className="mt-1 text-xs text-gray-400">{formatDate(pin.createdAt)}</Text>
        {onDelete && (
          <Pressable
            onPress={() => pin && onDelete(pin.id)}
            className="mt-4 rounded-xl bg-red-600 p-3">
            <Text className="text-center text-white">{t('pinDetail.delete')}</Text>
          </Pressable>
        )}
        <Pressable
          onPress={() => bottomSheetRef.current?.close()}
          className="mt-2 rounded-xl bg-gray-700 p-3">
          <Text className="text-center text-white">Cerrar</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
