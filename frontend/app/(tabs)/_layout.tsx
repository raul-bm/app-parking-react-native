import { useAuth } from '@/context/AuthContext';
import i18n from '@/i18n';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, Text, View } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const { user, logout } = useAuth();
  const router = useRouter();
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [showLangs, setShowLangs] = useState(false);

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#1f2937',
            borderTopColor: '#374151',
            borderTopWidth: 1,
            marginBottom: 0,
            paddingBottom: insets.bottom,
            paddingTop: 4,
            height: 58 + insets.bottom,
          },
          tabBarLabelStyle: {
            fontSize: RFValue(8.5),
            fontWeight: 600,
          },
          tabBarActiveTintColor: '#a78bfa',
          tabBarInactiveTintColor: '#6b7280',
        }}>
        <Tabs.Screen
          name="map"
          options={{
            title: t('nav.map'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="map-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: t('nav.history'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="friends"
          options={{
            title: t('nav.friends'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="groups"
          options={{
            title: t('nav.groups'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="people-circle-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="shared-with-me"
          options={{
            title: t('nav.pins-shared'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="share-social-outline" color={color} size={size} />
            ),
          }}
        />

        <Tabs.Screen
          name="options"
          options={{
            title: t('nav.options'),
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="settings-outline" color={color} size={size} />
            ),
          }}
          listeners={{
            tabPress: (e) => {
              e.preventDefault();
              setOptionsVisible(true);
            },
          }}
        />
      </Tabs>

      <Modal
        visible={optionsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setOptionsVisible(false)}>
        <Pressable className="flex-1" onPress={() => setOptionsVisible(false)}>
          <View className="absolute bottom-20 right-4 w-52 overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
            {!showLangs ? (
              <>
                <Text className="flex-row items-center gap-3 px-4 py-3 text-center text-lg font-bold text-gray-300">
                  @{user?.username}
                </Text>
                <Pressable
                  onPress={() => setShowLangs(true)}
                  className="flex-row items-center gap-3 px-4 py-3">
                  <Ionicons name="language-outline" size={20} color="#d1d5db" />
                  <Text className="flex-1 text-gray-300">{t('nav.languages')}</Text>
                  <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                </Pressable>
                <Pressable
                  onPress={async () => {
                    await logout();
                    setOptionsVisible(false);
                    router.replace('/(auth)/login');
                  }}
                  className="flex-row items-center gap-3 px-4 py-3">
                  <Ionicons name="log-out-outline" size={20} color="#d1d5db" />
                  <Text className="text-gray-300">{t('nav.logout')}</Text>
                </Pressable>
              </>
            ) : (
              <>
                {[
                  { code: 'es', label: 'nav.spanish' },
                  { code: 'en', label: 'nav.english' },
                  { code: 'val', label: 'nav.valencian' },
                ].map((lang) => (
                  <Pressable
                    key={lang.code}
                    onPress={() => {
                      i18n.changeLanguage(lang.code);
                    }}
                    className="flex-row justify-between px-4 py-3">
                    <Text className="text-gray-300">{t(lang.label)}</Text>
                    {i18n.language.startsWith(lang.code) && (
                      <Ionicons name="checkmark" size={18} color="#a78bfa" />
                    )}
                  </Pressable>
                ))}
                <Pressable
                  onPress={() => setShowLangs(false)}
                  className="flex-row items-center gap-2 border-t border-gray-700 px-4 py-3">
                  <Ionicons name="arrow-back" size={16} color="#9ca3af" />
                  <Text className="text-gray-300">{t('nav.back')}</Text>
                </Pressable>
              </>
            )}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}
