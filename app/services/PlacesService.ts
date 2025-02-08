import LocationService from './LocationService';
import { Restaurant, RestaurantResponse, Location } from '../types/restaurant';
import { GOOGLE_PLACES_API_KEY } from '@env';

class PlacesService {
  private apiKey: string;
  private baseUrl: string;
  private locationService: typeof LocationService;

  constructor() {
    this.apiKey = GOOGLE_PLACES_API_KEY;
    this.baseUrl = 'https://maps.googleapis.com/maps/api/place';
    this.locationService = LocationService;
  }

  async getNearbyRestaurants(miles: number = 5): Promise<Restaurant[]> {
    try {
      const location = await this.locationService.getCurrentLocation();
      const radiusInMeters = this.locationService.milesToMeters(miles);

      const response = await fetch(
        `${this.baseUrl}/nearbysearch/json?` +
        `location=${location.latitude},${location.longitude}&` +
        `radius=${radiusInMeters}&` +
        `type=restaurant&` +
        `key=${this.apiKey}`
      );

      const data: RestaurantResponse = await response.json();

      if (data.status !== 'OK') {
        throw new Error(data.status);
      }

      return this.processRestaurants(data.results, location);
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      throw error;
    }
  }
  private processRestaurants(restaurants: any[], userLocation: Location): Restaurant[] {
    return restaurants.map((restaurant: any) => ({
      id: restaurant.place_id,
      name: restaurant.name,
      rating: restaurant.rating,
      priceLevel: restaurant.price_level,
      types: restaurant.types,
      photoUrl: restaurant.photos?.[0] 
        ? this.getPhotoUrl(restaurant.photos[0].photo_reference)
        : null,
      vicinity: restaurant.vicinity,
      location: restaurant.geometry.location,
      location_id: restaurant.place_id,
      address: restaurant.formatted_address,
      distance: restaurant.distance,
      place_id: restaurant.place_id,
    }));
  }

  private getPhotoUrl(photoReference: string): string {
    return `${this.baseUrl}/photo?maxwidth=400&photo_reference=${photoReference}&key=${this.apiKey}`;
  }
}

export default new PlacesService();
