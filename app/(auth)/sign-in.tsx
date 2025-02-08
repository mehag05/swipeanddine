import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';

export default function SignIn() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <FontAwesome name="cutlery" size={80} color="white" style={styles.logo} />
          <Text style={styles.title}>Swipe&Dine</Text>
        </View>
        
        <Text style={styles.disclaimer}>
          By tapping Create Account or Sign In, you agree to our{' '}
          <Text style={styles.link}>Terms of Service</Text> and{' '}
          <Text style={styles.link}>Privacy Policy</Text>
        </Text>
        
        <TouchableOpacity 
          style={styles.signInButton}
          onPress={() => router.push('/(screens)/home')}
        >
          <Text style={styles.signInButtonText}>SIGN IN WITH PHONE NUMBER</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.troubleButton}>
          <Text style={styles.troubleText}>Trouble Signing In?</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E75480',
  },
  backButton: {
    padding: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 24,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 30,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logo: {
    marginBottom: 20,
  },
  title: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
  },
  disclaimer: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 30,
    opacity: 0.8,
    lineHeight: 20,
  },
  link: {
    textDecorationLine: 'underline',
  },
  signInButton: {
    backgroundColor: 'white',
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
  signInButtonText: {
    color: '#E75480',
    textAlign: 'center',
    fontWeight: 'bold',
    fontSize: 16,
  },
  troubleButton: {
    marginTop: 20,
    padding: 10,
  },
  troubleText: {
    color: 'white',
    opacity: 0.9,
  },
});