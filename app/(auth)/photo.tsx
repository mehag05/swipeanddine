// app/(auth)/photo.tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, StatusBar, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ProfilePhoto() {
  const router = useRouter();


  // onPress={() => router.push('/(screens)/home')}
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
        <Text style={styles.title}>Pick a profile</Text>
        <Text style={styles.title}>photo</Text>
        
        <View style={styles.photoContainer}>
          <View style={styles.photoFrame}>
            <Image
              source={{ uri: '/api/placeholder/400/400' }}
              style={styles.photoPreview}
            />
          </View>
          
          <Text style={styles.hint}>
            This is how it will appear in Swipe&Dine and you will not be able to change it
          </Text>
        </View>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonTextRed}>Choose from library</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonTextRed}>Take photo</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.cancelButton}>
            <Text style={styles.buttonTextGray}>Cancel</Text>
          </TouchableOpacity>
        </View>
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
  photoContainer: {
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  photoFrame: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 3,
    borderColor: '#FFD700',
    overflow: 'hidden',
    marginBottom: 20,
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  hint: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  buttonGroup: {
    marginTop: 'auto',
    marginBottom: 20,
    gap: 10,
  },
  button: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 5,
  },
  buttonTextRed: {
    color: '#E75480',
    fontSize: 16,
    fontWeight: '500',
  },
  buttonTextGray: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
});