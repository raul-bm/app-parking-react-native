import { api } from '@/api/client';
import LanguageSelector from '@/components/LanguageSelector';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, Text, TextInput, View } from 'react-native';

export default function RegisterPage() {
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [realName, setRealName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  async function handleSubmit() {
    setError('');

    try {
      await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ email, password, username, realName }),
      });

      router.replace('/(auth)/login');
    } catch (err: any) {
      setError(err.message);
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  return (
    <View className="relative flex-1 items-center justify-center bg-gray-900 p-5">
      <View className="absolute right-4 top-7">
        <LanguageSelector />
      </View>
      <View className="w-full max-w-sm rounded-2xl bg-gray-800 p-8">
        <Text className="mb-6 text-center text-2xl font-bold text-white">
          {t('register.title')}
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder={t('register.emailPlaceholder')}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          className="mb-4 w-full rounded-xl border border-gray-600 bg-gray-700 p-3 text-white"
        />
        {!emailRegex.test(email) && (
          <Text className="mb-4 text-center text-xs text-red-400">
            {t('register.invalidEmailFormat')}
          </Text>
        )}
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder={t('register.usernamePlaceholder')}
          placeholderTextColor="#9ca3af"
          autoCapitalize="none"
          className="mb-4 w-full rounded-xl border border-gray-600 bg-gray-700 p-3 text-white"
        />
        <TextInput
          value={realName}
          onChangeText={setRealName}
          placeholder={t('register.realNamePlaceholder')}
          placeholderTextColor="#9ca3af"
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
          className={`w-full rounded-xl p-3 font-semibold ${email === '' || !emailRegex.test(email) ? 'bg-purple-900' : 'bg-purple-600'}`}>
          <Text
            className={`text-center ${email === '' || !emailRegex.test(email) ? 'text-gray-500' : 'text-white'}`}>
            {t('register.registerButton')}
          </Text>
        </Pressable>

        <Text className="mt-4 text-center text-sm text-gray-400">
          {t('register.alreadyHaveAccountMessage')}{' '}
          <Link href="/(auth)/login" asChild>
            <Text className="text-purple-400 underline">{t('register.login')}</Text>
          </Link>
        </Text>
      </View>
    </View>
  );
}
