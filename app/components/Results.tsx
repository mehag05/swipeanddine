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
    <TouchableOpacity style={styles.button} onPress={onRestart}>
      <Text style={styles.buttonText}>Couldn't find one... Start New Search</Text>
    </TouchableOpacity>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    justifyContent: 'center', // Center content vertically
    alignItems: 'center', // Center content horizontally
  },
  title: {
    fontSize: 24,
    marginTop: 30,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  
  button: {
    backgroundColor: '#EA4080',
    padding: 15,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    width: '80%', // Set the button width to a percentage or fixed value
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center', // Ensure text inside button is centered
  },
});

export default Results;
