import { useState, useEffect } from 'react';
import PlacesService from '../services/PlacesService';
import { Restaurant } from '../types/restaurant';

interface UseNearbyRestaurantsReturn {
  restaurants: Restaurant[];
  loading: boolean;
  error: string | null;
  refetch: (miles: number) => Promise<void>;
}

export const useNearbyRestaurants = (radiusInMiles: number = 5): UseNearbyRestaurantsReturn => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRestaurants = async (miles: number): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      const results = await PlacesService.getNearbyRestaurants(miles);
      setRestaurants(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRestaurants(radiusInMiles);
  }, [radiusInMiles]);

  return {
    restaurants,
    loading,
    error,
    refetch: fetchRestaurants
  };
};
