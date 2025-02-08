import React from 'react';
import { View, Text, ScrollView, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Restaurant } from '../types/restaurant';
import { getPhotoUrl } from '../services/RestaurantService';

interface ResultsProps {
  likedRestaurants: Restaurant[];
  onRestart: () => void;
}

export const Results = ({ likedRestaurants, onRestart }: ResultsProps) => (
  <View style={styles.container}>
    <Text style={styles.title}>Your Matches</Text>
    <ScrollView style={styles.scrollView}>
      {likedRestaurants.map((restaurant) => (
        <View key={restaurant.id} style={styles.restaurantCard}>
          {restaurant.photos?.[0]?.photo_reference && (
            <Image
              source={{ uri: getPhotoUrl(restaurant.photos[0].photo_reference) }}
              style={styles.thumbnail}
            />
          )}
          <View style={styles.restaurantInfo}>
            <Text style={styles.restaurantName}>{restaurant.name}</Text>
            <Text style={styles.cuisineTag}>{restaurant.cuisineCategory}</Text>
            <Text style={styles.address}>{restaurant.vicinity}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
    <TouchableOpacity style={styles.button} onPress={onRestart}>
      <Text style={styles.buttonText}>Start New Search</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  scrollView: {
    flex: 1,
  },
  restaurantCard: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  restaurantInfo: {
    flex: 1,
    padding: 12,
  },
  restaurantName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cuisineTag: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  address: {
    fontSize: 14,
    color: '#888',
  },
  button: {
    backgroundColor: '#FF6B6B',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default Results;