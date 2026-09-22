import { Stack, useRouter, useSegments } from 'expo-router';
import { useEffect } from 'react';
import { View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import '../global.css';
import '../src/i18n';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PinsProvider } from '@/context/PinsContext';

function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    const isAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !isAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (isAuthenticated && isAuthGroup) {
      router.replace('/(tabs)/map' as any);
    }
  }, [isAuthenticated, loading, segments]);

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white">Loading...</Text>
      </View>
    );
  }

  return <Stack screenOptions={{ headerShown: false }} />;
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#111827' }}>
      <SafeAreaProvider style={{ flex: 1, backgroundColor: '#111827' }}>
        <AuthProvider>
          <PinsProvider>
            <ProtectedLayout />
            <StatusBar hidden style="light" />
          </PinsProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
