import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import LocationService from '../services/LocationService';
import PlacesService from '../services/PlacesService';
import { Location, Restaurant } from '../types/restaurant';
import { GOOGLE_PLACES_API_KEY } from '@env';

export default function RestaurantTest() {
  const [location, setLocation] = useState<Location | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [error, setError] = useState<string | null>(null);

  const testLocation = async () => {
    try {
      const userLocation = await LocationService.getCurrentLocation();
      setLocation(userLocation);
      console.log('Current location:', userLocation);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location error');
      console.error('Location error:', err);
    }
  };

  const testRestaurants = async () => {
    try {
      const results = await PlacesService.getNearbyRestaurants(5); // 5 miles radius
      setRestaurants(results);
      console.log('Restaurants found:', results.length);
      console.log('First restaurant:', results[0]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restaurant fetch error');
      console.error('Restaurant error:', err);
    }
  };

  const testAPI = async () => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=37.7749,-122.4194&radius=1500&type=restaurant&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();
      console.log('API Response:', data);
    } catch (error) {
      console.error('API Error:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Button title="Test Location" onPress={testLocation} />
      <Button title="Test Restaurants" onPress={testRestaurants} />
      <Button title="Test API" onPress={testAPI} />
      
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
      
      {location && (
        <Text>
          Location: {location.latitude}, {location.longitude}
        </Text>
      )}
      
      <Text>Restaurants found: {restaurants.length}</Text>
    </View>
  );
}
