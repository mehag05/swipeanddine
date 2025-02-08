import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles'; 
const BudgetScreen = () => {
  const [budget, setBudget] = useState('');

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My budget is</Text>
      <TextInput
        style={styles.input}
        placeholder="____ ____ ____ ____"
        keyboardType="numeric"
        value={budget}
        onChangeText={setBudget}
        placeholderTextColor="#ccc"
      />
      <Text style={styles.description}>
        This is how we will filter the restaurants around you.
      </Text>
      <TouchableOpacity
        style={[styles.continueButton, !budget && styles.disabledButton]}
        disabled={!budget}
      >
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BudgetScreen;
