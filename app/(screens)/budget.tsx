import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import styles from './styles'; 
import { LinearGradient } from 'react-native-linear-gradient';
import { useRouter } from 'expo-router';

const BudgetScreen = () => {
  const router = useRouter();
  const [budget, setBudget] = useState('');

  const handleContinue = () => {
    if (Number(budget) > 0) {
      router.push('/(screens)/mood')
    }
  };

  const handleBack = () => {
    router.back();
  };


  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>My budget is</Text>
      <TextInput
        style={styles.input}
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
        onPress={handleContinue}
      >
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BudgetScreen;