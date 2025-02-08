import React, { useState, useEffect } from 'react';
import { View, Text, Button, Image, StyleSheet, Dimensions } from 'react-native';
import { GOOGLE_PLACES_API_KEY } from '@env';
import CuisineService from '../services/CuisineService';
import OpenAIService from '../services/OpenAIService';
import * as Location from 'expo-location';
import Slider from '@react-native-community/slider';
const { width } = Dimensions.get('window');

interface Restaurant {
  name: string;
  types: string[];
  photos?: { photo_reference: string }[];
  vicinity: string;
  location_id: string;
  address: string;
  cuisineCategory?: string;
  distance: number;
  rating?: number;
  price_level?: number;
  place_id: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

interface CuisineMatch {
  option1: string;
  option2: string;
}

export default function RestaurantTest() {
  const [gameStage, setGameStage] = useState<'start' | 'cuisine' | 'restaurant'>('start');
  const [cuisineChoices, setCuisineChoices] = useState<string[]>([]);
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [currentRestaurantIndex, setCurrentRestaurantIndex] = useState(0);
  const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(1500); // Default 1.5km (~1 mile)
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [currentMatch, setCurrentMatch] = useState<CuisineMatch | null>(null);
  const [winningCuisines, setWinningCuisines] = useState<string[]>([]);
  const [tournamentRound, setTournamentRound] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');

  useEffect(() => {
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      setLocationError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      console.log('Current location:', {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });
      setUserLocation(location);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationError('Could not get your location');
    }
  };

  const generateSearchGrid = (centerLat: number, centerLng: number, radius: number) => {
    const points = [];
    const gridSize = Math.ceil(radius / 35000); // 35km to ensure overlap
    const latStep = (radius / 111320) / gridSize; // Convert meters to degrees
    const lngStep = (radius / (111320 * Math.cos(centerLat * (Math.PI / 180)))) / gridSize;

    for (let i = -gridSize; i <= gridSize; i++) {
      for (let j = -gridSize; j <= gridSize; j++) {
        const lat = centerLat + (i * latStep);
        const lng = centerLng + (j * lngStep);
        
        // Check if this point is within our search radius
        const distance = calculateDistance(centerLat, centerLng, lat, lng);
        if (distance <= radius) {
          points.push({ lat, lng });
        }
      }
    }

    console.log(`Generated ${points.length} search points in grid`);
    return points;
  };

  const fetchRestaurantsInArea = async (lat: number, lng: number, radius: number) => {
    let allResults: any[] = [];
    let nextPageToken = null;
    const maxAttempts = 3; // Get up to 3 pages

    try {
      do {
        const pageParam: string = nextPageToken ? `&pagetoken=${nextPageToken}` : '';
        const response: any = await fetch(
          `https://maps.googleapis.com/maps/api/place/nearbysearch/json?` +
          `location=${lat},${lng}&` +
          `radius=${Math.min(50000, radius)}&` +
          `type=restaurant&` +
          `key=${GOOGLE_PLACES_API_KEY}${pageParam}`
        );
        
        const data = await response.json();
        
        if (data.results) {
          allResults = [...allResults, ...data.results];
          console.log(`Fetched ${data.results.length} restaurants`);
        }
        
        nextPageToken = data.next_page_token;
        
        if (nextPageToken) {
          // Google requires a delay between pagination requests
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } while (nextPageToken && allResults.length < 60);

      return allResults;
    } catch (error) {
      console.error('Fetch Error:', error);
      return [];
    }
  };

  const startGame = async () => {
    setIsLoading(true);
    try {
      if (!userLocation) {
        setLocationError('Location not available');
        return;
      }

      const centerLat = userLocation.coords.latitude;
      const centerLng = userLocation.coords.longitude;
      
      // Generate grid of search points
      const searchPoints = generateSearchGrid(centerLat, centerLng, searchRadius);
      
      // Fetch from all points
      let allResults: any = [];
      const seenPlaceIds = new Set();
      
      setLoadingStatus(`Searching ${searchPoints.length} areas for restaurants...`);
      
      for (let i = 0; i < searchPoints.length; i++) {
        const point = searchPoints[i];
        setLoadingStatus(`Searching area ${i + 1} of ${searchPoints.length}...`);
        
        const results = await fetchRestaurantsInArea(point.lat, point.lng, searchRadius);
        
        // Log raw results
        console.log(`Area ${i + 1} found ${results.length} restaurants`);
        results.forEach(r => {
          console.log(`Restaurant: ${r.name}, Types: ${r.types?.join(', ')}`);
        });

        // Deduplicate results using place_id
        results.forEach(restaurant => {
          if (!seenPlaceIds.has(restaurant.place_id)) {
            seenPlaceIds.add(restaurant.place_id);
            allResults.push(restaurant);
          }
        });
      }

      console.log('Total unique restaurants:', allResults.length);

      // Use CuisineService for categorization
      setLoadingStatus('Categorizing restaurants...');
      const cuisineMap = CuisineService.categorizeBatch(allResults);

      // Log cuisine distribution
      const cuisineDistribution: { [key: string]: number } = {};
      cuisineMap.forEach((cuisine, placeId) => {
        cuisineDistribution[cuisine] = (cuisineDistribution[cuisine] || 0) + 1;
      });
      console.log('Cuisine Distribution:', cuisineDistribution);

      // Store categorized restaurants
      const categorizedRestaurants = allResults.map((restaurant: Restaurant) => {
        const cuisine = cuisineMap.get(restaurant.place_id);
        console.log(`Categorized ${restaurant.name} as ${cuisine}`);
        return {
          ...restaurant,
          cuisineCategory: cuisine
        };
      });
      // Filter out 'Other' category
      const validRestaurants = categorizedRestaurants.filter((r: Restaurant) => r.cuisineCategory !== 'Other');
      console.log('Valid restaurants after filtering:', validRestaurants.length);

      // Get unique cuisines
      const uniqueCuisines = Array.from(new Set(validRestaurants.map((r: Restaurant) => r.cuisineCategory)))
        .filter(Boolean);
      console.log('Final unique cuisines:', uniqueCuisines);

      if (uniqueCuisines.length >= 2) {
        setRestaurants(validRestaurants);
        setAvailableCuisines(uniqueCuisines as string[]);
        setWinningCuisines(uniqueCuisines as string[]);
        setCurrentMatch({
          option1: uniqueCuisines[0] as string,
          option2: uniqueCuisines[1] as string
        });
        setGameStage('cuisine');
        setTournamentRound(1);
      } else {
        setLocationError('Not enough variety of restaurants found. Try increasing the search radius.');
      }

    } catch (error) {
      console.error('Error in startGame:', error);
      setLocationError('Error fetching restaurants');
    } finally {
      setIsLoading(false);
      setLoadingStatus('');
    }
  };

  const startNewRound = (cuisines: string[]) => {
    if (cuisines.length <= 1) {
      // Tournament is complete, move to restaurant selection
      setSelectedCuisine(cuisines[0]);
      setGameStage('restaurant');
      return;
    }

    // Get next pair of cuisines
    const shuffled = [...cuisines].sort(() => 0.5 - Math.random());
    setCurrentMatch({
      option1: shuffled[0],
      option2: shuffled[1]
    });
    setTournamentRound(prev => prev + 1);
  };

  const selectWinner = (winner: string) => {
    const updatedWinners = winningCuisines.filter(c => 
      c === winner || (c !== currentMatch?.option1 && c !== currentMatch?.option2)
    );
    setWinningCuisines(updatedWinners);

    if (updatedWinners.length <= 1) {
      // Tournament complete - show restaurants of winning cuisine
      const winningRestaurants = restaurants.filter((r: any) => r.cuisineCategory === winner);
      setFilteredRestaurants(winningRestaurants);
      setCurrentRestaurantIndex(0);
      setGameStage('restaurant');
    } else {
      startNewRound(updatedWinners);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  const selectCuisine = (cuisine: string) => {
    setSelectedCuisine(cuisine);
    const matchingRestaurants = restaurants.filter((r: any) => r.cuisineCategory === cuisine);
    setRestaurants(matchingRestaurants);
    setCurrentRestaurantIndex(0);
    setGameStage('restaurant');
  };

  const getPhotoUrl = (photoReference: string) => {
    return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
  };

  const currentRestaurant = restaurants[currentRestaurantIndex];

  const formatDistance = (meters: number) => {
    const miles = meters / 1609.34; // Convert meters to miles
    return `${miles.toFixed(1)} miles`;
  };

  const renderStartScreen = () => (
    <View style={styles.container}>
      <Text style={styles.title}>Restaurant Finder</Text>
      
      {locationError ? (
        <Text style={styles.errorText}>{locationError}</Text>
      ) : !userLocation ? (
        <Text>Getting your location...</Text>
      ) : (
        <Text style={styles.locationText}>
          We'll find the restaurants around you.
        </Text>
      )}
      
      <View style={styles.radiusContainer}>
        <Text style={styles.radiusLabel}>
          Search Radius: {formatDistance(searchRadius)}
        </Text>
        <Slider
          style={styles.slider}
          minimumValue={800}      // 0.5 miles
          maximumValue={50000}    // About 31 miles (max Google Places radius)
          value={searchRadius}
          onValueChange={setSearchRadius}
          minimumTrackTintColor="#DA291C"
          maximumTrackTintColor="#F3D677"
          step={1609}  // 1 mile increments
        />
        <View style={styles.sliderLabels}>
          <Text>0.5 mi</Text>
          <Text>31 mi</Text>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {loadingStatus || 'Loading...'}
          </Text>
          <Text style={styles.loadingSubtext}>
            This may take a minute while we analyze all restaurants in your area
          </Text>
        </View>
      ) : (
        <Button 
          title="Find Restaurants" 
          onPress={startGame}
          disabled={!userLocation || !!locationError}
        />
      )}
    </View>
  );

  const renderCuisineChoice = () => (
    <View style={styles.container}>
      {currentMatch && (
        <>
          <Text style={styles.question}>Which cuisine do you prefer?</Text>
          <Text style={styles.roundInfo}>Round {tournamentRound}</Text>
          <View style={styles.matchupContainer}>
            <View style={styles.cuisineOption}>
              <Button
                title={currentMatch.option1}
                onPress={() => selectWinner(currentMatch.option1)}
              />
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.cuisineOption}>
              <Button
                title={currentMatch.option2}
                onPress={() => selectWinner(currentMatch.option2)}
              />
            </View>
          </View>
          <Text style={styles.remainingInfo}>
            {winningCuisines.length} cuisines remaining
          </Text>
        </>
      )}
    </View>
  );

  const renderRestaurantList = () => (
    <View style={styles.container}>
      <Text style={styles.title}>
        {filteredRestaurants.length} {winningCuisines[0]} Restaurants Found
      </Text>
      
      {filteredRestaurants.length > 0 ? (
        <View style={styles.restaurantContainer}>
          {currentRestaurantIndex < filteredRestaurants.length && (
            <View style={styles.card}>
              {filteredRestaurants[currentRestaurantIndex].photos?.[0]?.photo_reference && (
                <Image
                  source={{
                    uri: `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${filteredRestaurants[currentRestaurantIndex].photos[0].photo_reference}&key=${GOOGLE_PLACES_API_KEY}`
                  }}
                  style={styles.restaurantImage}
                />
              )}
              
              <View style={styles.restaurantInfo}>
                <Text style={styles.restaurantName}>
                  {filteredRestaurants[currentRestaurantIndex].name}
                </Text>
                <Text style={styles.restaurantAddress}>
                  {filteredRestaurants[currentRestaurantIndex].address}
                </Text>
                {filteredRestaurants[currentRestaurantIndex].rating && (
                  <Text style={styles.rating}>
                    Rating: {filteredRestaurants[currentRestaurantIndex].rating} ⭐️
                  </Text>
                )}
                {filteredRestaurants[currentRestaurantIndex].price_level && (
                  <Text style={styles.price}>
                    {filteredRestaurants[currentRestaurantIndex].price_level}
                  </Text>
                )}
              </View>

              <View style={styles.buttonContainer}>
                <Button 
                  title="👎 Skip" 
                  onPress={() => setCurrentRestaurantIndex(i => i + 1)}
                />
                <Button 
                  title="👍 Like" 
                  onPress={() => {
                    // Handle liked restaurant
                    console.log('Liked:', filteredRestaurants[currentRestaurantIndex].name);
                  }}
                />
              </View>
            </View>
          )}

          {currentRestaurantIndex >= filteredRestaurants.length && (
            <View style={styles.endMessage}>
              <Text>No more restaurants to show!</Text>
              <Button title="Start Over" onPress={() => setGameStage('start')} />
            </View>
          )}
        </View>
      ) : (
        <View style={styles.noResults}>
          <Text>No restaurants found for this cuisine.</Text>
          <Button title="Try Again" onPress={() => setGameStage('start')} />
        </View>
      )}
    </View>
  );

  switch (gameStage) {
    case 'start':
      return renderStartScreen();
    case 'cuisine':
      return renderCuisineChoice();
    case 'restaurant':
      return renderRestaurantList();
    default:
      return null;
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#f4f4f4', // Soft background color
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333', // Darker color for text
  },
  question: {
    fontSize: 20,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  choicesContainer: {
    width: '100%',
    gap: 10,
  },
  card: {
    width: width - 40,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  address: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  radiusContainer: {
    width: '90%', // Adjusted width for better proportion
    marginVertical: 20,
    alignItems: 'center',
    backgroundColor: '#fff', // Added background for contrast
    padding: 15,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  radiusLabel: {
    fontSize: 18,
    marginBottom: 10,
    fontWeight: 'bold',
    color: '#333', // Darker label color for readability
  },
  slider: {
    width: '100%',
    height: 40,
    marginVertical: 15,
    borderRadius: 10, // Smooth slider
  },
  sliderTrack: {
    height: 10,
    borderRadius: 5,
    backgroundColor: '#ddd', // Light track background
  },
  sliderThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#F3D677', // Thumb color for contrast
  },
  sliderLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    color: '#333',
  },
  valueLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  matchupContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginVertical: 20,
  },
  cuisineOption: {
    flex: 1,
    margin: 10,
  },
  vsText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginHorizontal: 10,
    color: '#333',
  },
  roundInfo: {
    fontSize: 16,
    marginBottom: 10,
    color: '#333',
  },
  remainingInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 20,
  },
  restaurantContainer: {
    flex: 1,
    width: '100%',
    padding: 20,
  },
  restaurantImage: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 10,
  },
  restaurantInfo: {
    marginBottom: 15,
  },
  restaurantName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  restaurantAddress: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  rating: {
    fontSize: 16,
    color: '#f4c430',
    marginBottom: 5,
  },
  price: {
    fontSize: 16,
    color: '#2e8b57',
  },
  endMessage: {
    alignItems: 'center',
    marginTop: 20,
  },
  noResults: {
    alignItems: 'center',
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    marginVertical: 10,
  },
  locationText: {
    marginVertical: 10,
    color: '#666',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    marginBottom: 10,
  },
  loadingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 20,
  },
});