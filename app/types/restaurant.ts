export interface Restaurant {
    id: string;
    name: string;
    types: string[];
    photos?: { photo_reference: string }[];
    photoUrl: string | null;
    vicinity: string;
    location_id: string;
    location: {
        lat: number;
        lng: number;
      };
    address: string;
    cuisineCategory?: string;
    distance: number;
    rating?: number;
    price_level?: number;
    place_id: string;
  }
  
  export interface Location {
    latitude: number;
    longitude: number;
  }
  
  export interface CuisineMatch {
    option1: string;
    option2: string;
  }
  
  export type GameStage = 'start' | 'cuisine' | 'restaurant' | 'budget';

  export interface RestaurantResponse {
    results: Restaurant[];
    status: string;
  }