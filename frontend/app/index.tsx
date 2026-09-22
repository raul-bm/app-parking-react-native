import { useAuth } from '@/context/AuthContext';
import { Redirect } from 'expo-router';
import { Text, View } from 'react-native';

export default function Index() {
  const { isAuthenticated, loading } = useAuth();
  if (loading)
    return (
      <View className="flex-1 items-center justify-center bg-gray-900">
        <Text className="text-white">Loading...</Text>
      </View>
    );

  return <Redirect href={isAuthenticated ? '/(tabs)/map' : '/(auth)/login'} />;
}
