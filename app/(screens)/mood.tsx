import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles'; 
import { router } from 'expo-router';

const FeelingScreen = () => {
  const [selectedFeelings, setSelectedFeelings] = useState([]);

  const feelings = [
    "HEALTHY",
    "SWEET",
    "INDULGENT",
    "SAVORY",
    "WARM",
    "COLD",
    "I DON'T KNOW!",
  ];

  const toggleFeeling = (feeling) => {
    setSelectedFeelings((prevState) => {
      if (prevState.includes(feeling)) {
        return prevState.filter(item => item !== feeling); // Deselect feeling
      } else {
        return [...prevState, feeling]; // Select feeling
      }
    });
  };
  
  const handleBack = () => {
    router.back();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={handleBack}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>I'm feeling</Text>
      {feelings.map((feeling, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.feelingButton,
            selectedFeelings.includes(feeling) && styles.selectedFeelingButton,
          ]}
          onPress={() => toggleFeeling(feeling)}
        >
          <Text
            style={[
              styles.feelingText,
              selectedFeelings.includes(feeling) && styles.selectedFeelingText,
            ]}
          >
            {feeling}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.continueButton,
          selectedFeelings.length === 0 && styles.disabledButton,
        ]}
        disabled={selectedFeelings.length === 0}
      >
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FeelingScreen;
