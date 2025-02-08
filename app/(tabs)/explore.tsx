import { View, Text, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function ExploreScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Explore Screen</Text>
      <Button title="Budget Screen" onPress={() => router.push('/(screens)/budget')} />
    </View>
  );
}