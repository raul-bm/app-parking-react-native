import { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import i18n from '../i18n';

const languages = [
  { code: 'es', label: 'nav.spanish' },
  { code: 'en', label: 'nav.english' },
  { code: 'val', label: 'nav.valencian' },
];

export default function LanguageSelector() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const currentLang = i18n.language.startsWith('es')
    ? 'es'
    : i18n.language.startsWith('val')
      ? 'val'
      : 'en';

  return (
    <View>
      <Pressable
        onPress={() => setOpen(true)}
        className={`rounded-3xl p-2 ${open ? 'bg-gray-700' : ''}`}
        hitSlop={8}>
        <Ionicons name="language-outline" size={22} color="#9ca3af" />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1">
          <Pressable className="absolute inset-0" onPress={() => setOpen(false)} />
          <View className="absolute right-4 top-12 w-44 overflow-hidden rounded-xl border border-gray-700 bg-gray-800">
            {languages.map((lang) => {
              const isActive = currentLang === lang.code;
              return (
                <Pressable
                  key={lang.code}
                  onPress={() => {
                    i18n.changeLanguage(lang.code);
                  }}
                  className={`flex-row items-center justify-between px-4 py-3 ${isActive ? 'bg-gray-700' : 'active:bg-gray-700'}`}>
                  <Text
                    className={`text-sm ${isActive ? 'font-semibold text-purple-400' : 'text-gray-300'}`}>
                    {t(lang.label)}
                  </Text>
                  {isActive && <Ionicons name="checkmark" size={18} color="#a78bfa" />}
                </Pressable>
              );
            })}
          </View>
        </View>
      </Modal>
    </View>
  );
}
