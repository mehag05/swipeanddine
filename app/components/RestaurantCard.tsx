import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Restaurant } from '../types/restaurant';
import { getPhotoUrl } from '../services/RestaurantService';

interface RestaurantCardProps {
  restaurant: Restaurant;
  onLike: () => void;
  onSkip: () => void;
}

export const RestaurantCard = ({ restaurant, onLike, onSkip }: RestaurantCardProps) => (
  <View style={styles.card}>
    {restaurant.photos?.[0]?.photo_reference ? (
      <Image
        source={{ uri: getPhotoUrl(restaurant.photos[0].photo_reference) }}
        style={styles.restaurantImage}
      />
    ) : (
      <View style={[styles.restaurantImage, { backgroundColor: '#f0f0f0' }]} />
    )}
    
    <View style={styles.restaurantInfo}>
      <Text style={styles.restaurantName}>{restaurant.name}</Text>
      
      <View style={styles.cuisineTag}>
        <Text style={styles.cuisineText}>{restaurant.cuisineCategory}</Text>
      </View>

      <Text style={styles.restaurantAddress}>{restaurant.vicinity}</Text>
    </View>

    <View style={styles.buttonContainer}>
      <TouchableOpacity 
        style={[styles.actionButton, styles.skipButton]}
        onPress={onSkip}
      >
        <Text style={styles.buttonText}>✕</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.actionButton, styles.likeButton]}
        onPress={onLike}
      >
        <Text style={styles.buttonText}>♥</Text>
      </TouchableOpacity>
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    flex: 1,
    margin: 0,
    padding: 0,
  },
  restaurantImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  restaurantInfo: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  restaurantName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  restaurantAddress: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: 8,
  },
  cuisineTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  cuisineText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    backgroundColor: 'white',
  },
  actionButton: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3.84,
    elevation: 5,
  },
  likeButton: {
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  skipButton: {
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  buttonText: {
    fontSize: 24,
  },
}); 