import { api } from '@/api/client';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, Link } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { View, Text, TextInput, Pressable } from 'react-native';

export default function LoginPage() {
  const { t } = useTranslation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit() {
    setError('');
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      });
      await login(data.token, data.user);
      router.replace('/(tabs)/map');
    } catch (err: any) {
      setError(err.message);
    }
  }

  return (
    <View className="relative flex-1 items-center justify-center bg-gray-900 p-5">
      <View className="absolute right-4 top-7">
        <LanguageSelector />
      </View>
      <View className="w-full max-w-sm rounded-2xl bg-gray-800 p-8">
        <Text className="mb-6 text-center text-2xl font-bold text-white">{t('login.title')}</Text>

        <TextInput
          value={identifier}
          onChangeText={setIdentifier}
          placeholder={t('login.inputPlaceholder')}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          className="mb-4 w-full rounded-xl border border-gray-600 bg-gray-700 p-3 text-white"
        />

        <View className="relative mb-4">
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder={t('login.passwordPlaceholder')}
            placeholderTextColor="#9ca3af"
            secureTextEntry={!showPassword}
            className="w-full rounded-xl border border-gray-600 bg-gray-700 p-3 pr-12 text-white"
          />
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-3.5">
            <Ionicons
              name={showPassword ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color="#9ca3af"
            />
          </Pressable>
        </View>

        {error && <Text className="mb-4 text-center text-sm text-red-400">{error}</Text>}

        <Pressable
          onPress={handleSubmit}
          className="w-full rounded-xl bg-purple-600 p-3 active:bg-purple-700">
          <Text className="text-center font-semibold text-white">{t('login.loginButton')}</Text>
        </Pressable>

        <Text className="mt-4 text-center text-sm text-gray-400">
          {t('login.dontHaveAccountMessage')}{' '}
          <Link href="/(auth)/register" asChild>
            <Text className="text-purple-400 underline">{t('login.register')}</Text>
          </Link>
        </Text>
      </View>
    </View>
  );
}
