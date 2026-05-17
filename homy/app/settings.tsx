import { Redirect } from 'expo-router';
export default function SettingsRootRedirect() {
  return <Redirect href="/(tabs)/settings" />;
}
