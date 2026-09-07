import { formatDate } from '@/utils/formatDate';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, View } from 'react-native';
import { Map, Camera, Marker } from '@maplibre/maplibre-react-native';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/api/client';
import { Ionicons } from '@expo/vector-icons';
import { TextInput } from 'react-native';

type Pin = {
  id: number;
  ownerId: number;
  lat: number;
  long: number;
  note: string | null;
  createdAt: string;
  owner?: { realName: string } | null;
};

type Props = {
  pin: Pin | null;
  onClose: () => void;
  onDelete?: (id: number) => void;
  onUpdate?: (id: number, p: Pin) => void;
  onShare?: (pin: Pin) => void;
  bottomSheetRef: React.RefObject<any>;
};

export function PinDetailSheet({
  pin,
  onClose,
  onDelete,
  onUpdate,
  onShare,
  bottomSheetRef,
}: Props) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editNote, setEditNote] = useState('');
  const [currentNote, setCurrentNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    setCurrentNote(pin?.note ?? '');
    setEditNote(pin?.note ?? '');
    setEditing(false);
  }, [pin?.id, pin?.note]);

  const isOwner = String(user?.id) === String(pin?.ownerId);

  async function handleSaveNote() {
    if (!pin) return null;
    setSaving(true);
    try {
      const updated = await api(`/pins/${pin.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ note: editNote }),
      });
      setCurrentNote(editNote);
      onUpdate?.(pin.id, updated);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update note', err);
    } finally {
      setSaving(false);
    }
  }

  function handleCancelEdit() {
    setEditNote(currentNote || '');
    setEditing(false);
  }

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
        {!pin ? null : (
          <>
            <View className="mb-4 flex items-start justify-between">
              <Text className="text-2xl font-bold text-white">{t('pinDetail.title')}</Text>
            </View>
            <View className="mb-4 h-60 w-full overflow-hidden rounded-xl border border-gray-600">
              <Map
                style={{ flex: 1 }}
                mapStyle="https://tiles.openfreemap.org/styles/liberty"
                dragPan={true}
                touchZoom={true}>
                <Camera center={[Number(pin.long), Number(pin.lat)]} zoom={12} />
                <Marker lngLat={[Number(pin.long), Number(pin.lat)]}>
                  <View
                    style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'red' }}
                  />
                </Marker>
              </Map>
            </View>
            {isOwner && onShare && (
              <Pressable
                onPress={() => console.log('Share')}
                className="my-2 w-full rounded-xl bg-purple-600 py-3">
                <Text className="text-center font-medium text-white">
                  {t('pinDetail.shareButton')}
                </Text>
              </Pressable>
            )}
            <View className="mb-4">
              <Text className="text-sm text-gray-500">{t('pinDetail.createdBy')}</Text>
              <Text className="font-medium text-white">
                {pin.owner?.realName || t('pinDetail.unknown')}
              </Text>
            </View>
            <View className="mb-4">
              <View className="flex-row">
                <Text className="mr-4 text-sm text-gray-500">{t('pinDetail.note')}</Text>
                {!editing && isOwner && (
                  <Pressable
                    onPress={() => {
                      setEditNote(currentNote || '');
                      setEditing(true);
                    }}>
                    <Ionicons name="pencil-outline" size={18} color="#9ca3af"></Ionicons>
                  </Pressable>
                )}
              </View>
              {editing ? (
                <View className="mt-1 gap-2">
                  <TextInput
                    value={editNote}
                    onChangeText={setEditNote}
                    multiline
                    numberOfLines={3}
                    placeholder={t('pinDetail.addNote')}
                    placeholderTextColor="#6b7280"
                    autoFocus
                    editable={!saving}
                    textAlignVertical="top"
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 px-3 py-2 text-sm text-white"
                    style={{ minHeight: 70 }}
                  />
                  <View className="flex-row justify-end gap-2">
                    <Pressable
                      onPress={handleCancelEdit}
                      disabled={saving}
                      className="rounded-lg bg-gray-700 px-3 py-1.5 disabled:opacity-50">
                      <Text className="text-xs font-medium text-gray-400">
                        {t('pinDetail.cancelEditNote')}
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={handleSaveNote}
                      disabled={saving}
                      className="rounded-lg bg-purple-600 px-3 py-1.5 disabled:opacity-50">
                      <Text className="text-xs font-medium text-white">
                        {saving ? t('pinDetail.savingEditNote') : t('pinDetail.saveEditNote')}
                      </Text>
                    </Pressable>
                  </View>
                </View>
              ) : (
                <Text className="mt-1 text-white">{currentNote || t('pinDetail.noNotes')}</Text>
              )}
            </View>
            <View>
              <Text className="text-sm text-gray-500">{t('pinDetail.createdAt')}</Text>
              <Text className="text-white">{formatDate(pin.createdAt)}</Text>
            </View>

            {onDelete && (
              <Pressable
                onPress={() => pin && onDelete(pin.id)}
                className="mt-4 rounded-xl bg-red-600 p-3">
                <Text className="text-center font-bold text-white">{t('pinDetail.deletePin')}</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => bottomSheetRef.current?.close()}
              className="mt-2 rounded-xl bg-gray-700 p-3">
              <Text className="text-center text-white">Cerrar</Text>
            </Pressable>
          </>
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}
