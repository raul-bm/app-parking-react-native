import { useEffect, useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, FlatList } from 'react-native';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { api } from '@/api/client';
import { useTranslation } from 'react-i18next';

export function SharePinSheet({ pinId, bottomSheetRef, onClose }: any) {
  const { t } = useTranslation();
  const [tab, setTab] = useState<'friends' | 'groups'>('friends');
  const [friends, setFriends] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [sharedUsers, setSharedUsers] = useState<Set<number>>(new Set());
  const [sharedGroups, setSharedGroups] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [friendsData, groupsData, pinsData] = await Promise.all([
          api('/friendships').catch(() => null),
          api('/groups').catch(() => null),
          api(`/pins/${pinId}`).catch(() => null),
        ]);
        if (friendsData !== null) setFriends(friendsData);
        if (groupsData !== null) setGroups(groupsData);
        setSharedUsers(
          new Set<number>((pinsData?.sharedWithUsers || []).map((s: any) => s.userId))
        );

        setSharedGroups(
          new Set<number>((pinsData?.sharedWithGroups || []).map((s: any) => s.groupId))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [pinId]);

  async function handleToggleUserShare(userId: number) {
    const isShared = sharedUsers.has(userId);

    try {
      if (isShared) {
        await api(`/pins/${pinId}/share/user/${userId}`, { method: 'DELETE' });
        setSharedUsers((prev) => {
          const next = new Set(prev);
          next.delete(userId);
          return next;
        });
      } else {
        await api(`/pins/${pinId}/share/user`, {
          method: 'POST',
          body: JSON.stringify({ userId: userId }),
        });
        setSharedUsers((prev) => new Set(prev).add(userId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleToggleGroupShare(groupId: number) {
    const isShared = sharedGroups.has(groupId);

    try {
      if (isShared) {
        await api(`/pins/${pinId}/share/group/${groupId}`, {
          method: 'DELETE',
        });
        setSharedGroups((prev) => {
          const next = new Set(prev);
          next.delete(groupId);
          return next;
        });
      } else {
        await api(`/pins/${pinId}/share/group`, {
          method: 'POST',
          body: JSON.stringify({ groupId }),
        });
        setSharedGroups((prev) => new Set(prev).add(groupId));
      }
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <BottomSheet ref={bottomSheetRef} index={-1} snapPoints={['60%']} enablePanDownToClose>
      <BottomSheetView className="p-4">
        <View className="mb-4 flex-row gap-2">
          <Pressable
            onPress={() => setTab('friends')}
            className={`flex-1 rounded-xl py-2 ${tab === 'friends' ? 'bg-purple-600' : 'bg-gray-700'}`}>
            <Text className="text-center text-white">{t('sharePin.friends')}</Text>
          </Pressable>
          <Pressable
            onPress={() => setTab('groups')}
            className={`flex-1 rounded-xl py-2 ${tab === 'groups' ? 'bg-purple-600' : 'bg-gray-700'}`}>
            <Text className="text-center text-white">{t('sharePin.groups')}</Text>
          </Pressable>
        </View>
        {loading ? (
          <ActivityIndicator />
        ) : tab === 'friends' ? (
          <FlatList
            data={friends}
            keyExtractor={(i) => String(i.id)}
            ListEmptyComponent={
              <Text className="py-8 text-center text-gray-500">{t('sharePin.noFriends')}</Text>
            }
            renderItem={({ item }) => {
              const is = sharedUsers.has(item.id);
              return (
                <View className="mb-2 flex-row justify-between rounded-lg bg-gray-700 px-3 py-2">
                  <View>
                    <Text className="text-white">@{item.username}</Text>
                    <Text className="text-xs text-gray-400">{item.realName}</Text>
                  </View>
                  <Pressable
                    onPress={() => handleToggleUserShare(item.id)}
                    className={`rounded-lg px-3 py-1 ${is ? 'bg-red-700' : 'bg-purple-600'}`}>
                    <Text className="text-xs text-white">
                      {is ? t('sharePin.stopSharingButton') : t('sharePin.shareButton')}
                    </Text>
                  </Pressable>
                </View>
              );
            }}
          />
        ) : (
          <FlatList
            data={groups}
            keyExtractor={(i) => String(i.id)}
            ListEmptyComponent={
              <Text className="py-8 text-center text-gray-500">{t('sharePin.noGroups')}</Text>
            }
            renderItem={({ item }) => {
              const is = sharedGroups.has(item.id);
              return (
                <View className="mb-2 flex-row justify-between rounded-lg bg-gray-700 px-3 py-2">
                  <View>
                    <Text className="text-white">{item.name}</Text>
                    <Text className="text-xs text-gray-400">
                      {item.members?.length} {t('sharePin.members')}
                    </Text>
                  </View>
                  <Pressable
                    onPress={() => handleToggleGroupShare(item.id)}
                    className={`rounded-lg px-3 py-1 ${is ? 'bg-red-700' : 'bg-purple-600'}`}>
                    <Text className="text-xs text-white">
                      {is ? t('sharePin.stopSharingButton') : t('sharePin.shareButton')}
                    </Text>
                  </Pressable>
                </View>
              );
            }}
          />
        )}
        <Pressable onPress={onClose} className="mt-4 rounded-xl bg-gray-700 p-3">
          <Text className="text-center text-white">Cerrar</Text>
        </Pressable>
      </BottomSheetView>
    </BottomSheet>
  );
}
