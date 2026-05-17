import { ActivityIndicator, View } from 'react-native';
import { Redirect } from 'expo-router';
import { useAuth } from '@/context/auth';

export default function App() {
  const { authInitialized, user } = useAuth();

  if (!authInitialized) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#ff5c02" />
      </View>
    );
  }

  return <Redirect href={user ? '/(tabs)/home' : '/sign-in'} />;
}
