import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import styles from './styles'; 

const FeelingScreen = () => {
  const [selectedFeeling, setSelectedFeeling] = useState(String);

  const feelings = [
    "HEALTHY",
    "SWEET",
    "INDULGENT",
    "SAVORY",
    "WARM",
    "COLD",
    "I DON'T KNOW!",
  ];

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton}>
        <Text style={styles.backArrow}>←</Text>
      </TouchableOpacity>
      <Text style={styles.title}>I'm feeling</Text>
      {feelings.map((feeling, index) => (
        <TouchableOpacity
          key={index}
          style={[
            styles.feelingButton,
            selectedFeeling === feeling && styles.selectedFeelingButton,
          ]}
          onPress={() => setSelectedFeeling(feeling)}
        >
          <Text
            style={[
              styles.feelingText,
              selectedFeeling === feeling && styles.selectedFeelingText,
            ]}
          >
            {feeling}
          </Text>
        </TouchableOpacity>
      ))}
      <TouchableOpacity
        style={[
          styles.continueButton,
          !selectedFeeling && styles.disabledButton,
        ]}
        disabled={!selectedFeeling}
      >
        <Text style={styles.buttonText}>CONTINUE</Text>
      </TouchableOpacity>
    </View>
  );
};

export default FeelingScreen;
