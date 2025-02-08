import * as Location from 'expo-location';
import { LocationObject, LocationAccuracy } from 'expo-location';
import { Location as LocationType } from '../types/restaurant';

class LocationService {
  milesToMeters(miles: number): number {
    return miles * 1609.344;
  }

  async getCurrentLocation(): Promise<LocationType> {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        throw new Error('Location permission denied');
      }

      const location: LocationObject = await Location.getCurrentPositionAsync({
        accuracy: LocationAccuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
    } catch (error) {
      console.error('Error getting location:', error);
      throw error;
    }
  }

  async startLocationUpdates(
    onUpdate: (location: LocationType) => void,
    timeInterval: number = 5000
  ): Promise<() => void> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Location permission denied');
    }

    const subscription = await Location.watchPositionAsync(
      {
        accuracy: LocationAccuracy.High,
        timeInterval,
        distanceInterval: 100,
      },
      (location) => {
        onUpdate({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    );

    return () => subscription.remove();
  }
}

export default new LocationService();
