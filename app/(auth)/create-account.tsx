// app/(auth)/create-account.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function CreateAccount() {
  const router = useRouter();

  const handleBudget = () => {
    // router.push('../(screens)/budget')
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Create New Account</Text>
      
      <View style={styles.content}>
        <FontAwesome name="cutlery" size={80} color="#E75480" style={styles.icon} />
        <Text style={styles.oopsText}>Oops!</Text>
        <Text style={styles.message}>
          We couldn't find a Swipe&Dine account connected to that Facebook Account.
        </Text>
        
        <TouchableOpacity style={styles.createButton} onPress={handleBudget} >
          <Text style={styles.buttonText}>CREATE NEW ACCOUNT</Text>
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
  backButton: {
    padding: 20,
  },
  backButtonText: {
    color: '#000',
    fontSize: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 20,
  },
  oopsText: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  message: {
    textAlign: 'center',
    color: '#666',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 40,
  },
  createButton: {
    backgroundColor: '#E75480',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    width: '100%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});