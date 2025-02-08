import React from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import Slider from '@react-native-community/slider';
import { GameStage } from '../types/restaurant';

interface RadiusSelectorProps {
  searchRadius: number;
  setSearchRadius: (radius: number) => void;
  startGame: () => void;
}

export const RadiusSelector = ({ searchRadius, setSearchRadius, startGame }: RadiusSelectorProps) => (
  <View style={styles.container}>
    <Text style={styles.question}>How far are you willing to travel?</Text>
    <Text style={styles.radiusText}>{(searchRadius / 1000).toFixed(1)} km</Text>
    <Slider
      style={styles.slider}
      minimumValue={1000}
      maximumValue={20000}
      value={searchRadius}
      onValueChange={setSearchRadius}
      minimumTrackTintColor="#FF6B6B"
      maximumTrackTintColor="#ddd"
    />
    <Button title="Find Restaurants" onPress={startGame} />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
  },
  question: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  radiusText: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  slider: {
    width: '100%',
    height: 40,
    marginBottom: 20,
  },
}); 