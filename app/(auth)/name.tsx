// app/(auth)/name.tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function NameInput() {
  const router = useRouter();
  const [name, setName] = useState('');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity 
        style={styles.closeButton}
        onPress={() => router.back()}
      >
        <Text style={styles.closeButtonText}>×</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <Text style={styles.title}>My first</Text>
        <Text style={styles.title}>name is</Text>
        
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder=""
          autoFocus
          autoCapitalize="words"
        />
        
        <Text style={styles.hint}>
          This is how it will appear in Swipe&Dine and you will not be able to change it
        </Text>
        
        <TouchableOpacity 
          style={[styles.continueButton, !name && styles.continueButtonDisabled]}
          disabled={!name}
          onPress={() => router.push('/(screens)/home')}
        >
          <LinearGradient
            colors={['#FFB75E', '#E75480']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradient}
          >
            <Text style={[styles.continueButtonText, !name && styles.continueButtonTextDisabled]}>
              CONTINUE
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  closeButton: {
    padding: 20,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    fontSize: 32,
    color: '#000',
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingTop: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 42,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E75480',
    paddingVertical: 10,
    marginTop: 20,
    marginBottom: 10,
  },
  hint: {
    color: '#666',
    fontSize: 14,
  },
  continueButton: {
    borderRadius: 25,
    overflow: 'hidden',
    marginTop: 40,
  },
  continueButtonDisabled: {
    opacity: 0.7,
  },
  gradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  continueButtonTextDisabled: {
    opacity: 0.7,
  },
});