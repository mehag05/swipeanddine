// app/(auth)/match-success.tsx
import { GOOGLE_PLACES_API_KEY } from '@env';
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';

export default function MatchSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { restaurantName, placeId, photoReference  } = params;

  const handleGetDirections = () => {
    // Open Google Maps with the place ID
    console.log()
    const query = encodeURIComponent(`${restaurantName}`);
  const mapsUrl = `https://www.google.com/maps/search/${query}`;
  Linking.openURL(mapsUrl);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Chef Icon */}
        <FontAwesome name="cutlery" size={60} color="#E75480" style={styles.chefIcon} />
        
        <Text style={styles.congratsText}>
          Congratulations! You matched with
        </Text>
        <Text style={styles.restaurantName}>
        {restaurantName || 'Ekta Indian Cuisine'}
        </Text>

        {/* Photos Container */}
        <View style={styles.photosContainer}>
          {/* Left Photo */}
          <View style={styles.photoFrameLeft}>
            <Image
              source={require('../../app/assets/images/bibble.jpg')}
              style={styles.photo}
            />
          </View>

          {/* Heart Icon */}
          <View style={styles.heartContainer}>
            <FontAwesome name="heart" size={40} color="#E75480" />
          </View>

          {/* Right Photo */}
          <View style={styles.photoFrameRight}>
          <Image
  source={{ 
    uri: photoReference 
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`
      : '/api/placeholder/400/400'
  }}
  style={styles.photo}
/>
          </View>
        </View>

        {/* Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
          style={styles.directionsButton}
          onPress={handleGetDirections}
          >
            <Text style={styles.directionsButtonText}>Get Directions</Text>
          </TouchableOpacity>

          <TouchableOpacity 
  style={styles.matchAgainButton}
  onPress={() => router.push('../components/Restaurant')}
>
  <Text style={styles.matchAgainButtonText}>Match Me Again</Text>
</TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    paddingTop: 60,
  },
  chefIcon: {
    marginBottom: 20,
  },
  congratsText: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 8,
  },
  restaurantName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#E75480',
    textAlign: 'center',
    marginBottom: 40,
  },
  photosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 60,
  },
  photoFrameLeft: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
    marginRight: -20,
  },
  photoFrameRight: {
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
    marginLeft: -20,
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  heartContainer: {
    zIndex: 1,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 10,
  },
  buttonContainer: {
    width: '100%',
    gap: 10,
  },
  directionsButton: {
    backgroundColor: '#E75480',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
  },
  directionsButtonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  matchAgainButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 10,
    width: '100%',
  },
  matchAgainButtonText: {
    color: '#000',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
  },
});